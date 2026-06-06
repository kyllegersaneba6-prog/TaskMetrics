# Updates

This page explains how tasks are updated (edited) in TaskMetrics.

---

## Selecting Data to Edit

The user can edit a task in two ways:

1. **From the task list** — tap the **edit icon** (pencil) on a `TaskCard` component
2. **From the detail sheet** — open a task by tapping its card, then tap the **edit icon** in the detail view

Both actions call `handleEdit(task)` in the Tasks screen, which sets the `editTask` state and opens the bottom sheet.

---

## Loading Current Data

When the edit form (`TaskFormSheet`) opens:

- It receives the existing task data via the `existingTask` prop
- The form initializes all fields with the current values:
  - Title, description, category, status, deadline
  - Reminder toggle (`remindMe`) is set to `true` if `reminderAt` exists
  - Reminder date/time are converted from ISO string to JavaScript `Date` objects
  - Alarm sound is set to `soundName`
- The save button text changes to **"Update Task"** instead of "Add Task"
- A **Status** field appears (only in edit mode) as chip selectors for Pending, In Progress, Completed

---

## Validating Changes

The same validation rules apply as for adding:

- Title must not be empty ("Title is required")
- Reminder date and time must be selected if the reminder toggle is ON
- Other fields are optional

---

## Saving Changes Back to Firebase

When the user taps **Update Task**:

1. Validation runs
2. If valid, the form calls `updateTask(id, data)` from **TasksContext**
3. TasksContext:

### Reminder handling:
- Compares the new `reminderAt` with the existing task's `reminderAt`
- If changed:
  - Cancels the old notification (if `notificationId` exists)
  - Schedules a new reminder (if `reminderAt` is set)
  - Updates `notificationId` with the new ID (or null if reminder removed)

### Firebase update:
- Calls `updateDoc(doc(db, "tasks", id), { ... })` to update Firestore
- Timestamps: `updatedAt` uses `serverTimestamp()`

### Demo mode:
- Updates the task object in the local state array
- No Firestore write occurs

---

## After Successful Update

1. The bottom sheet closes
2. The task list re-renders with updated data (driven by `onSnapshot` or state update)
3. The changes are visible immediately on the task card and detail view
