# HealthFlow design system

## Visual direction

Use a calm, modern wellness dashboard: warm off-white surfaces, deep green actions, readable dark text, and restrained illustrations. Favor clear progress and practical next steps over competition, streak pressure, or calorie-shaming language.

## Color tokens

These values match the current app CSS (`app/healthflow.css`). Components should use the shared CSS variables rather than introducing one-off colors.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--hf-bg` | `#f4f6f2` | `#0d1114` | Page background |
| `--hf-card` | `#ffffff` | `#151b20` | Cards, menus, dialogs |
| `--hf-ink` | `#1c2925` | `#eef3ef` | Primary text |
| `--hf-muted` | `#7a8780` | `#a0aaa5` | Supporting text |
| `--hf-line` | `#e6ebe5` | `#293238` | Borders and dividers |
| `--hf-soft` | `#eef3ed` | `#1d2925` | Selected and quiet surfaces |
| `--hf-accent` | `#4b8064` | `#80bd91` | Links, highlights, progress |
| `--hf-accent-dark` | `#34634c` | `#91c69f` | Primary actions and focus |

Use semantic status colors in addition to an icon and text label: success `#2f7a4d`, warning `#9a6714`, and error `#b7474f`. Check contrast against both themes before shipping. Never communicate status by color alone.

## Typography

- Typeface: `Inter`, followed by the system sans-serif stack already used by the app.
- Page title: 31 px, weight 700–800, tight line height.
- Section title: 19 px, weight 700.
- Body: 14–16 px in new screens; use 12 px only for secondary labels where it remains readable.
- Helper text: 12–13 px, with comfortable line spacing.
- Numbers: use tabular numerals for steps, grams, calories, sleep duration, and dates where possible.

The current implementation has compact 9–12 px text in several areas. New designs should improve readability without making the dashboard feel crowded.

## Layout and components

- Desktop: retain the current fixed 245 px sidebar and a centered content area capped around 1300 px.
- Mobile: replace the desktop navigation with the existing compact/mobile navigation pattern; cards become one column and actions remain reachable without horizontal scrolling.
- Use 16 px card corners, 9–12 px control corners, subtle borders, and a soft shadow only for elevated surfaces.
- Keep a consistent spacing rhythm based on 4 px: 8, 12, 16, 24, and 32 px are the common steps.
- Inputs and touch targets should be at least 40 px high; target 44 px for primary mobile controls.
- A panel heading places its title and one related action together. Avoid multiple competing primary buttons in one panel.
- Preserve the visible keyboard focus style. Dialogs must have a clear title, close action, and a sensible focus order.

## Theme and language behavior

- Support light and dark themes with the same content hierarchy; theme changes must not alter saved data.
- Support Kazakh (`kk`), Russian (`ru`), and English (`en`). Keep layouts flexible for translated text and longer labels.
- Format dates and numbers for the selected locale. Keep units visible (`қадам`, `г`, `ккал`, `сағ`).
- Do not mix translated UI text with hard-coded labels in the same component.

## Accessibility checklist

- Use semantic headings, labels, buttons, and form errors connected to their fields.
- All actions must work by keyboard, with a visible focus indicator and no keyboard traps.
- For dialogs, move focus inside on open, close on Escape, and return focus to the trigger.
- Announce save and error feedback with a live status region.
- Provide useful alt text for meaningful photos; mark decorative art as hidden from assistive technology.
- Respect reduced-motion preferences and avoid flashing or rapidly animated progress effects.
- Check text and control contrast in both themes; aim for WCAG AA contrast.
