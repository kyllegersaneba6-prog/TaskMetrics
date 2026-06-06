# Changelog

All notable changes to the TaskMetrics project will be documented in this file.

---

## Version 1.0.0

**Release Date:** June 2026

### Added
- Initial application release
- Cross-platform support (iOS, Android, Web) via Expo SDK 54
- Task CRUD operations (Create, Read, Update, Delete)
- Task categories: Work, Personal, Study, Health, Other
- Task status tracking: Pending, In Progress, Completed
- Deadline management with overdue indicators
- Dashboard with statistics cards (Total, Completed, Pending, Overdue)
- Weekly productivity tracking with completion rate
- Recent tasks list with highlight navigation
- Search tasks by title
- Filter tasks by status
- Local notification reminders with date/time picker
- Alarm sound selection (Default / Alarm channels)
- "Stop" action button on notifications
- In-app notification system for task completion/deletion
- Dark/Light theme toggle
- Firebase Authentication integration (with demo fallback)
- Firebase Firestore real-time sync (with in-memory fallback)
- Animated UI: staggered entrance, spring interactions, modal transitions
- Responsive layout: phone and tablet support
- Loading spinner, empty state, and error handling
- Pull-to-refresh (no-op implementation)
- Help modal with usage instructions
- Settings screen with profile display and sign out

### Technical
- React Native 0.81.5 with Expo SDK 54
- Expo Router 6 file-based navigation
- Firebase SDK 12.14.0
- Expo Notifications for local notification scheduling
- Inter font family via @expo-google-fonts/inter
- Custom animation hooks (useFadeIn, useSlideIn, useScaleIn, useAnimatedPress, useAnimatedCheckbox)
- Global event system (highlightRef, sheetRef, taskOpenRef)
- React Context for state management (Auth, Tasks, Theme)

### Documentation
- Comprehensive documentation created in `docs/` folder
- System overview, features, user roles, pages, workflows
- Database structure, installation guide, folder structure
- API/backend documentation, validation rules
- Error troubleshooting guide, future improvements
