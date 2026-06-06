# Future Improvements

This document lists planned and suggested improvements for the TaskMetrics application. Items are grouped by priority and feasibility.

---

## High Priority

### Task Sharing & Collaboration

Enable users to share tasks with other users. This would include:

- Shared task lists with team members
- Task assignment to specific users
- Real-time collaboration (multiple users viewing/editing the same task)
- Activity feed showing who did what

**Technical Requirements:**
- Update Firestore data model to include `assignedTo`, `sharedWith` arrays
- Add Firestore security rules for shared document access
- Real-time presence indicators
- Conflict resolution for simultaneous edits

### Push Notifications (Remote)

Replace local-only notifications with push notifications via Firebase Cloud Messaging (FCM) and Apple Push Notification Service (APNs).

**Benefits:**
- Notifications work even if the app is uninstalled and reinstalled (notificationId resets)
- Server-side notification scheduling
- Cross-device notification sync

**Technical Requirements:**
- Configure FCM credentials in Firebase Console
- Set up APNs key in Apple Developer account
- Create a notification server or use Expo Push API
- Request push notification token on app launch
- Send notifications from a server-side function

---

## Medium Priority

### Data Persistence (AsyncStorage)

Currently, when Firebase is unavailable, tasks are stored only in memory. Adding local persistence would:

- Save tasks to AsyncStorage as a JSON backup
- Restore tasks on app restart
- Sync to Firebase when connection is restored

**Technical Requirements:**
- `@react-native-async-storage/async-storage` (already installed)
- Serialize/deserialize task array to JSON
- Handle conflict resolution when syncing with Firestore
- Add loading states for async operations

### Recurring Tasks

Allow users to create tasks that repeat on a schedule:

- Daily, weekly, monthly, or custom intervals
- End date or number of occurrences
- Auto-create next occurrence on completion

**Technical Requirements:**
- Add `repeatInterval` and `repeatEnd` fields to task model
- Create next occurrence logic in `toggleComplete`
- UI for selecting repeat options in TaskFormSheet

### Categories & Tags Enhancement

Expand the current category system:

- User-defined custom categories with color pickers
- Multiple tags per task (instead of single category)
- Category/tag filtering on Dashboard
- Category-based statistics

**Technical Requirements:**
- Add `tags` array field to task model
- Create a category management screen
- Store categories in Firestore `categories` subcollection

### Subtasks / Checklist

Allow tasks to have subtasks:

- Add checklist items within a task
- Mark individual subtasks as complete
- Show subtask progress on the task card

**Technical Requirements:**
- Add `subtasks` array to task model: `[{ id, title, completed }]`
- UI for adding/checking subtasks in TaskDetailSheet
- Update completion logic to consider subtask progress

---

## Lower Priority

### Drag-and-Drop Task Reordering

Allow users to reorder tasks by dragging:

- Long-press to enter reorder mode
- Drag handle on each task card
- Save custom order to Firestore

**Technical Requirements:**
- Add `order` field to task model
- Implement drag-and-drop with `react-native-draggable-flatlist` (new dependency)
- Batch update order changes to Firestore

### Calendar View

Add a calendar view of tasks:

- Month/week/day views
- Tasks displayed on their deadline dates
- Tap a date to see all tasks due that day
- Long-press to create a task on a specific date

**Technical Requirements:**
- New screen or tab for calendar view
- Calendar library (e.g., `react-native-calendars`)
- Query tasks by date range

### Dark Mode Enhancements

Improve the existing dark mode:

- Auto-detect system theme preference
- Smooth theme transition animation
- Per-screen theme override option

**Technical Requirements:**
- Use `useColorScheme()` from React Native for system detection
- Add theme transition animation to ThemeContext
- Store theme preference in AsyncStorage

### Import/Export

Allow users to export their tasks:

- Export to CSV or JSON
- Import from CSV or JSON
- Share files via system share sheet

**Technical Requirements:**
- `expo-file-system` and `expo-sharing` for file operations
- JSON serialize/deserialize task data
- CSV parsing library or manual parser

### Accessibility Improvements

Enhance accessibility support:

- Screen reader support (accessibility labels on all interactive elements)
- Keyboard navigation (web)
- Reduced motion setting support
- High contrast mode
- Larger touch targets

**Technical Requirements:**
- Add `accessibilityLabel` props to all interactive elements
- Respect `prefers-reduced-motion` for animations
- Test with TalkBack (Android) and VoiceOver (iOS)

### Unit & Integration Tests

Add testing infrastructure:

- Unit tests for utility functions (`dateHelpers`, `constants`)
- Component tests with React Native Testing Library
- Integration tests for critical flows (login, create task, etc.)
- E2E tests with Detox or Maestro

**Technical Requirements:**
- Jest (comes with Expo)
- React Native Testing Library
- Mock Firebase and expo-notifications for testing

---

## Technical Debt

| Item | Description | Effort |
|------|-------------|--------|
| **TypeScript Migration** | Convert project from JavaScript to TypeScript for better type safety | Large |
| **Path Aliases** | Configure `@/` alias for `src/` to replace relative imports | Small |
| **Consistent Error Handling** | Standardize error handling across all async operations | Medium |
| **Code Splitting** | Lazy-load screens and components to reduce initial bundle size | Medium |
| **Performance Audit** | Profile and optimize FlatList rendering, animations, and re-renders | Medium |
| **Firebase Security Rules** | Deploy production-ready security rules | Small |
| **Environment Variables** | Add `.env` support for Firebase config | Small |
| **CI/CD Pipeline** | Set up GitHub Actions for linting, testing, and EAS Build | Medium |
