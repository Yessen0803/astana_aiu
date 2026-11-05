# Screen state specifications

Every screen should have a clear loading, empty, success, and error state where the action can fail or data can be absent. Keep the user's draft and selected date when an operation fails.

| Area | Empty or first-use state | Error state | Success feedback |
| --- | --- | --- | --- |
| Registration | Explain what the profile unlocks; show name, email, and city fields. | Put a specific message beside the invalid field; preserve other values. | Confirm profile creation and continue to Today. |
| Today | Show today's habit, water, movement, and sleep prompts with one obvious next action. | Invalid values stay in the field and explain the allowed range. | Confirm the saved item and refresh today's summary. |
| Planning | Explain that no meals are planned for the selected date; link to Nutrition. | Keep the selected month/date if plan data cannot be read. | Show the selected meal and date in the plan. |
| Nutrition | Offer breakfast, lunch, and dinner suggestions for the selected date. | Reject missing/invalid portion grams with an inline explanation; keep the chosen dish. | Add the dish, grams, and estimated kcal to the day total; show a reminder notification. |
| Movement | Start with a step target and a way to log steps or choose an activity. | Accept only a non-negative whole step count; explain the expected value. | Update the daily and weekly totals and show the logged activity. |
| Care and sleep | Invite the user to log sleep time and select care habits. | Explain invalid or incomplete time values; do not replace the previous entry. | Show sleep duration and compare only with dates that have recorded data. |
| Community | Show a friendly prompt to publish the first post and explain photo selection. | Explain unsupported file type/size or save failure; retain the text draft. | Preview the published post and update the feed; likes and comments show their new count. |
| Friends | Explain how to add a friend; show a useful empty illustration or initials avatar. | Identify duplicate or missing names without clearing the form. | Add the friend card; opening it shows the same profile structure as the current user's profile. |
| Restaurants | Show places for the selected city and a no-results message when filters match nothing. | Keep city and filters selected if place data is unavailable. | Confirm the selected place, date, time, and party size. In the local demo, label this as a saved request rather than a confirmed booking. |
| Profile and settings | Use initials when there is no photo; make edit and settings actions visible. | Explain why an image cannot be used; retain the existing avatar and profile fields. | Confirm the profile or preference save without implying server sync. |
| Support / AI chat | Show a greeting, sample questions, and how to reach human support when available. | Preserve the unsent message and provide a retry action. | Show the sent message in the thread and a clear delivery state. |
| Notifications | Explain that new reminders will appear here. | If the list cannot load, offer retry and keep the unread indicator understandable. | Opening a notification shows its own detail view; mark it read only after the user opens it. |

## Shared interaction rules

- Loading: show a small skeleton or progress indicator near the affected content; avoid blocking the entire app for a card-level action.
- Empty: state what is missing and offer one relevant action. Do not use an empty chart as the only explanation.
- Validation: describe how to fix the field, not just that it is invalid. Associate the message with the input.
- Error: keep user-entered data, show a retry path, and do not announce a save that did not happen.
- Success: use concise confirmation near the changed content; notification reminders may supplement but must not replace inline feedback.
- Local demo: label local-only saves where a user could reasonably expect cloud sync, account creation, live chat, or a confirmed reservation.
