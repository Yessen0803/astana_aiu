# HealthFlow UI/UX handoff

This folder is the implementation handoff for the UI/UX role. It describes the visual system, key user scenarios, and the states every screen should handle. The current Next.js app is the source of truth for existing navigation and components; use these notes when refining its Figma frames and implementation.

## Documents

- [Design system](design-system.md) — colors, type, layout, controls, and accessibility rules.
- [Screen states](screen-states.md) — loading, empty, validation, error, and success behavior.
- [User flows](user-flows.md) — the main paths through registration, daily tracking, community, and support.

## Product principles

1. Help people build steady routines without guilt or competitive pressure.
2. Keep the next useful action visible on every screen.
3. Explain health numbers in context. Calories and activity estimates are guidance, not medical advice.
4. Use the same interaction patterns in Kazakh, Russian, and English, and in both light and dark themes.
5. Make local-demo limitations clear where a feature is not backed by a server.

## Current app sections

Today, Planning, Nutrition, Movement, Care, Progress, Community, Friends, Restaurants, Profile, Support, and Admin. The app currently stores much of its demo data in this browser; the UI must not imply that a local save is a server sync or a confirmed reservation.
