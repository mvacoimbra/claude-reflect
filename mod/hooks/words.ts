// The mod's copy, English and Portuguese: the band, the /mods tab and the catalog.

import type { ReflectLang } from '../types'

export type Words = {
  // The band and the rule rows.
  saveProject: string
  saveGlobal: string
  projectInstead: string
  globalInstead: string
  edit: string
  skip: string
  project: string
  global: string
  said: (n: number) => string
  more: (n: number) => string
  ago: (ms: number) => string
  saved: string
  skipped: string
  // Toasts and act answers.
  savedTo: (path: string) => string
  alreadyIn: (path: string) => string
  brokenMarkers: (path: string) => string
  clearBox: string
  edited: string
  skippedOne: string
  notKept: string
  gone: string
  checkingOn: string
  checkingOff: string
  modelSet: (model: string) => string
  badOption: (value: string) => string
  unknown: (id: string) => string
  // The /mods tab.
  title: string
  toReview: (n: number) => string
  watching: string
  paused: string
  found: string
  foundCount: (n: number) => string
  nothingFound: string
  moreHere: (n: number) => string
  otherProjects: (n: number) => string
  checking: string
  checkLabel: string
  checkHelp: string
  model: string
  modelHelp: string
  cost: (model: string) => string
  rememberHint: string
  where: string
  thisRepo: string
  everywhere: string
  savedThisSession: string
  history: string
  noHistory: string
  totals: (saved: number, skipped: number) => string
  // The catalog.
  catalog: Readonly<Record<string, { name: string; help: string }>>
}

const EN: Words = {
  saveProject: 'Save to ./CLAUDE.md',
  saveGlobal: 'Save to ~/.claude/CLAUDE.md',
  projectInstead: 'This repo instead',
  globalInstead: 'Global instead',
  edit: 'Edit',
  skip: 'Skip',
  project: 'This repo',
  global: 'Global',
  said: n => (n > 1 ? `said ${n}×` : 'said once'),
  more: n => `${n} more waiting · /mods`,
  ago: ms => (ms < 60_000 ? 'just now' : ms < 3_600_000 ? `${Math.floor(ms / 60_000)} min ago` : ms < 86_400_000 ? `${Math.floor(ms / 3_600_000)} h ago` : `${Math.floor(ms / 86_400_000)} d ago`),
  saved: 'Saved',
  skipped: 'Skipped',
  savedTo: path => `reflect: saved to ${path}`,
  alreadyIn: path => `reflect: already in ${path}`,
  brokenMarkers: path => `reflect: the claude-reflect markers in ${path} are broken - fix them by hand, nothing written`,
  clearBox: 'reflect: clear the prompt box first - Edit puts the rule there',
  edited: 'reflect: the rule is in the prompt box - reword it and send',
  skippedOne: 'reflect: skipped',
  notKept: 'reflect: not kept - one line, no secrets, at most 200 characters',
  gone: 'reflect: that rule was already decided in another session',
  checkingOn: 'Checking on: short prompts are checked again.',
  checkingOff: 'Checking paused: your prompts are not checked.',
  modelSet: model => `The check now uses ${model}.`,
  badOption: value => `Not an option: ${value}`,
  unknown: id => `Unknown action: ${id}`,
  title: 'Reflect',
  toReview: n => (n === 1 ? '1 rule to review' : `${n} rules to review`),
  watching: 'watching',
  paused: 'paused',
  found: 'Found rules',
  foundCount: n => `Found rules · ${n}`,
  nothingFound: 'Nothing to review. A correction you type shows up here and above the prompt.',
  moreHere: n => `${n} more after these`,
  otherProjects: n => (n === 1 ? '1 more waits in another project: review it from a session there.' : `${n} more wait in other projects: review them from a session there.`),
  checking: 'Checking',
  checkLabel: 'Check my prompts',
  checkHelp: 'Finds reusable rules in what you type, in any language',
  model: 'Model',
  modelHelp: 'Haiku is the cheapest; Sonnet catches subtler rules',
  cost: model =>
    `One ${model} call per short prompt you type (500 characters or less; not slash commands, acknowledgements or anything that looks secret). It counts toward your Claude usage; the prompt text is not stored.`,
  rememberHint: 'Type remember: <rule> to add one straight away, without a model call.',
  where: 'Where it saves',
  thisRepo: 'This repo',
  everywhere: 'Global',
  savedThisSession: 'Saved this session',
  history: 'Decided',
  noHistory: 'Nothing saved or skipped yet.',
  totals: (saved, skipped) => `${saved} saved, ${skipped} skipped in all, here and global`,
  catalog: {
    'band-one': { name: 'Rule band, one rule', help: 'Above the prompt: a rule the check found, with its scope and the save as the main action' },
    'band-two': { name: 'Rule band, two rules', help: 'Two rules waiting; a repeated one carries its count' },
    'band-more': { name: 'Rule band, more waiting', help: 'Two rules shown and a line pointing to /mods for the rest' },
    'band-global': { name: 'Rule band, global rule', help: 'A rule about how you work anywhere, saved to ~/.claude/CLAUDE.md' },
    'band-narrow': { name: 'Rule band, narrow', help: 'A long rule beside a docked pane: the buttons move under it' },
    'rule-row-pending': { name: 'Found rule row', help: 'A rule waiting in the Reflect tab of /mods, its scope and count under it' },
    'rule-row-saved': { name: 'Decided rule row, saved', help: 'A saved rule in the Decided group, where it went and when' },
    'rule-row-skipped': { name: 'Decided rule row, skipped', help: 'A skipped rule in the Decided group' },
    'found-empty': { name: 'Found rules, empty', help: 'The Found rules group with nothing to review' },
  },
}

const PT: Words = {
  saveProject: 'Salvar em ./CLAUDE.md',
  saveGlobal: 'Salvar em ~/.claude/CLAUDE.md',
  projectInstead: 'Usar este repo',
  globalInstead: 'Usar global',
  edit: 'Editar',
  skip: 'Pular',
  project: 'Este repo',
  global: 'Global',
  said: n => (n > 1 ? `dita ${n}×` : 'dita uma vez'),
  more: n => `mais ${n} aguardando · /mods`,
  ago: ms => (ms < 60_000 ? 'agora' : ms < 3_600_000 ? `há ${Math.floor(ms / 60_000)} min` : ms < 86_400_000 ? `há ${Math.floor(ms / 3_600_000)} h` : `há ${Math.floor(ms / 86_400_000)} d`),
  saved: 'Salva',
  skipped: 'Pulada',
  savedTo: path => `reflect: salva em ${path}`,
  alreadyIn: path => `reflect: já está em ${path}`,
  brokenMarkers: path => `reflect: os marcadores do claude-reflect em ${path} estão quebrados - corrija à mão, nada foi escrito`,
  clearBox: 'reflect: limpe a caixa do prompt antes - Editar coloca a regra lá',
  edited: 'reflect: a regra está na caixa do prompt - reescreva e envie',
  skippedOne: 'reflect: pulada',
  notKept: 'reflect: não guardada - uma linha, sem segredos, até 200 caracteres',
  gone: 'reflect: essa regra já foi decidida em outra sessão',
  checkingOn: 'Verificação ligada: prompts curtos voltam a ser verificados.',
  checkingOff: 'Verificação pausada: seus prompts não são verificados.',
  modelSet: model => `A verificação agora usa ${model}.`,
  badOption: value => `Opção inválida: ${value}`,
  unknown: id => `Ação desconhecida: ${id}`,
  title: 'Reflect',
  toReview: n => (n === 1 ? '1 regra para revisar' : `${n} regras para revisar`),
  watching: 'observando',
  paused: 'pausado',
  found: 'Regras encontradas',
  foundCount: n => `Regras encontradas · ${n}`,
  nothingFound: 'Nada para revisar. Uma correção que você digitar aparece aqui e acima do prompt.',
  moreHere: n => `mais ${n} depois destas`,
  otherProjects: n => (n === 1 ? 'Mais 1 aguarda em outro projeto: revise numa sessão de lá.' : `Mais ${n} aguardam em outros projetos: revise numa sessão de lá.`),
  checking: 'Verificação',
  checkLabel: 'Verificar meus prompts',
  checkHelp: 'Encontra regras reutilizáveis no que você digita, em qualquer idioma',
  model: 'Modelo',
  modelHelp: 'Haiku é o mais barato; Sonnet pega regras mais sutis',
  cost: model =>
    `Uma chamada ao ${model} por prompt curto que você digita (até 500 caracteres; não comandos, confirmações nem nada com cara de segredo). Conta no seu uso do Claude; o texto do prompt não é guardado.`,
  rememberHint: 'Digite remember: <regra> para adicionar uma na hora, sem chamar o modelo.',
  where: 'Onde salva',
  thisRepo: 'Este repo',
  everywhere: 'Global',
  savedThisSession: 'Salvas nesta sessão',
  history: 'Decididas',
  noHistory: 'Nada salvo ou pulado ainda.',
  totals: (saved, skipped) => `${saved} salvas, ${skipped} puladas no total, aqui e globais`,
  catalog: {
    'band-one': { name: 'Faixa de regra, uma regra', help: 'Acima do prompt: uma regra que a verificação encontrou, com o escopo e salvar como ação principal' },
    'band-two': { name: 'Faixa de regra, duas regras', help: 'Duas regras aguardando; uma repetida mostra a contagem' },
    'band-more': { name: 'Faixa de regra, mais aguardando', help: 'Duas regras e uma linha apontando para /mods com o resto' },
    'band-global': { name: 'Faixa de regra, regra global', help: 'Uma regra sobre como você trabalha em qualquer lugar, salva em ~/.claude/CLAUDE.md' },
    'band-narrow': { name: 'Faixa de regra, estreita', help: 'Uma regra longa ao lado de um painel: os botões vão para baixo dela' },
    'rule-row-pending': { name: 'Linha de regra encontrada', help: 'Uma regra aguardando na aba Reflect do /mods, com escopo e contagem embaixo' },
    'rule-row-saved': { name: 'Linha de regra decidida, salva', help: 'Uma regra salva no grupo Decididas, onde foi parar e quando' },
    'rule-row-skipped': { name: 'Linha de regra decidida, pulada', help: 'Uma regra pulada no grupo Decididas' },
    'found-empty': { name: 'Regras encontradas, vazio', help: 'O grupo Regras encontradas sem nada para revisar' },
  },
}

export const WORDS: Readonly<Record<ReflectLang, Words>> = { en: EN, pt: PT }
