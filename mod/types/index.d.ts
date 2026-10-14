/** One learning the check found: a rule, where it belongs, and what happened to it. */
export type Learning = {
  id: string
  /** The rule, one imperative line in English. */
  rule: string
  scope: 'global' | 'project'
  /** The session root it was said in. */
  project: string
  /** How many times it was said (the check merges repeats). */
  count: number
  firstAt: number
  lastAt: number
  status: 'pending' | 'saved' | 'skipped'
  confidence: number
  /** When it was saved or skipped. */
  decidedAt?: number
}

/** A rule saved in this session, with where it applies. */
export type SavedRule = { rule: string; scope: 'global' | 'project'; project: string }

/** The user's settings, as last read from the plugin's store (shared by every session). */
export type Settings = {
  /** True while the check is paused: no prompt is queued or sent to the model. */
  paused: boolean
  /** The model the check runs on. */
  model: string
}

// What `$.reflect` hands the /mods hub (claude-mods-hub PROTOCOL.md): one tab, drawn by the hub.
export type ReflectLang = 'en' | 'pt'
export type ReflectPanelArgs = { lang: ReflectLang; surface: 'terminal' | 'desktop' | 'vscode' | 'mobile'; columns: number }
export type ReflectTone = 'ok' | 'warn' | 'err' | 'muted' | 'accent'
// Where a setting lives: the user's (every session and project, the default) or this session's
// alone. The hub marks the session's.
export type ReflectScope = 'user' | 'session'
export type ReflectItem =
  | { kind: 'toggle'; id: string; label: string; help?: string; value: boolean; scope?: ReflectScope }
  | { kind: 'choice'; id: string; label: string; help?: string; value: string; options: { value: string; label: string }[]; scope?: ReflectScope }
  // `label` is the button's; `title`, when given, names the row, with `help` under it.
  | { kind: 'action'; id: string; label: string; title?: string; help?: string; primary?: boolean; scope?: ReflectScope }
  | { kind: 'input'; id: string; label: string; help?: string; placeholder?: string; submitLabel?: string; scope?: ReflectScope }
  | { kind: 'info'; label: string; value: string; tone?: ReflectTone }
  | { kind: 'text'; text: string; tone?: ReflectTone }
  | { kind: 'swatch'; id: string; label: string; color: string; selected: boolean }
  | { kind: 'tree'; tree: unknown }
export type ReflectSection = { id: string; title: string; items: ReflectItem[] }
export type ReflectPanel = {
  // The tab's name.
  title: string
  // One line under the mod's name in the list and in its view's header.
  summary?: string
  tone?: ReflectTone
  // A progress the summary reports (0 to 100), drawn as a ring beside it.
  percent?: number
  // Drawn one under another, each a titled group.
  sections: ReflectSection[]
  // While this tab shows, the hub draws it again this often.
  refreshMs?: number
}
// `id` is `checking` (value `on`/`off`), `model` (the model), or `save:`, `other:`, `edit:`,
// `skip:` and a learning's id.
export type ReflectActArgs = { id: string; value?: string }
export type ReflectActResult = { message?: string }
// One component the mod draws, for the hub's Components tab.
export type ReflectCatalogEntry = {
  // Stable, kebab-case: what a person names when asking for a change.
  id: string
  // The component's name, as a person would say it ("Rule band, one rule").
  name: string
  // One line on what it is and where it shows.
  help?: string
  // The component drawn for `args.surface` at `args.columns`, as plain data: a press cannot cross mods.
  tree: unknown
}

declare module 'claude-code' {
  // What reflect-mod adds to `$`: its tab in the /mods hub and its component catalog.
  interface EngineInterface {
    reflect: {
      panel: (args: ReflectPanelArgs) => Promise<ReflectPanel>
      act: (args: ReflectActArgs) => Promise<ReflectActResult>
      catalog: (args: ReflectPanelArgs) => Promise<ReflectCatalogEntry[]>
    }
  }

  interface PluginState {
    'reflect-mod': {
      /** Pending learnings for this project and global ones, as the band draws them. */
      pending: Learning[]
      /** Rules saved in this session: the system prompt carries them until CLAUDE.md is read again. */
      savedThisSession: SavedRule[]
      /** The user's settings, mirrored from the store and read again every few seconds. */
      settings: Settings
    }
  }
}
