# Pages & Screens

This document describes every screen in the TaskMetrics application, its purpose, main components, user actions, and expected results.

---

## Auth Screens

### Login Screen

| Aspect | Detail |
|--------|--------|
| **Route** | `/(auth)/login` |
| **File** | `app/(auth)/login.js` |
| **Purpose** | Authenticate existing users |

**Main Components:**
- Animated app icon with spring entrance
- Email `TextInput` with `BouncyInput` wrapper
- Password `TextInput` with visibility toggle and `BouncyInput` wrapper
- "Sign In" button using `PressableBounce`
- "Create Account" link text
- Animated error message display (slides in from top, auto-dismisses after 2s)

**User Actions:**
| Action | Result |
|--------|--------|
| Enter email and password | Input fields highlight on focus |
| Tap "Sign In" | Validates credentials, calls `login()` from AuthContext |
| Successful login | Navigates to `/(tabs)/dashboard` |
| Failed login | Shows error message with slide-in animation |
| Tap "Create Account" | Navigates to `/(auth)/register` |
| Tap eye icon | Toggles password visibility |

---

### Registration Screen

| Aspect | Detail |
|--------|--------|
| **Route** | `/(auth)/register` |
| **File** | `app/(auth)/register.js` |
| **Purpose** | Create a new user account |

**Main Components:**
- Animated app icon with spring entrance
- Full Name, Email, Password, Confirm Password inputs with `BouncyInput` wrappers
- "Create Account" button
- "Sign In" link
- Back button in header

**User Actions:**
| Action | Result |
|--------|--------|
| Fill in registration fields | Client-side validation on submit |
| Tap "Create Account" | Validates: all fields required, passwords match, password >= 6 chars |
| Successful registration | Creates account, auto-logs in, navigates to dashboard |
| Validation error | Shows inline error messages |
| Tap "Sign In" | Navigates back to login screen |
| Tap back arrow | Navigates back to login screen |

---

## Tab Screens

### Dashboard Screen

| Aspect | Detail |
|--------|--------|
| **Route** | `/(tabs)/dashboard` |
| **File** | `app/(tabs)/dashboard.js` |
| **Purpose** | Overview of task statistics and quick access |

**Main Components:**
- Header with title "Dashboard" and notification bell with badge count
- Animated notification modal (springs from bell icon position)
- 4 stat cards: Total, Completed (green), Pending (orange), Overdue (red)
- Weekly productivity card with progress bar
- Recent tasks list (5 items on phone, 8 on tablet)
- FAB (floating action button) to add new tasks
- BottomSheet + TaskFormSheet for task creation
- TabBubbleOverlay (decorative animated circles)

**User Actions:**
| Action | Result |
|--------|--------|
| View dashboard | Sees task statistics update in real time |
| Tap bell icon | Opens notification modal with spring animation |
| Tap "Clear All" in notifications | Clears in-app notification list |
| Tap a recent task | Navigates to Tasks screen with highlight animation |
| Tap FAB (+) | Opens task creation form in bottom sheet |
| Pull to refresh | Triggers refresh (no-op in current version) |

---

### Tasks Screen

| Aspect | Detail |
|--------|--------|
| **Route** | `/(tabs)/tasks` |
| **File** | `app/(tabs)/tasks/index.js` |
| **Purpose** | View, search, filter, and manage tasks |

**Main Components:**
- Header with title "Tasks", filter icon, search icon, help icon ("?")
- FlatList of TaskCard components with staggered entrance animation
- Search modal (springs from search icon origin)
- Filter dropdown with animated chip options
- Help modal with numbered instruction steps
- FAB for adding new tasks
- BottomSheet + TaskFormSheet for add/edit
- TaskDetailSheet for viewing task details
- ConfirmDialog for delete confirmation

**User Actions:**
| Action | Result |
|--------|--------|
| View task list | Sees all tasks with staggered entrance animation |
| Tap search icon | Opens search modal; typing filters tasks by title |
| Tap filter icon | Opens filter dropdown; selecting filters task list |
| Tap "?" icon | Opens help modal with usage instructions |
| Tap a task card | Opens TaskDetailSheet with full task info |
| Tap checkbox on card | Toggles task completion status with spring animation |
| Tap context menu (⋮) | Shows View/Edit/Delete options |
| Tap Edit | Opens TaskFormSheet pre-filled with task data |
| Tap Delete | Shows ConfirmDialog with slide animation |
| Long-press or tap FAB (+) | Opens task creation form |

---

### Task Detail Screen (Standalone)

| Aspect | Detail |
|--------|--------|
| **Route** | `/(tabs)/tasks/[id]` |
| **File** | `app/(tabs)/tasks/[id].js` |
| **Purpose** | View full task details in a dedicated screen |

**Main Components:**
- Category badge with color coding
- Status badge (Pending, In Progress, Completed)
- Title and description text
- Deadline display with overdue indicator
- Created/updated timeline
- Action buttons: Mark Complete/Reopen, Edit, Delete
- ConfirmDialog for delete confirmation
- BottomSheet + TaskFormSheet for editing

**User Actions:**
| Action | Result |
|--------|--------|
| View task details | Sees staggered content entrance animation |
| Tap "Mark Complete" | Toggles task status, updates UI |
| Tap "Edit" | Opens TaskFormSheet in bottom sheet |
| Tap "Delete" | Shows ConfirmDialog |
| Confirm delete | Deletes task, returns to task list |
| Hardware back | Returns to task list, restores tab bar |

---

### Settings Screen

| Aspect | Detail |
|--------|--------|
| **Route** | `/(tabs)/settings` |
| **File** | `app/(tabs)/settings.js` |
| **Purpose** | Manage account settings and preferences |

**Main Components:**
- Header with title "Settings"
- Profile section: avatar icon, display name, email
- "Appearance" section: Light/Dark theme radio buttons
- "Account" section: Edit Profile (placeholder)
- "Support" section: Help Center, About
- "Sign Out" button
- TabBubbleOverlay (decorative animated circles)

**User Actions:**
| Action | Result |
|--------|--------|
| View settings | Sees staggered sections with entrance animation |
| Tap Light/Dark | Toggles theme across entire app |
| Tap "Edit Profile" | Placeholder — no action yet |
| Tap "Help Center" | Placeholder — no action yet |
| Tap "About" | Shows app version information |
| Tap "Sign Out" | Shows confirmation alert, signs out on confirm |
| After sign out | Navigates to login screen |

---

## Shared Components

### TaskCard
| Aspect | Detail |
|--------|--------|
| **Used in** | Tasks screen, Dashboard recent tasks |
| **File** | `src/components/TaskCard.js` |
| **Purpose** | Display a single task in a list |

**Components Visible:**
- Left color accent bar (category color)
- Checkbox (animated on completion)
- Category label
- Deadline text (red if overdue)
- Title (bold, up to 2 lines)
- Description preview (1 line)
- Status badge
- Three-dot context menu button

---

### TaskDetailSheet
| Aspect | Detail |
|--------|--------|
| **Used in** | Tasks screen |
| **File** | `src/components/TaskDetailSheet.js` |
| **Purpose** | Show full task details in a bottom sheet |

**Components Visible:**
- Category badge (colored)
- Status badge
- Title
- Description (full)
- Deadline with "Overdue" warning if past
- Created/updated timestamps
- Action buttons row

---

### TaskFormSheet
| Aspect | Detail |
|--------|--------|
| **Used in** | Tasks screen, Dashboard, Task Detail screen |
| **File** | `src/components/TaskFormSheet.js` |
| **Purpose** | Create or edit a task |

**Components Visible:**
- Title input (required, bouncy animation)
- Description input (optional, multiline)
- Category chips row (Work, Personal, Study, Health, Other)
- Status chips row (visible only when editing)
- Deadline date picker (optional)
- Reminder section: toggle + date/time pickers + alarm sound dropdown
- Save button

---

### ConfirmDialog
| Aspect | Detail |
|--------|--------|
| **Used in** | Tasks screen, Task Detail screen, TaskDetailSheet |
| **File** | `src/components/ConfirmDialog.js` |
| **Purpose** | Confirm destructive actions |

**Components Visible:**
- Alert icon in colored circle background
- Confirmation title
- Message text
- Cancel button
- Confirm button (colored based on action type)

---

### BottomSheet
| Aspect | Detail |
|--------|--------|
| **Used in** | Dashboard, Tasks screen, Task Detail screen |
| **File** | `src/components/BottomSheet.js` |
| **Purpose** | Draggable modal container for forms and details |

**Components Visible:**
- Dark overlay (tappable to dismiss)
- Drag handle at top
- Content area (renders children)
- Pan gesture support for drag-to-dismiss
