# Core user scenarios

These scenarios are the handoff for Figma screens and interaction prototypes. Keep the desktop sidebar, mobile navigation, and all three locales in the corresponding frames.

## 1. Register and choose preferences

1. User opens the app and sees the registration purpose and the data kept in this browser.
2. User enters name, email, and city.
3. Inline validation identifies missing or malformed values without clearing the form.
4. On success, the user lands on Today with their name and city visible.
5. From Profile → Settings, the user chooses Kazakh, Russian, or English and a light or dark theme. Changes are previewed immediately and saved with a confirmation.

## 2. Plan a meal and track nutrition

1. User selects Nutrition and chooses a month and date.
2. User switches between breakfast, lunch, and dinner recommendations.
3. A meal card shows its portion in grams and estimated calories before it is added.
4. User selects the portion size and adds the meal.
5. The date summary updates its grams and estimated kcal against the daily target; the app explains when no target has been set.
6. A reminder notification names the meal and date. Opening it shows a separate detail view.

## 3. Log movement and review the month

1. User enters a step count or chooses walking, yoga, running, dance, or another activity.
2. The app validates the value and confirms the saved activity.
3. Progress shows a week summary for steps, water, meals, and sleep.
4. User switches to the month view to compare days and see which dates have recorded data.
5. Missing dates are shown as “no entry,” not as zero activity.

## 4. Share a photo and interact with friends

1. User opens Community and starts a post.
2. User writes a caption, chooses an image, and sees a preview before publishing.
3. On success, the post appears in the feed with like and comment actions.
4. User opens Friends, adds a friend, and selects their profile card.
5. The friend profile uses the same layout as the user's profile, including photo or initials, progress, and achievements, subject to profile visibility.

## 5. Find a place and save a reservation request

1. User selects a city and browses activities or healthy restaurants.
2. Filters narrow the list; a no-results state offers a way to clear filters.
3. User opens a place, selects date, time, and party size, then submits.
4. The app shows the saved request details and sends a reminder. If there is no live provider integration, the confirmation must say “request saved” instead of “booking confirmed.”

## 6. Ask AI or contact support

1. User opens the AI chat and sees a personalized greeting plus suggested questions about meals, movement, sleep, friends, or settings.
2. The assistant replies in the selected language and can point to the relevant app section.
3. If the assistant cannot answer, it says so plainly and offers the Support conversation when available.
4. The user sends a support message; a pending, delivered, or failed state is visible. A failed message stays in the composer for retry.

## Prototype frame checklist

- Desktop: 1440 × 900 frames for Today, Nutrition, Progress, Profile, Community, and Support.
- Mobile: 390 × 844 frames for Today, Nutrition, photo post, friend profile, notification detail, and settings.
- Variants: light and dark theme; Kazakh, Russian, and English for at least one long label; empty and validation error states for key forms.
- Show keyboard focus on one interactive control and a screen-reader-friendly status example in the handoff notes.
