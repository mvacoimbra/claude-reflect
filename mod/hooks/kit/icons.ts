// The pack's icons: outline paths on a 24-unit grid, drawn with one stroke (1.8, round caps
// and joins), the set skins' tool rows started. An icon is a whole SVG document, for the
// `Svg` element; the terminal draws no Svg, so callers pass a fallback there or nothing.
//
// Shared kit: edit in claude-mods-hub/kit, never in a copy.

export const ICON_PATHS = {
  // Tool kinds, as skins draws them.
  run: '<path d="M5 7l5 5-5 5"/><path d="M12 18h7"/>',
  write: '<path d="M4 20h4L18.5 9.5a2.83 2.83 0 0 0-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>',
  read: '<path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"/><path d="M9 13h6M9 17h4"/>',
  search: '<circle cx="10" cy="10" r="6.5"/><path d="M20 20l-5.2-5.2"/>',
  web: '<circle cx="12" cy="12" r="8.5"/><path d="M3.8 9.5h16.4M3.8 14.5h16.4"/><path d="M11.5 3.5a15 15 0 0 0 0 17M12.5 3.5a15 15 0 0 1 0 17"/>',
  mcp: '<path d="M9.8 6.2l8 8-2 2a5.66 5.66 0 0 1-8-8z"/><path d="M4 20l3.6-3.6M15 4l-3.4 3.4M20 9l-3.4 3.4"/>',
  other: '<circle cx="12" cy="12" r="3"/>',

  // Navigation and state.
  chevronRight: '<path d="M9 5l7 7-7 7"/>',
  chevronLeft: '<path d="M15 5l-7 7 7 7"/>',
  chevronDown: '<path d="M5 9l7 7 7-7"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  alert: '<path d="M12 4l9 16H3z"/><path d="M12 10v4.5"/><path d="M12 17.5v.01"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5"/><path d="M12 7.5v.01"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  refresh: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5v4h-4"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
  eyeOff: '<path d="M4 4l16 16"/><path d="M9.9 6A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-2.6 3.4M6.4 7.6A15.5 15.5 0 0 0 2.5 12S6 18.5 12 18.5a9.4 9.4 0 0 0 4.2-1"/>',
  copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2"/>',
  external: '<path d="M13.5 4.5h6v6"/><path d="M19.5 4.5l-8 8"/><path d="M17.5 14v4a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 18V8A1.5 1.5 0 0 1 6 6.5h4"/>',
  play: '<path d="M8 5.5v13l10-6.5z"/>',
  pause: '<path d="M8.5 5.5v13M15.5 5.5v13"/>',
  stepBack: '<path d="M16 6l-7 6 7 6"/><path d="M7 6v12"/>',
  stepForward: '<path d="M8 6l7 6-7 6"/><path d="M17 6v12"/>',

  // The mods.
  cache: '<path d="M12 3.5c3.5 3.2 5.5 6 5.5 9a5.5 5.5 0 0 1-11 0c0-1.6.6-3 1.6-4.3.4 1.4 1.3 2.3 2.4 2.6-.4-2.8.2-5 1.5-7.3z"/>',
  skins: '<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.2 0 1.8-.8 1.8-1.7 0-1.1-.9-1.5-.9-2.4 0-.9.7-1.6 1.6-1.6h2a4 4 0 0 0 4-4C20.5 6.8 16.7 3.5 12 3.5z"/><circle cx="7.8" cy="11" r=".9"/><circle cx="10.5" cy="7.5" r=".9"/><circle cx="15" cy="7.8" r=".9"/>',
  folder: '<path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>',
  file: '<path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"/>',
  branch: '<circle cx="7" cy="5.5" r="2"/><circle cx="7" cy="18.5" r="2"/><circle cx="17" cy="8" r="2"/><path d="M7 7.5v9"/><path d="M17 10c0 4-10 2.5-10 6.5"/>',
  agents: '<rect x="4.5" y="8" width="15" height="11" rx="3"/><path d="M12 8V4.5"/><circle cx="12" cy="4" r=".8"/><path d="M9.5 13v1.5M14.5 13v1.5"/><path d="M2.5 12.5v2.5M21.5 12.5v2.5"/>',
  replay: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4.5v4h4"/><path d="M11 9.5v5l3.5-2.5z"/>',
  shield: '<path d="M12 3.5l7 2.8v5.2c0 4.3-3 7.6-7 9-4-1.4-7-4.7-7-9V6.3z"/><path d="M12 8.5v4"/><path d="M12 15.5v.01"/>',
  components: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
  settings: '<circle cx="12" cy="12" r="2.8"/><path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4L18 18M6 18l1.6-1.6M16.4 7.6L18 6"/>',
  mods: '<path d="M4 7h16M4 12h16M4 17h10"/>',
  reflect: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
} as const

export type IconName = keyof typeof ICON_PATHS

// The whole SVG document: `size` CSS pixels, stroked in `color`.
export function iconSvg(name: IconName, color: string, size = 16): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24"><g fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[name]}</g></svg>`
}

// The same paths placed inside a larger drawing, as skins' cards place theirs.
export const iconAt = (name: IconName, x: number, y: number, size: number, color: string): string =>
  `<g transform="translate(${x} ${y}) scale(${size / 24})" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[name]}</g>`
