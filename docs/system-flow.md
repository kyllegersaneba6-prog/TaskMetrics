# System Flow

This document explains the main workflows in TaskMetrics step by step.

---

## 1. User Onboarding Flow

```
[Launch App]
    │
    ▼
[Check Auth State]
    │
    ├── Loading → Show LoadingSpinner
    │
    ├── Authenticated → Redirect to Dashboard
    │
    └── Not Authenticated → Show Login Screen
                            │
                            ├── Enter email + password
                            │   Tap "Sign In"
                            │   │
                            │   ├── Valid → Navigate to Dashboard
                            │   └── Invalid → Show error message
                            │
                            └── Tap "Create Account"
                                │
                                ▼
                            [Registration Screen]
                                │
                                ├── Fill in name, email, password, confirm
                                │   Tap "Create Account"
                                │   │
                                │   ├── Valid → Create account → Navigate to Dashboard
                                │   └── Invalid → Show field validation errors
                                │
                                └── Tap "Sign In" → Back to Login
```

---

## 2. Task Creation Flow

```
[Dashboard or Tasks Screen]
    │
    ▼
[Tap FAB (+ button)]
    │
    ▼
[BottomSheet opens with TaskFormSheet]
    │
    ▼
[User fills in fields]
    │
    ├── Title (required)
    ├── Description (optional)
    ├── Category (select chip)
    ├── Deadline (tap to open date picker)
    ├── Reminder (optional toggle)
    │   ├── Toggle ON
    │   ├── Select date (tap "Date")
    │   ├── Select time (tap "Time")
    │   └── Select alarm sound (dropdown: Default / Alarm)
    │
    ▼
[Tap "Add Task" button]
    │
    ▼
[System validates]
    │
    ├── Title empty → Show validation error "Title is required"
    └── Title present → Continue
    │
    ▼
[System creates task object]
    │
    ├── Generate unique ID
    ├── Set userId from authenticated user
    ├── Set createdAt / updatedAt to current time
    │
    ▼
[Firebase available?]
    │
    ├── YES → Write task document to Firestore collection "tasks"
    │         → Firestore onSnapshot listener updates local state
    │
    └── NO → Add task to in-memory state array
    │
    ▼
[Reminder set?]
    │
    ├── YES → Schedule local notification via expo-notifications
    │         → Store notificationId on task
    │
    └── NO → Continue
    │
    ▼
[Close BottomSheet]
    │
    ▼
[Task appears in list with staggered entrance animation]
```

---

## 3. Task Edit Flow

```
[Tasks Screen]
    │
    ▼
[Tap context menu (⋮) on task card → "Edit"]
    │  OR
[Tap task card → TaskDetailSheet → "Edit Task" button]
    │
    ▼
[BottomSheet opens with TaskFormSheet]
    │
    ├── Fields pre-filled with existing task data
    │
    ▼
[User modifies fields]
    │
    ▼
[Tap "Update Task"]
    │
    ▼
[System validates (title required)]
    │
    ▼
[System updates task object]
    │
[Reminder changed?]
    ├── YES:
    │   ├── Cancel old notification (if notificationId exists)
    │   ├── Schedule new notification (if new reminderAt set)
    │   └── Update notificationId on task
    │
    └── NO → Continue
    │
    ▼
[Firebase available?]
    ├── YES → Update Firestore document
    └── NO → Update in-memory state
    │
    ▼
[Close BottomSheet]
    │
    ▼
[Task card updates in list]
```

---

## 4. Task Deletion Flow

```
[Tasks Screen]
    │
    ▼
[Tap context menu (⋮) → "Delete"]
    │  OR
[TaskDetailSheet → "Delete" button]
    │  OR
[Task Detail Screen → "Delete" button]
    │
    ▼
[ConfirmDialog opens]
    │
    ├── Slides in from left
    ├── Shows task title in message
    │
    ├── [Tap "Cancel"]
    │   └── Dialog slides out to the left → Nothing happens
    │
    └── [Tap "Delete"]
        │
        ▼
        [Cancel scheduled notification if exists]
        │
        ▼
        [Firebase available?]
        ├── YES → Delete Firestore document
        └── NO → Remove from in-memory state
        │
        ▼
        [Dialog slides out to the right]
        │
        ▼
        [Task removed from list]
        │
        ▼
        [In-app notification added: "deleted"]
```

---

## 5. Task Completion Toggle Flow

```
[Tasks Screen — Tap checkbox on TaskCard]
    │
    ▼
[System determines new status]
    │
    ├── Current: "pending" → New: "completed"
    └── Current: "completed" → New: "pending"
    │
    ▼
[New status is "completed"?]
    │
    ├── YES:
    │   ├── Cancel scheduled reminder notification
    │   └── Clear notificationId on task
    │
    └── NO → Continue
    │
    ▼
[Animated checkbox plays spring sequence]
    │   0.85 → 1.1 → 1.0
    │   Checkmark icon fades in/out
    │
    ▼
[Firebase available?]
    ├── YES → Update Firestore document status + notificationId
    └── NO → Update in-memory state
    │
    ▼
[New status is "completed"?]
    │
    ├── YES → Push in-app notification: "completed"
    └── NO → Continue
    │
    ▼
[Task card UI updates]
    │
    ├── Status badge changes
    ├── Checkbox filled/empty
    └── Dashboard stats auto-update (via state)
```

---

## 6. Reminder Notification Flow

```
[Task created/edited with reminderAt set]
    │
    ▼
[scheduleTaskReminder() called]
    │
    ├── Checks if reminderAt is in the future
    ├── Creates NotificationContentInput with:
    │   ├── title: "Task Reminder"
    │   ├── body: '"Task Title" is due soon'
    │   ├── data: { taskId }
    │   ├── sound: "default" or alarm channel URI
    │   └── categoryIdentifier: "task-reminder"
    │
    └── Schedules with Notifications.scheduleNotificationAsync()
        │
        ├── Returns notification ID
        └── Stored on task as notificationId
    │
    ▼
[Time elapses → OS fires notification at scheduled time]
    │
    ├── App in foreground:
    │   └── setNotificationHandler shows alert + plays sound
    │
    ├── App in background/killed:
    │   ├── OS shows notification in system tray
    │   ├── Plays sound through selected channel
    │   └── Shows "Stop" action button
    │
    ▼
[User taps notification]
    │
    ├── addNotificationResponseListener fires
    │   ├── Navigates to Tasks screen: router.push("/(tabs)/tasks")
    │   └── Emits taskId via taskOpenRef
    │       └── Tasks screen subscribes → finds task → opens TaskDetailSheet
    │
    └── [User taps "Stop" action]
        └── Dismisses notification
```

---

## 7. Dashboard Analytics Flow

```
[Dashboard Screen mounts]
    │
    ▼
[System reads tasks from TasksContext]
    │
    ▼
[Calculate statistics]
    │
    ├── total = tasks.length
    ├── completed = tasks where status === "completed"
    ├── pending = tasks where status === "pending"
    ├── overdue = tasks where deadline is past AND status !== "completed"
    │
    ▼
[Calculate weekly productivity]
    │
    ├── Filter tasks by current week (Sunday–Saturday)
    ├── weeklyCompleted = count of completed this week
    ├── weeklyTotal = total tasks this week
    ├── completionRate = weeklyCompleted / weeklyTotal * 100
    │
    ▼
[Render stat cards with animations]
    │
    ├── Each card shows icon, label, value
    ├── Unique rounded corner patterns
    └── Subtle colored backgrounds
    │
    ▼
[Render recent tasks]
    │
    ├── Slice: 5 on phone, 8 on tablet
    └── Each card tappable → navigates to Tasks with highlight
```

---

## 8. Search and Filter Flow

```
[Tasks Screen]
    │
    ├── [Tap search icon]
    │   │
    │   ▼
    │   [Search modal springs from icon position]
    │   │
    │   ▼
    │   [User types in search field]
    │   │
    │   ▼
    │   [System filters tasks by title (case-insensitive)]
    │   │
    │   ▼
    │   [FlatList updates with matching tasks]
    │   │
    │   └── [Tap "Clear" or close] → Resets to all tasks
    │
    └── [Tap filter icon]
        │
        ▼
        [Filter dropdown animates open]
        │
        ▼
        [User selects filter chip: All / Pending / In Progress / Completed]
        │
        ▼
        [Active chip bounces (0.92 → 1.05 → 1.0)]
        │
        ▼
        [System filters tasks by selected status]
        │
        ▼
        [FlatList updates with filtered tasks]
        │
        ├── No matches → Show EmptyState component
        │
        └── [Tap clear filter footer] → Resets to "All"
```

---

## 9. Theme Toggle Flow

```
[Settings Screen]
    │
    ▼
[User taps "Light" or "Dark" in Appearance section]
    │
    ▼
[System calls setMode("light" | "dark")]
    │
    ▼
[ThemeContext updates colors object]
    │
    ├── Light → COLORS constant
    └── Dark → DARK_COLORS constant
    │
    ▼
[All screens re-render with new colors]
    │
    ├── Backgrounds change (FAFAFA ↔ 121212)
    ├── Text colors swap
    ├── Borders, cards, inputs update
    ├── StatusBar style adjusts (dark ↔ light)
    └── Tab bar and headers adapt
```

---

## 10. Authentication Flow

```
[App Launch]
    │
    ▼
[Firebase onAuthStateChanged listener fires]
    │
    ├── User found → Set user state → App loads
    └── No user → Set loading=false → App shows login
    │
    ▼
[Login/Register]
    │
    ├── Firebase available:
    │   └── signInWithEmailAndPassword / createUserWithEmailAndPassword
    │
    └── Firebase unavailable (demo mode):
        └── Create demo user object with fake uid
    │
    ▼
[User state updates → TasksContext loads tasks]
    │
    ├── Firebase: onSnapshot query matching user.uid
    └── Demo: empty in-memory array
    │
    ▼
[Sign Out]
    │
    └── Firebase: signOut → onAuthStateChanged fires null
        └── Demo: setUser(null)
    │
    ▼
[TasksContext clears tasks]
    │
    ▼
[Navigate to login screen]
```
