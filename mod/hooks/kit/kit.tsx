import type { RenderElement, RenderSurface } from 'claude-code'

import { iconSvg } from './icons'
import type { IconName } from './icons'
import { hexOf, inkOf } from './tone'
import type { KitTone, Tone } from './tone'

// The pack's components: one grammar for every pane, band and dialog the mods draw, in
// Claude Code's own idiom. Native Buttons, the app's text colours, hairline groups that
// never nest, one accent for the current choice and the one main action, stroke icons
// instead of glyphs, and the ring meter for anything with a percent.
//
// Pure functions of the resolved elements, the tone and the surface: nothing here takes `$`.
// Shared kit: edit in claude-mods-hub/kit, then run dev/sync-kit.sh; never edit a copy.

// The elements the kit draws with; `Svg` only where the surface draws vectors.
export type KitUi = {
  Box: any
  Text: any
  Button: any
  Input?: any
  Select?: any
  Svg?: any
}

export type Kit = {
  readonly ui: KitUi
  readonly t: Tone
  readonly surface: RenderSurface
  // The desktop app, or another surface that draws Svg: icons, switches and rings.
  readonly vector: boolean
  // Columns the drawing may take.
  readonly columns: number
}

export const kitOf = (ui: KitUi, t: Tone, surface: RenderSurface, columns: number): Kit => ({
  ui,
  t,
  surface,
  vector: surface !== 'terminal' && ui.Svg !== undefined,
  columns,
})

type Child = RenderElement | string | null | undefined | false

// An icon, 16px; nothing on the terminal unless a fallback glyph is given.
export function icon(k: Kit, name: IconName, tone?: KitTone | 'faint', size = 16, fallback?: string): RenderElement | null {
  if (k.vector) {
    const { Svg } = k.ui
    const color = tone === 'faint' ? k.t.hex.faint : hexOf(k.t, tone ?? 'muted')

    return <Svg source={iconSvg(name, color, size)} alt={name} width={size} height={size} />
  }

  return fallback === undefined ? null : <k.ui.Text color={tone === 'faint' ? k.t.ink.faint : inkOf(k.t, tone ?? 'muted')}>{fallback}</k.ui.Text>
}

// A small filled circle in a state's colour: the dot beside a live state.
export function dot(k: Kit, tone: KitTone, size = 8): RenderElement {
  if (k.vector) {
    const { Svg } = k.ui
    const r = size / 2

    return (
      <Svg
        source={`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${r}" cy="${r}" r="${r - 0.5}" fill="${hexOf(k.t, tone)}"/></svg>`}
        alt={tone}
        width={size}
        height={size}
      />
    )
  }

  return <k.ui.Text color={inkOf(k.t, tone)}>●</k.ui.Text>
}

// Text in a role: body, muted (secondary), faint (tertiary), or a state.
export function text(k: Kit, content: Child | Child[], tone?: KitTone | 'faint', opts: { bold?: boolean; wrap?: string; key?: string } = {}): RenderElement {
  const color = tone === 'faint' ? k.t.ink.faint : inkOf(k.t, tone)

  return (
    <k.ui.Text {...(opts.key ? { key: opts.key } : {})} {...(color === undefined ? {} : { color })} {...(opts.bold ? { bold: true } : {})} {...(opts.wrap ? { wrap: opts.wrap } : {})}>
      {content}
    </k.ui.Text>
  )
}

// A group's title, with optional muted detail and a control at the right:
// `Finished              2  [Hide]`.
export function heading(k: Kit, title: string, detail?: string, key?: string, end?: Child | Child[]): RenderElement {
  const { Box } = k.ui

  return (
    <Box {...(key ? { key } : {})} flexDirection="row" columnGap={2} paddingX={1} alignItems="center">
      <Box flexGrow={1} flexShrink={1}>
        {text(k, title, undefined, { bold: true })}
      </Box>
      {detail ? text(k, detail, 'muted') : null}
      {end ?? null}
    </Box>
  )
}

// Rows held in one hairline rounded outline, a line apart. Groups never nest. A dense group
// (values, a list of readings) keeps its rows together.
export function group(k: Kit, key: string, rows: Child[], dense = false): RenderElement {
  const { Box } = k.ui

  return (
    <Box key={key} flexDirection="column" borderStyle="round" borderColor={k.t.ink.line} paddingY={1} rowGap={dense ? 0 : 1}>
      {rows.filter(Boolean)}
    </Box>
  )
}

// A titled group: the heading, then the outlined rows. `end` puts a control in the heading.
export function section(k: Kit, key: string, title: string, rows: Child[], detail?: string, dense = false, end?: Child | Child[]): RenderElement {
  const { Box } = k.ui

  return (
    <Box key={`section-box-${key}`} flexDirection="column">
      {heading(k, title, detail, undefined, end)}
      {group(k, key, rows, dense)}
    </Box>
  )
}

export type RowArgs = {
  key: string
  label: string
  help?: string | undefined
  icon?: IconName | undefined
  iconTone?: KitTone | undefined
  // Any leading element in place of the icon: a mascot, an avatar, a ring.
  lead?: Child
  // Right-aligned: a control, a value, a state.
  end?: Child | Child[]
  // A long value at the end wraps instead of pushing the row wider.
  endWraps?: boolean
  // Under the label: a full-width control, a list of options that wraps.
  below?: Child | Child[]
  tone?: KitTone | undefined
  // The help line in a state's colour: a mod's live state under its name.
  helpTone?: KitTone | undefined
  muted?: boolean
}

// One line of a group: icon, label and help at the left, the control at the right. The
// row lights under the pointer, as the app's own list rows do.
export function row(k: Kit, args: RowArgs): RenderElement {
  const { Box } = k.ui
  const narrow = k.columns < 44
  const end = args.end === undefined || args.end === null ? null : (
    <Box flexDirection="row" columnGap={1} alignItems="center" flexShrink={args.endWraps ? 1 : 0} {...(args.endWraps ? { justifyContent: 'flex-end' } : {})}>
      {args.end}
    </Box>
  )

  return (
    <Box key={`row-${args.key}`} flexDirection="column" paddingX={1} hover={{ backgroundColor: k.t.ink.hover }}>
      <Box flexDirection={narrow && end !== null && args.help ? 'column' : 'row'} columnGap={2} alignItems={narrow ? 'flex-start' : 'center'}>
        <Box flexDirection="row" columnGap={1} flexGrow={1} flexShrink={1} alignItems="flex-start">
          {args.lead ?? (args.icon ? icon(k, args.icon, args.iconTone) : null)}
          <Box flexDirection="column" flexShrink={1}>
            {text(k, args.label, args.muted ? 'muted' : args.tone)}
            {args.help ? text(k, args.help, args.helpTone ?? 'muted') : null}
          </Box>
        </Box>
        {end}
      </Box>
      {args.below === undefined || args.below === null ? null : (
        <Box flexDirection="column" paddingTop={0} paddingLeft={(args.icon || args.lead) && k.vector ? 3 : 0}>
          {args.below}
        </Box>
      )}
    </Box>
  )
}

export type Option = { value: string; label: string }

// A choice among a few: a row of native buttons, the current one in the accent. The
// options wrap under the label when there are many.
export function choice(k: Kit, key: string, value: string, options: readonly Option[], pick: (value: string) => void): RenderElement {
  const { Box, Button } = k.ui

  return (
    <Box flexDirection="row" flexWrap="wrap" columnGap={1}>
      {options.map(option =>
        option.value === value ? (
          <Button key={`${key}-${option.value}`} label={option.label} variant="primary" onPress={() => pick(option.value)} />
        ) : (
          <Button key={`${key}-${option.value}`} label={option.label} dimColor onPress={() => pick(option.value)} />
        ),
      )}
    </Box>
  )
}

// A choice of any size: a few options as native buttons, more than three as the native
// select, so a long list never becomes a wall of buttons. `value` '' selects nothing.
// With nothing selected, `prompt` is the first entry and the one shown ("Choose a length"),
// never the select's generic placeholder; picking it does nothing.
export function picker(k: Kit, key: string, value: string, options: readonly Option[], pick: (value: string) => void, prompt?: string): RenderElement {
  const { Select } = k.ui

  if (options.length <= 3 || Select === undefined) {
    return choice(k, key, value, options, pick)
  }

  const none = value === '' && prompt !== undefined

  return (
    <Select
      key={key}
      options={[...(none ? [{ value: '', label: prompt }] : []), ...options.map(option => ({ value: option.value, label: option.label }))]}
      {...(value === '' && !none ? {} : { value })}
      onSelect={(next: string) => next !== '' && pick(next)}
    />
  )
}

const SWITCH_W = 28
const SWITCH_H = 16

// The drawn state of a switch: a pill track, the knob at the right and the track in the
// accent when on. A picture only; the Button beside it does the switching.
export function switchSvg(k: Kit, on: boolean): string {
  const track = on ? k.t.hex.accent : k.t.hex.line
  const knob = on ? '#ffffff' : k.t.hex.muted
  const x = on ? SWITCH_W - SWITCH_H / 2 : SWITCH_H / 2

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SWITCH_W}" height="${SWITCH_H}" viewBox="0 0 ${SWITCH_W} ${SWITCH_H}"><rect width="${SWITCH_W}" height="${SWITCH_H}" rx="${SWITCH_H / 2}" fill="${track}"/><circle cx="${x}" cy="${SWITCH_H / 2}" r="${SWITCH_H / 2 - 2.5}" fill="${knob}"/></svg>`
}

// An on/off setting: the switch shows the state, the button names what pressing does. On
// the terminal, one plain button with a filled or hollow mark: `● On`, `○ Off`.
export function toggle(k: Kit, key: string, on: boolean, flip: (next: boolean) => void, words: { on: string; off: string; turnOn: string; turnOff: string }): RenderElement {
  const { Box, Button, Svg } = k.ui

  if (!k.vector) {
    return <Button key={key} plain dimColor={!on} label={on ? `● ${words.on}` : `○ ${words.off}`} onPress={() => flip(!on)} />
  }

  return (
    <Box flexDirection="row" columnGap={1} alignItems="center">
      <Svg source={switchSvg(k, on)} alt={on ? words.on : words.off} width={SWITCH_W} height={SWITCH_H} />
      <Button key={key} label={on ? words.turnOff : words.turnOn} dimColor onPress={() => flip(!on)} />
    </Box>
  )
}

// A press: the group's one main action in the accent, the rest native and quiet.
// `focus` starts the keyboard there (Enter presses it): the safe choice of a dialog. `plain`
// draws the terminal's `1: Label` survey row; the desktop draws its native button either way.
export function action(
  k: Kit,
  key: string,
  label: string,
  press: () => void,
  opts: { primary?: boolean; hotkey?: string; dismiss?: boolean; focus?: boolean; plain?: boolean; dim?: boolean } = {},
): RenderElement {
  const { Button } = k.ui

  return (
    <Button
      key={key}
      label={label}
      {...(opts.primary ? { variant: 'primary' } : {})}
      {...(opts.hotkey ? { hotkey: opts.hotkey } : {})}
      {...(opts.dismiss ? { role: 'dismiss' } : {})}
      {...(opts.focus ? { autoFocus: true } : {})}
      {...(opts.plain ? { plain: true } : {})}
      {...(opts.dim ? { dimColor: true } : {})}
      onPress={press}
    />
  )
}

// A value with its label, the value in its state's colour: `Cache   warm · 42m`.
export function value(k: Kit, label: string, shown: string, tone?: KitTone, key?: string): RenderElement {
  return row(k, { key: key ?? `value-${label}`, label, muted: true, end: text(k, shown, tone) })
}

const RING_R = 7

// A percent as a ring, the pack's one data glyph, with its label beside it: `◔ 42% context`.
// `detail` follows in muted text, such as a reset countdown. The terminal draws a bar.
// A usage fills toward warn (80%) and err (95%); a progress passes `tone` and keeps it, so
// finishing never reads as a warning.
export function meter(k: Kit, key: string, label: string, percent: number, detail?: string, fixed?: KitTone): RenderElement {
  const { Box, Svg } = k.ui
  const p = Math.max(0, Math.min(100, Math.round(percent)))
  const tone: KitTone = fixed ?? (p >= 95 ? 'err' : p >= 80 ? 'warn' : 'accent')

  if (!k.vector) {
    const filled = Math.round(p / 12.5)

    return (
      <Box key={key} flexDirection="row" columnGap={1}>
        {text(k, '█'.repeat(filled) + '░'.repeat(8 - filled), tone)}
        {text(k, `${p}%`, undefined, { bold: true })}
        {text(k, detail ? `${label} · ${detail}` : label, 'muted')}
      </Box>
    )
  }

  const size = RING_R * 2 + 4
  const c = 2 * Math.PI * RING_R
  const ring = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${RING_R}" fill="none" stroke="${k.t.hex.muted}" stroke-opacity=".25" stroke-width="2.5"/><circle cx="${size / 2}" cy="${size / 2}" r="${RING_R}" fill="none" stroke="${hexOf(k.t, tone)}" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="${(c * p) / 100} ${c}" transform="rotate(-90 ${size / 2} ${size / 2})"/></svg>`

  return (
    <Box key={key} flexDirection="row" columnGap={1} alignItems="center">
      <Svg source={ring} alt={`${label} ${p}%`} width={size} height={size} />
      {text(k, `${p}%`, undefined, { bold: true })}
      {text(k, detail ? `${label} · ${detail}` : label, 'muted')}
    </Box>
  )
}

// A short state word in its colour, with its dot: `● warm`.
export function status(k: Kit, word: string, tone: KitTone): RenderElement {
  const { Box } = k.ui

  return (
    <Box flexDirection="row" columnGap={1} alignItems="center">
      {dot(k, tone)}
      {text(k, word, tone === 'muted' ? 'muted' : tone)}
    </Box>
  )
}

// A notice inside a pane or dialog: an icon in the state's colour, a title, a body. No
// coloured side bar: the outline and the icon carry the state.
export function notice(k: Kit, key: string, tone: KitTone, title: string, body?: Child | Child[], actions?: Child[], iconName?: IconName): RenderElement {
  const { Box } = k.ui
  const name: IconName = iconName ?? (tone === 'err' || tone === 'warn' ? 'alert' : tone === 'ok' ? 'check' : 'info')

  return (
    <Box key={key} flexDirection="column" borderStyle="round" borderColor={k.t.ink.line} paddingX={1} rowGap={0}>
      <Box flexDirection="row" columnGap={1} alignItems="center">
        {icon(k, name, tone, 16, tone === 'err' || tone === 'warn' ? '!' : 'i')}
        {text(k, title, tone === 'muted' ? undefined : tone, { bold: true })}
      </Box>
      {body === undefined ? null : <Box flexDirection="column">{typeof body === 'string' ? text(k, body, 'muted') : body}</Box>}
      {actions && actions.length > 0 ? (
        <Box flexDirection="row" columnGap={1} paddingTop={1} justifyContent="flex-end">
          {actions}
        </Box>
      ) : null}
    </Box>
  )
}

// What a list shows when it has nothing yet: what it will hold, and how it gets there.
export function empty(k: Kit, key: string, title: string, hint?: string): RenderElement {
  const { Box } = k.ui

  return (
    <Box key={key} flexDirection="column" paddingX={1}>
      {text(k, title, 'muted')}
      {hint ? text(k, hint, 'faint') : null}
    </Box>
  )
}

// A colour sample beside its name and value, as a palette editor lists them.
export function swatch(k: Kit, key: string, label: string, color: string, selected: boolean, press: () => void): RenderElement {
  const { Box, Button, Svg } = k.ui
  const chip = k.vector ? (
    <Svg
      source={`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><rect x=".5" y=".5" width="15" height="15" rx="4" fill="${color}" stroke="${k.t.hex.line}"/></svg>`}
      alt={color}
      width={16}
      height={16}
    />
  ) : (
    <k.ui.Text backgroundColor={color}>{'  '}</k.ui.Text>
  )

  return (
    <Box key={`swatch-${key}`} flexDirection="row" columnGap={1} alignItems="center" width={26}>
      {chip}
      {selected ? <Button key={key} label={label} variant="primary" onPress={press} /> : <Button key={key} label={label} dimColor onPress={press} />}
      {text(k, color, 'faint')}
    </Box>
  )
}

// A single-line field with its label above, as the app's own forms set them.
export function field(k: Kit, key: string, label: string, placeholder: string, submit: (value: string) => void, opts: { submitLabel?: string; help?: string; value?: string } = {}): RenderElement {
  const { Box, Input } = k.ui

  if (Input === undefined) {
    return text(k, label, 'muted')
  }

  return (
    <Box key={`field-${key}`} flexDirection="column" paddingX={1}>
      {text(k, label)}
      {opts.help ? text(k, opts.help, 'muted') : null}
      <Input key={key} placeholder={placeholder} value={opts.value ?? ''} submitLabel={opts.submitLabel ?? 'OK'} onSubmit={(v: string) => submit(v.trim())} />
    </Box>
  )
}

// Space between groups: one empty line, the pack's whole vertical rhythm.
export function stack(k: Kit, key: string, children: Child[], gap = 1): RenderElement {
  return (
    <k.ui.Box key={key} flexDirection="column" rowGap={gap}>
      {children.filter(Boolean)}
    </k.ui.Box>
  )
}

// A drawing made plain data, for a catalog another mod draws: a press cannot cross mods, so
// handlers are dropped and each control is drawn as its shape without its press. A Button is
// a round hairline box around its label (filled with the accent when primary), a field or a
// select a hairline box around its placeholder or value, a Client its props' summary.
export function staticTree(node: unknown, t?: Tone): unknown {
  if (Array.isArray(node)) {
    return node.map(child => staticTree(child, t))
  }

  if (node === null || typeof node !== 'object') {
    return typeof node === 'function' ? undefined : node
  }

  const element = node as { type?: unknown; props?: Record<string, unknown> }
  const p = element.props ?? {}
  const line = t?.ink.line ?? 'subtle'

  if (element.type === 'Button') {
    const label = String(p.label ?? p.key ?? '')
    const primary = p.variant === 'primary' && p.plain !== true

    return {
      type: 'Box',
      props: { borderStyle: 'round', borderColor: primary ? (t?.ink.accent ?? 'claude') : line, paddingX: 1, ...(primary ? { backgroundColor: t?.hex.accent ?? 'claude' } : {}) },
      children: [{ type: 'Text', props: primary ? { color: '#ffffff', bold: true } : p.dimColor === true ? { color: t?.ink.muted ?? 'inactive' } : {}, children: [label] }],
    }
  }

  if (element.type === 'Input' || element.type === 'Select') {
    const options = Array.isArray(p.options) ? (p.options as { value: string; label?: string }[]) : []
    const shown = element.type === 'Select' ? (options.find(option => option.value === p.value)?.label ?? String(p.value ?? options[0]?.label ?? '')) : String(p.value || p.placeholder || '')

    return {
      type: 'Box',
      props: { flexDirection: 'row', columnGap: 1 },
      children: [
        ...(p.label ? [{ type: 'Text', props: {}, children: [String(p.label)] }] : []),
        { type: 'Box', props: { borderStyle: 'round', borderColor: line, paddingX: 1 }, children: [{ type: 'Text', props: { color: t?.ink.muted ?? 'inactive' }, children: [element.type === 'Select' ? `${shown} ⌄` : shown] }] },
      ],
    }
  }

  if (element.type === 'Client') {
    return { type: 'Text', props: { color: t?.ink.muted ?? 'inactive' }, children: [String(p.key ?? p.module ?? '')] }
  }

  return Object.fromEntries(
    Object.entries(element)
      .filter(([key, value]) => key !== 'press' && typeof value !== 'function')
      .map(([key, value]) => [key, key === 'props' && value !== null && typeof value === 'object' ? Object.fromEntries(Object.entries(value).filter(([, prop]) => typeof prop !== 'function')) : staticTree(value, t)]),
  )
}
