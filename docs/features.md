# Features

This document lists and explains all major features of the TaskMetrics system, grouped by functional area.

---

## Task Management

### Create Task
Users can create a new task by tapping the **+** button (FAB) on the Dashboard or Tasks screen. A bottom sheet form opens with the following fields:

- **Title** (required) — A short name for the task
- **Description** (optional) — Detailed notes about the task
- **Category** — Work, Personal, Study, Health, or Other
- **Deadline** (optional) — A date picker for setting the due date
- **Reminder** (optional) — A toggle that reveals date/time pickers and an alarm sound selector

### View Tasks
Tasks are displayed as cards in a scrollable list on the Tasks screen. Each card shows:

- Color accent bar on the left edge
- Category label
- Deadline date (with overdue indicator)
- Title and description preview
- Status badge (Pending, In Progress, Completed)
- Checkbox for quick completion toggle
- Context menu (three dots) with View, Edit, and Delete options

### Edit Task
Users can edit a task by tapping the edit icon in the task card's context menu or the "Edit Task" button in the task detail sheet. The same form used for creation opens, pre-filled with existing data.

### Delete Task
Users can delete a task from the context menu or detail sheet. A confirmation dialog appears with:

- Slide-in animation from the left
- Warning icon and message
- "Cancel" button (slides back to the left)
- "Delete" button (slides out to the right)

### Task Detail View
Tapping a task card opens a bottom sheet with full task details, including:

- Category and status badges
- Full title and description
- Deadline with overdue warning
- Creation and update timestamps
- Action buttons: Mark Complete/Reopen, Edit, Delete

### Search Tasks
The Tasks screen includes a search icon that opens a search modal. Users can type to filter tasks by title in real time. The search modal animates from the search icon's position.

### Filter Tasks
A funnel icon opens a filter dropdown with options: All, Pending, In Progress, Completed. Each chip has a spring bounce animation when selected.

---

## Dashboard Analytics

### Statistics Cards
The Dashboard displays four stat cards showing:

- **Total** — All tasks count
- **Completed** — Tasks marked as completed (green)
- **Pending** — Tasks still pending (orange)
- **Overdue** — Tasks past their deadline (red)

Each card has a unique corner radius pattern and a subtle colored background.

### Weekly Productivity
A dedicated card shows the current week's completion rate as a percentage with a progress bar. It calculates:
- Number of tasks completed this week
- Total number of tasks
- Completion percentage

### Recent Tasks
The bottom of the Dashboard shows the 5 most recently created tasks (8 on tablets). Each is tappable and navigates to the Tasks screen, with a highlight animation on the selected task.

---

## Reminders & Notifications

### Scheduled Reminders
When creating or editing a task, users can enable "Remind me" to set a specific date and time for a notification. Available options:

- **Date picker** — Select the reminder date
- **Time picker** — Select the reminder time
- **Alarm Sound** — Dropdown to choose between Default and Alarm sound

### Local Notifications
The system uses `expo-notifications` to schedule local notifications that fire even when the app is not running. Key behaviors:

- Notifications fire at the exact scheduled time
- Sound plays according to the selected option
- On Android, separate notification channels are used for Default (HIGH importance) and Alarm (MAX importance) sounds
- A "Stop" action button is available on the notification to dismiss it

### Notification Tap Handling
Tapping a notification navigates the user to the Tasks screen and opens the specific task in the detail bottom sheet.

### In-App Notifications
When a task is completed or deleted, an in-app notification is added to the notification list (accessible from the bell icon on the Dashboard). Notifications are stored in memory and limited to the 20 most recent entries.

---

## User Interface

### Dark Mode
Users can toggle between Light and Dark themes from the Settings screen. The theme applies to all screens and components consistently.

### Responsive Layout
The UI automatically adapts to different screen sizes:

- **Phones** — Optimized for handheld use, 2 filter chips per row, 5 recent tasks
- **Tablets** — Wider layouts, 4 filter chips per row, 8 recent tasks, larger max widths on modals

### Animations
The app features a unified animation system:

- **Staggered entrance** — Screen content fades in and slides up with cascading delays (80ms increments)
- **Spring interactions** — Buttons scale to 0.97 on press, chips bounce when selected, FABs slide up
- **Modal transitions** — Bottom sheets slide up, dialogs slide in from edges, search modals spring from their origin point
- **Checkbox** — Spring scale sequence on task completion (0.85 → 1.1 → 1.0)

### Authentication

### Login
Users can sign in with email and password. The login screen features:

- Animated entrance (icon spring + card slide-up)
- Bouncy input fields with focus animations
- Password visibility toggle
- Error messages with slide-in animation
- "Create Account" link to registration

### Registration
New users can create an account with:

- Full Name, Email, Password, and Confirm Password fields
- Client-side validation (all fields required, passwords must match, minimum 6 characters)
- Auto-login after successful registration
- Creates a user document in Firestore (when available)

### Demo Mode
When Firebase is not configured (or initialization fails), the app operates in demo mode:

- Users can log in with any email and password
- A demo user is created with `displayName` from the email prefix
- Tasks are stored in memory (lost on app restart)
- Intended for evaluation and development purposes

---

## Settings

### Profile Display
The Settings screen shows the user's avatar, display name, and email.

### Theme Toggle
Users can switch between Light and Dark mode using radio-style checkmarks in the "Appearance" section.

### Account
An "Edit Profile" option is available (placeholder for future implementation).

### Support
The "Support" section includes:

- **Help Center** — Links to documentation
- **About** — Displays app version (1.0.0)

### Sign Out
A "Sign Out" button with confirmation alert ends the user session and returns to the login screen.
