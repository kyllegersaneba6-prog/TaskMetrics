# Validation & Rules

This document lists all validation rules and business logic constraints in TaskMetrics.

---

## Form Validation

### Task Form (`TaskFormSheet.js`)

| Field | Rule | Error Message | Type |
|-------|------|---------------|------|
| Title | Must not be empty after trimming | `"Title is required"` | Required field |
| Title | No maximum length enforced | — | — |
| Description | Optional | — | Optional |
| Category | Defaults to first category | — | Default value |
| Status | (Edit only) Defaults to `"pending"` | — | Default value |
| Deadline | Must be a valid date or null | — | Optional |
| Reminder Date | Must be selected if reminder toggle is ON | — | Conditional |
| Reminder Time | Must be selected if reminder toggle is ON | — | Conditional |

**Note:** The reminder `reminderAt` datetime is always saved when the toggle is ON and both date/time are selected. It is NOT rejected if the time is in the past — the notification service handles past dates by simply not scheduling.

---

### Registration Form (`register.js`)

| Field | Rule | Error Message | Type |
|-------|------|---------------|------|
| Full Name | Must not be empty | — | Required |
| Email | Must not be empty | — | Required |
| Password | Must be at least 6 characters | — | Min length |
| Confirm Password | Must match Password | — | Must match |

**Validation Logic:**

```javascript
if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
  // Show "All fields are required" alert
}
if (password.length < 6) {
  // Show "Password must be at least 6 characters" alert
}
if (password !== confirmPassword) {
  // Show "Passwords do not match" alert
}
```

---

### Login Form (`login.js`)

| Field | Rule | Error Message | Type |
|-------|------|---------------|------|
| Email | Must not be empty | — | Required |
| Password | Must not be empty | — | Required |

**Note:** Email format validation is handled by Firebase Authentication on the server side. Invalid emails receive a mapped error message.

---

## Data Validation (Backend)

### Task Data Model

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | `string` | Auto-generated: `Date.now() + "_" + Math.random().toString(36).slice(2, 7)` |
| `userId` | `string` | Set from authenticated user's `uid` |
| `title` | `string` | Trimmed on save; must be non-empty for form submission |
| `description` | `string` | Trimmed on save; defaults to `""` |
| `category` | `string` | Must be one of: `"Work"`, `"Personal"`, `"Study"`, `"Health"`, `"Other"`; defaults to first category |
| `status` | `string` | Must be one of: `"pending"`, `"in_progress"`, `"completed"`; defaults to `"pending"` |
| `deadline` | `string` (ISO) | Optional; can be `null` |
| `reminderAt` | `string` (ISO) | Optional; can be `null` |
| `notificationId` | `string` | Optional; set by notification service |
| `soundName` | `string` | Must be `"default"` or `"alarm"`; defaults to `"default"` |
| `createdAt` | `string` (ISO) | Set to current time on creation |
| `updatedAt` | `string` (ISO) | Updated on every modification |

---

## Notification Validation

### `scheduleTaskReminder(task)`

| Check | Action |
|-------|--------|
| `reminderAt` is `null` or `undefined` | Not called by context (guarded) |
| `reminderAt` date is in the past (`<= new Date()`) | Returns `null` (no notification scheduled) |
| `notificationId` exists and schedule succeeds | Returns the notification ID string |
| `expo-notifications` throws an error | Caught, returns `null` |

---

## Business Rules

### Task Status Rules

| Current Status | Toggle Action | New Status | Side Effects |
|---------------|---------------|------------|--------------|
| `pending` | Tap checkbox | `completed` | Cancel reminder notification, push in-app notification |
| `completed` | Tap checkbox | `pending` | None |

### Task Deletion Rules

| Action | Confirmation Required | Side Effects |
|--------|-----------------------|--------------|
| Delete from context menu | Yes (ConfirmDialog) | Cancel reminder, push in-app "deleted" notification |
| Delete from detail sheet | Yes (ConfirmDialog) | Cancel reminder, push in-app "deleted" notification |
| Delete from detail screen | Yes (ConfirmDialog) | Cancel reminder, push in-app "deleted" notification |

### Reminder Update Rules (on Edit)

| Change | Action |
|--------|--------|
| Reminder removed (set to `null`) | Cancel existing notification, clear `notificationId` |
| Reminder time changed | Cancel existing notification, schedule new one, update `notificationId` |
| Reminder unchanged | No action |
| New reminder added | Schedule new notification |

---

## UI/UX Constraints

| Constraint | Rule |
|------------|------|
| Save button during save | Disabled, shows "Saving..." text, 0.6 opacity |
| Task title in FlatList | Truncated after 2 lines |
| Task description in FlatList | Truncated after 1 line |
| In-app notifications | Capped at 20 most recent entries |
| Recent tasks on Dashboard | Max 5 on phone, 8 on tablet |
| Bottom sheet snap point | 78% of screen height |
| Filter chips per row | 2 on phone, 4 on tablet |
| ConfirmDialog max width | 320px on phone, 400px on tablet |

---

## Security Rules (Future)

> **TODO:** These Firestore security rules are suggested but not yet deployed.

```javascript
// Firestore security rules for production:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      allow read, update, delete: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow create: if request.auth.uid == request.resource.data.uid;
      allow update: if request.auth.uid == userId;
    }
  }
}
```
