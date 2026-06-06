# Add Data

This page explains how data (tasks) is added in TaskMetrics.

---

## Data Entry Screen

Tasks are added through a **bottom sheet form** called `TaskFormSheet` (`src/components/TaskFormSheet.js`). The user opens it by:

1. Going to the **Tasks** tab
2. Tapping the **+ button** (floating action button) at the bottom right
3. The bottom sheet slides up with the form

### Form Fields:

| Field | Type | Required |
|-------|------|----------|
| Title | Text input | Yes |
| Description | Multi-line text input | No |
| Category | Chip selector: Work, Personal, Study, Health, Other | No (defaults to first category) |
| Deadline | Date picker | No |
| Reminder | Toggle switch + date+time pickers + alarm sound dropdown | No |

---

## Validation Process

When the user taps **Add Task**:

1. **Title check** — if the title is empty or only whitespace, an error message "Title is required" is shown and the form does not submit
2. **Reminder check** — if the "Remind me" toggle is ON, the user must select both reminder date and reminder time (validated at save time)
3. All other fields are optional — they use default values or null

---

## After Submission

If validation passes:

1. The form calls `addTask()` from **TasksContext** (`src/context/TasksContext.js`)
2. TasksContext creates a task object with:
   - Auto-generated `id` (timestamp + random string)
   - `userId` from the authenticated user
   - Trimmed title and description
   - Selected category (or `"Other"`)
   - Status defaults to `"pending"`
   - Deadline and reminder timestamps (or null)
   - `createdAt` and `updatedAt` set to current time
3. If a reminder is set, a **notification** is scheduled via `expo-notifications`
4. The task is saved

### When Firebase is available:
- The task is saved to Firestore using `addDoc()` in the `tasks` collection
- Timestamps use Firestore's `serverTimestamp()`
- The task list updates in real time via `onSnapshot()`

### When Firebase is unavailable (demo mode):
- The task is added to the local in-memory array
- It appears immediately in the list
- Data is lost when the app restarts

---

## Confirmation

The system confirms success by:

1. Closing the bottom sheet form
2. The new task appears in the **FlatList** on the Tasks screen
3. No toast or alert is shown (the visual update is the confirmation)
