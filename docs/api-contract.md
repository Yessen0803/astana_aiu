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

## Proposed notification contract (not implemented)

The current notification UI stores messages in browser storage. These routes
are the proposed contract for a future shared inbox; they must not be treated
as available until authentication, persistence, and ownership checks exist.

### `GET /api/notifications?status=read|unread`

Returns only notifications owned by the authenticated user, filtered by read
state. Each item has a stable `id`, `title`, `message`, `icon`, `createdAt`, and
`readAt` (`null` while unread).

### `PATCH /api/notifications/:id/read`

Marks one notification as read for the authenticated owner. Repeating the
request is idempotent. A notification owned by a different user must not be
revealed or modified.

### `PATCH /api/notifications/read-all`

Marks the authenticated user's unread notifications as read. Other users'
notifications are never affected.

### `DELETE /api/notifications?status=read|unread`

Deletes only the authenticated user's notifications in the requested state.
The frontend's read-message page must request `status=read`; the top-bar bell
must request `status=unread`.

All routes require server-verified authentication. User identity comes from the
session, never from a client-supplied user ID, email, or role.

## Still needs agreement before implementation

- Authentication method and how the server determines the signed-in user.
- Database choice and migration workflow.
- Admin authorization and support-thread ownership rules.
- Error response format and frontend API client integration.

Do not use a client-provided email or role as authorization. The current UI demo
stores support messages in browser storage and is not connected to this API.
