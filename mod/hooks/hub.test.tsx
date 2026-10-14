import { expect, mock, test } from 'claude-code/testing'
import type { Engine, Plugin } from 'claude-code/testing'
import type { On } from 'claude-code'

import type { Learning, ReflectActArgs, ReflectActResult, ReflectCatalogEntry, ReflectItem, ReflectPanel, ReflectPanelArgs } from '../types'

const VOID = { value: undefined } as never
const ok = (value: unknown) => ({ value }) as never
const ARGS = { surface: 'terminal', columns: 80 } as const
const NOW = Date.parse('2026-10-02T12:00:00Z')

// The test's `$` carries no plugin noun: only a module that calls one can. This plugin stands in for
// the /mods hub: a call of its tool is a call on `$.reflect`, the answer handed back as the result.
const PROBE = 'mcp__mods-hub-stand-in__probe'
const HUB: Plugin = {
  name: 'mods-hub-stand-in',
  register: on => {
    on('tool.call', { tool: 'mcp__mods-hub-stand-in__probe' }, async ($, e) => {
      const call = e as unknown as { method: 'panel' | 'act' | 'catalog'; args: never }
      const value =
        call.method === 'act' ? await $.reflect.act(call.args) : call.method === 'catalog' ? await $.reflect.catalog(call.args) : await $.reflect.panel(call.args)
      return { result: JSON.stringify(value) }
    })
  },
}

async function probe($: Engine, method: 'panel' | 'act' | 'catalog', args: unknown): Promise<unknown> {
  const answer = (await $.tool.call({ tool: PROBE, method, args } as never)) as { result?: unknown }
  return JSON.parse(String(answer.result))
}

const hub = {
  panel: ($: Engine, args: ReflectPanelArgs) => probe($, 'panel', args) as Promise<ReflectPanel>,
  act: ($: Engine, args: ReflectActArgs) => probe($, 'act', args) as Promise<ReflectActResult>,
  catalog: ($: Engine, args: ReflectPanelArgs) => probe($, 'catalog', args) as Promise<ReflectCatalogEntry[]>,
}

const learning = (id: string, rule: string, scope: Learning['scope'], extra: Partial<Learning> = {}): Learning => ({
  id,
  rule,
  scope,
  project: '/repo',
  count: 1,
  firstAt: NOW - 60_000,
  lastAt: NOW - 60_000,
  status: 'pending',
  confidence: 0.9,
  ...extra,
})

const PNPM = learning('pnpm', 'Use pnpm, not npm, in this repo', 'project', { count: 2 })
const ENGLISH = learning('english', 'Answer in English', 'global')

// The user's store, shared by every session: a map the test reads and writes as another session would.
function world(on: On, seed: Record<string, unknown> = {}, opts: { verdict?: object; root?: () => string } = {}) {
  const store = new Map<string, unknown>(Object.entries(structuredClone(seed)))
  const files: Record<string, string> = {}
  const asked: string[] = []
  const models: string[] = []
  const filled: string[] = []
  const commands: string[] = []
  const clock = mock.clock(on, { now: NOW })
  mock.env(on, { HOME: '/home/u' })
  on('store.get', async (_$, e) => ok(structuredClone(store.get(e.key))))
  on('store.set', async (_$, e) => {
    store.set(e.key, structuredClone(e.value))
    return VOID
  })
  on('model.complete', async (_$, e) => {
    asked.push(/<user_message>([\s\S]*)<\/user_message>/.exec(e.prompt)?.[1] ?? '')
    models.push(e.model ?? '')
    return ok({ isAnswered: true, text: JSON.stringify(opts.verdict ?? { is_rule: false, rule: '', scope: 'global', confidence: 0.9 }), usage: {} })
  })
  on('session.messages', async () => ok([]))
  on('session.root', async () => ok(opts.root?.() ?? '/repo'))
  on('fs.exists', async (_$, e) => ok(e.path in files))
  on('fs.read', async (_$, e) => ok(files[e.path] ?? ''))
  on('fs.write', async (_$, e) => {
    files[e.path] = e.text
    return VOID
  })
  on('prompt.read', async () => ok({ text: '', cursor: 0 }))
  on('prompt.fill', async (_$, e) => {
    filled.push(e.text)
    return { isFilled: true } as never
  })
  on('command.register', async (_$, e) => {
    commands.push(e.name)
    return ok({ command: e.name })
  })
  on('ui.toast', async () => VOID)
  on('ui.render', async () => ({ type: 'Box', props: {}, children: [] }) as never)
  on('session.start', async () => ({ cwd: '/repo' }) as never)
  on('prompt.submit', async (_$, e) => ({ text: e.text }))
  on('prompt.compose', async () => ({ sections: [] }))
  const items = () => (store.get('items') ?? []) as Learning[]
  return { store, files, asked, models, filled, commands, clock, items }
}

const start = ($: Engine) => $.session.start({ source: 'startup', cwd: '/repo', surface: 'terminal', isInteractive: true } as never)
const say = async ($: Engine, w: { clock: { settle: () => Promise<void> } }, text: string) => {
  await $.prompt.submit({ text, origin: { kind: 'composer' }, wait: false } as never)
  await w.clock.settle()
}
const section = (p: ReflectPanel, id: string): ReflectItem[] => p.sections.find(s => s.id === id)?.items ?? []
const actionIds = (p: ReflectPanel, id: string) => section(p, id).flatMap(i => (i.kind === 'action' ? [`${i.id}${i.primary ? '*' : ''}`] : []))

const BAND = { component: 'AbovePrompt', props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 80 } as never } as const
async function bandText($: Engine) {
  const ui = await $.ui.mount({ plugin: 'reflect-mod', surface: 'terminal', ...BAND })
  const texts = (await ui.findAll({ type: 'Text' })).map(t => t.text ?? '')
  await ui.unmount()
  return texts
}

test('hub: the Reflect tab lists the found rules with their actions, the checking setting and where it saves', { plugins: [HUB] }, async ($, on) => {
  const saved = learning('saved', 'Keep commit messages short', 'global', { status: 'saved', decidedAt: NOW - 3_600_000 })
  const elsewhere = learning('elsewhere', 'Use uv', 'project', { project: '/other' })
  const w = world(on, { items: [ENGLISH, PNPM, saved, elsewhere] })
  await start($)
  const p = await hub.panel($, { lang: 'en', ...ARGS })

  expect(p.title).toBe('Reflect')
  expect(p.summary).toBe('2 rules to review')
  expect(p.tone).toBe('warn')
  expect(p.sections.map(s => [s.id, s.title])).toEqual([
    ['found', 'Found rules · 2'],
    ['checking', 'Checking'],
    ['where', 'Where it saves'],
    ['history', 'Decided'],
  ])
  // The repeated rule first; each rule a row, then its presses with the suggested save last, in the accent.
  const found = section(p, 'found')
  expect(found[0]?.kind).toBe('tree')
  expect(JSON.stringify(found[0])).toContain('Use pnpm, not npm, in this repo')
  expect(JSON.stringify(found[0])).toContain('This repo · said 2× · 1 min ago')
  expect(actionIds(p, 'found')).toEqual(['edit:pnpm', 'skip:pnpm', 'other:pnpm', 'save:pnpm*', 'edit:english', 'skip:english', 'other:english', 'save:english*'])
  expect(found.find(i => i.kind === 'action' && i.id === 'save:pnpm')).toMatchObject({ label: 'Save to ./CLAUDE.md' })
  expect(found.find(i => i.kind === 'action' && i.id === 'other:english')).toMatchObject({ label: 'This repo instead' })
  expect(found.at(-1)).toEqual({ kind: 'text', text: '1 more waits in another project: review it from a session there.' })

  expect(section(p, 'checking').slice(0, 2)).toEqual([
    { kind: 'toggle', id: 'checking', label: 'Check my prompts', help: expect.any(String), value: true, scope: 'user' },
    { kind: 'choice', id: 'model', label: 'Model', help: expect.any(String), value: 'haiku', options: expect.any(Array), scope: 'user' },
  ])
  expect(JSON.stringify(section(p, 'checking'))).toContain('One Haiku call per short prompt you type')
  expect(section(p, 'where')).toEqual([
    { kind: 'info', label: 'This repo', value: '/repo/CLAUDE.md' },
    { kind: 'info', label: 'Global', value: '~/.claude/CLAUDE.md' },
    { kind: 'info', label: 'Saved this session', value: '0' },
  ])
  expect(JSON.stringify(section(p, 'history'))).toContain('Keep commit messages short')
  // The slash commands are gone: everything they did is in this tab.
  expect(w.commands).toEqual([])
})

test('hub: Portuguese when the hub asks for it, and a calm summary when nothing waits', { plugins: [HUB] }, async ($, on) => {
  world(on, { items: [PNPM] })
  await start($)
  const pt = await hub.panel($, { lang: 'pt', ...ARGS })
  expect(pt.summary).toBe('1 regra para revisar')
  expect(pt.sections.map(s => s.title)).toEqual(['Regras encontradas · 1', 'Verificação', 'Onde salva', 'Decididas'])
  expect(section(pt, 'found').find(i => i.kind === 'action' && i.id === 'save:pnpm')).toMatchObject({ label: 'Salvar em ./CLAUDE.md' })

  expect(await hub.act($, { id: 'skip:pnpm' })).toEqual({ message: 'reflect: pulada' })
  const en = await hub.panel($, { lang: 'en', ...ARGS })
  expect([en.summary, en.tone]).toEqual(['watching', 'ok'])
  expect(section(en, 'found')).toEqual([{ kind: 'text', text: expect.stringContaining('Nothing to review') }])
})

test('hub: save writes the file and the session prompt, other saves to the other file, skip and edit decide', { plugins: [HUB] }, async ($, on) => {
  const style = learning('style', 'Prefer early returns', 'project')
  const w = world(on, { items: [PNPM, ENGLISH, style] })
  w.files['/repo/CLAUDE.md'] = '# Repo\n'
  await start($)

  expect(await hub.act($, { id: 'save:pnpm' })).toEqual({ message: 'reflect: saved to /repo/CLAUDE.md' })
  expect(w.files['/repo/CLAUDE.md']).toContain('## Learned rules\n- Use pnpm, not npm, in this repo\n<!-- end claude-reflect -->')
  expect(await hub.act($, { id: 'other:english' })).toEqual({ message: 'reflect: saved to /repo/CLAUDE.md' })
  expect(w.files['/repo/CLAUDE.md']).toContain('- Answer in English\n<!-- end claude-reflect -->')
  expect(w.items().map(l => [l.id, l.status, l.scope])).toEqual([
    ['pnpm', 'saved', 'project'],
    ['english', 'saved', 'project'],
    ['style', 'pending', 'project'],
  ])
  expect(await hub.act($, { id: 'edit:style' })).toEqual({ message: 'reflect: the rule is in the prompt box - reword it and send' })
  expect(w.filled).toEqual(['remember: Prefer early returns'])
  expect(w.items().find(l => l.id === 'style')?.status).toBe('skipped')
  // Decided already: a second press changes nothing.
  expect(await hub.act($, { id: 'save:style' })).toEqual({ message: 'reflect: that rule was already decided in another session' })
  expect(await hub.act($, { id: 'nope' })).toEqual({ message: 'Unknown action: nope' })

  const p = await hub.panel($, { lang: 'en', ...ARGS })
  expect(section(p, 'where').at(-1)).toEqual({ kind: 'info', label: 'Saved this session', value: '2' })
  expect(JSON.stringify(section(p, 'history'))).toContain('2 saved, 1 skipped in all, here and global')
  expect(await bandText($)).toEqual([])
})

test('hub: pausing stores the setting for every session and stops the check; the model is a stored setting too', { plugins: [HUB] }, async ($, on) => {
  const w = world(on)
  await start($)
  expect(await hub.act($, { id: 'checking', value: 'off' })).toEqual({ message: 'Checking paused: your prompts are not checked.' })
  expect(w.store.get('paused')).toBe(true)
  await say($, w, 'no, use pnpm')
  expect(w.asked).toEqual([])
  const paused = await hub.panel($, { lang: 'en', ...ARGS })
  expect([paused.summary, paused.tone]).toEqual(['paused', 'muted'])
  expect(section(paused, 'checking')[0]).toMatchObject({ kind: 'toggle', value: false })

  expect(await hub.act($, { id: 'checking', value: 'on' })).toEqual({ message: 'Checking on: short prompts are checked again.' })
  expect(await hub.act($, { id: 'model', value: 'sonnet' })).toEqual({ message: 'The check now uses Sonnet.' })
  expect(await hub.act($, { id: 'model', value: 'gpt' })).toEqual({ message: 'Not an option: gpt' })
  expect(w.store.get('model')).toBe('sonnet')
  await say($, w, 'no, use pnpm')
  expect(w.asked).toEqual(['no, use pnpm'])
  expect(w.models).toEqual(['sonnet'])
})

test('cross-session: a rule decided or found in another session shows here within seconds, and so does a pause', { plugins: [HUB] }, async ($, on) => {
  const w = world(on, { items: [PNPM, ENGLISH] })
  await start($)
  expect(await bandText($)).toContain('Use pnpm, not npm, in this repo')

  // Another session saves one rule and finds a new one: the band follows on the slow clock alone.
  const other = w.items()
  other[0]!.status = 'saved'
  other.push(learning('tabs', 'Indent with tabs', 'project'))
  w.store.set('items', other)
  await w.clock.advance(3000)
  const texts = await bandText($)
  expect(texts).not.toContain('Use pnpm, not npm, in this repo')
  expect(texts).toEqual(expect.arrayContaining(['Answer in English', 'Indent with tabs']))

  // A press here on a rule the other session already skipped writes nothing.
  const skipped = w.items()
  skipped[1]!.status = 'skipped'
  w.store.set('items', skipped)
  expect(await hub.act($, { id: 'save:english' })).toEqual({ message: 'reflect: that rule was already decided in another session' })
  expect(w.files['/home/u/.claude/CLAUDE.md']).toBeUndefined()

  // Another session pauses: the next panel says so, and no prompt reaches the model.
  w.store.set('paused', true)
  expect((await hub.panel($, { lang: 'en', ...ARGS })).summary).toBe('paused · 1 rule to review')
  await w.clock.advance(3000)
  await say($, w, 'no, use pnpm')
  expect(w.asked).toEqual([])
})

test('catalog: every band state and panel row, as plain data', { plugins: [HUB] }, async ($, on) => {
  world(on)
  await start($)
  for (const surface of ['desktop', 'terminal'] as const) {
    const entries = await hub.catalog($, { lang: 'en', surface, columns: 80 })
    expect(entries.map(e => e.id)).toEqual([
      'band-one',
      'band-two',
      'band-more',
      'band-global',
      'band-narrow',
      'rule-row-pending',
      'rule-row-saved',
      'rule-row-skipped',
      'found-empty',
    ])
    expect(entries.every(e => e.name !== e.id && (e.help ?? '') !== '')).toBe(true)
    // No handler survives: a press cannot cross to the mod.
    expect(JSON.stringify(entries)).not.toContain('"press"')
    expect(JSON.stringify(entries)).not.toContain('"type":"Button"')
  }
  const pt = await hub.catalog($, { lang: 'pt', surface: 'desktop', columns: 80 })
  expect(pt[0]?.name).toBe('Faixa de regra, uma regra')
})
