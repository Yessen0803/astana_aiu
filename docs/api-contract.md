# HealthFlow API contract

This document records the first backend/frontend agreement. User-specific routes
must not be exposed until authentication and database ownership are implemented.

## Implemented

### `GET /api/health`

Returns `200` when the Next.js API handler is available.

```json
{
  "ok": true,
  "service": "healthflow-api",
  "timestamp": "2026-11-05T00:00:00.000Z"
}
```

## Shared request type

`CreateSupportMessageInput` is the agreed validation shape for a future support
message endpoint:

```json
{
  "name": "Esen",
  "email": "esen@example.com",
  "text": "I need help with my plan."
}
```

The backend validator trims the values, lowercases the email, limits names to
60 characters, and limits message text to 1000 characters.

## Still needs agreement before implementation

- Authentication method and how the server determines the signed-in user.
- Database choice and migration workflow.
- Admin authorization and support-thread ownership rules.
- Error response format and frontend API client integration.

Do not use a client-provided email or role as authorization. The current UI demo
stores support messages in browser storage and is not connected to this API.
