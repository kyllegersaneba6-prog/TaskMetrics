# Delete

This page explains how task deletion works in TaskMetrics.

---

## Selecting Data to Delete

The user can delete a task in two ways:

1. **From the task list** — tap the **delete icon** (trash) on a `TaskCard` component
2. **From the detail sheet** — open a task by tapping its card, then tap the **delete button** in the detail view

Both actions set `deleteTarget` state in the Tasks screen with the selected task object.

---

## Confirmation Before Deletion

Before any deletion occurs, a **ConfirmDialog** appears (`src/components/ConfirmDialog.js`):

- **Title:** "Delete Task"
- **Message:** `Are you sure you want to delete "<task title>"?`
- **Two buttons:**
  - **Cancel** (outlined) — dismisses the dialog, returns to the task list
  - **Delete** (filled red) — proceeds with deletion
- The dialog has a slide animation: slides in from the left, slides out to the right on confirm, or back to the left on cancel
- The user can also dismiss by tapping the backdrop or pressing the hardware back button

---

## Removing Data from Firebase

When the user confirms deletion:

1. `handleDelete()` in the Tasks screen calls `deleteTask(id)` from **TasksContext**
2. TasksContext finds the task in the current list and:
   - Cancels any scheduled reminder notification (if `notificationId` exists), using `cancelTaskReminder()`
3. **If Firebase is available:** calls `deleteDoc(doc(db, "tasks", id))` — removes the document from Firestore
4. **If in demo mode:** removes the task from the local in-memory array with `setTasks(prev => prev.filter(...))`
5. An in-app notification is pushed: type `"deleted"` with the task title (capped at 20 recent notifications)

---

## After Deletion

1. The ConfirmDialog closes
2. The task disappears from the FlatList (real-time via Firestore `onSnapshot` or local state update)
3. If the detail sheet was open, it closes
4. An in-app notification briefly appears in the notification panel
5. The list count updates (header shows fewer tasks)
