// The pack's colours. One skin themes every mod: skins hands its palette out through
// `$.skins.palette()`, and a mod without skins installed falls back to Claude Code's own.
//
// Two forms of every colour: `hex`, for SVG markup and mixing, and `ink`, for an element's
// `color`. On the native skin `ink` holds Claude Code's theme keys, so text follows the app
// exactly, light or dark; on any other skin it holds the skin's hex.
//
// This file is the pack's shared kit: the source lives in claude-mods-hub/kit and
// `dev/sync-kit.sh` copies it into every mod. Edit it there, never in a copy.

export type KitSlot =
  | 'read' | 'write' | 'run' | 'search' | 'web' | 'mcp' | 'other'
  | 'user' | 'fg' | 'muted' | 'surface' | 'zebra' | 'ok' | 'err' | 'warn'

export type KitPalette = Readonly<Record<KitSlot, string>>

// What `$.skins.palette()` answers.
export type KitSkin = { name: string; palette: KitPalette; isLight: boolean }

export type KitTone = 'ok' | 'warn' | 'err' | 'muted' | 'accent'

export type Tone = {
  readonly name: string
  readonly isNative: boolean
  readonly isLight: boolean
  // For SVG and mixing.
  readonly hex: KitPalette & { readonly accent: string; readonly line: string; readonly hover: string; readonly faint: string; readonly selected: string }
  // For an element's colour. `fg` is undefined on the native skin: the app's own text colour.
  readonly ink: {
    readonly fg: string | undefined
    readonly muted: string
    readonly faint: string
    readonly accent: string
    readonly ok: string
    readonly warn: string
    readonly err: string
    readonly line: string
    readonly hover: string
    // The background of the selected row: a tint of the accent.
    readonly selected: string
  }
}

// Claude Code's own colours, as the native skin carries them.
export const NATIVE: { readonly dark: KitPalette; readonly light: KitPalette } = {
  dark: {
    read: '#c9c7bd', write: '#c9c7bd', run: '#c9c7bd', search: '#c9c7bd', web: '#c9c7bd', mcp: '#c9c7bd', other: '#c9c7bd',
    user: '#d97757', fg: '#e8e6dc', muted: '#9c9a92', surface: '#262624', zebra: '#2d2c2a',
    ok: '#4eba65', err: '#ff6b80', warn: '#ffc107',
  },
  light: {
    read: '#3d3c38', write: '#3d3c38', run: '#3d3c38', search: '#3d3c38', web: '#3d3c38', mcp: '#3d3c38', other: '#3d3c38',
    user: '#c96442', fg: '#1f1e1d', muted: '#6f6d66', surface: '#faf9f5', zebra: '#f0eee6',
    ok: '#2c7a39', err: '#ab2b3f', warn: '#966c1e',
  },
}

export const NATIVE_NAME = 'claude'

const channels = (hex: string): [number, number, number] => {
  const h = /^#[0-9a-f]{6}$/i.test(hex) ? hex : '#808080'

  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
}

// `amount` of the way from `from` to `to`.
export function mix(from: string, to: string, amount: number): string {
  const a = channels(from)
  const b = channels(to)

  return `#${a.map((value, i) => Math.round(value + (b[i]! - value) * amount).toString(16).padStart(2, '0')).join('')}`
}

export function toneOf(skin: KitSkin | null): Tone {
  const isLight = skin?.isLight ?? false
  const palette = skin?.palette ?? (isLight ? NATIVE.light : NATIVE.dark)
  const name = skin?.name ?? NATIVE_NAME
  const isNative = name === NATIVE_NAME
  const line = mix(palette.surface, palette.fg, isLight ? 0.14 : 0.16)
  const hover = mix(palette.surface, palette.fg, isLight ? 0.05 : 0.07)
  const faint = mix(palette.muted, palette.surface, 0.35)
  const selected = mix(palette.surface, palette.user, isLight ? 0.14 : 0.22)
  const hex = { ...palette, accent: palette.user, line, hover, faint, selected }

  return {
    name,
    isNative,
    isLight,
    hex,
    ink: isNative
      ? { fg: undefined, muted: 'inactive', faint: 'subtle', accent: 'claude', ok: 'success', warn: 'warning', err: 'error', line, hover, selected }
      : { fg: palette.fg, muted: palette.muted, faint, accent: palette.user, ok: palette.ok, warn: palette.warn, err: palette.err, line, hover, selected },
  }
}

// A tone word as an element colour; no tone is the body text.
export function inkOf(t: Tone, tone: KitTone | undefined): string | undefined {
  switch (tone) {
    case 'ok':
      return t.ink.ok
    case 'warn':
      return t.ink.warn
    case 'err':
      return t.ink.err
    case 'muted':
      return t.ink.muted
    case 'accent':
      return t.ink.accent
    default:
      return t.ink.fg
  }
}

// The same, as hex for markup.
export function hexOf(t: Tone, tone: KitTone | undefined): string {
  switch (tone) {
    case 'ok':
      return t.hex.ok
    case 'warn':
      return t.hex.warn
    case 'err':
      return t.hex.err
    case 'muted':
      return t.hex.muted
    case 'accent':
      return t.hex.accent
    default:
      return t.hex.fg
  }
}
