# System Overview

## Purpose

TaskMetrics is a mobile task management application designed to help users organize their daily responsibilities, track progress, and stay on top of deadlines. It combines a clean, modern user interface with powerful features like real-time task filtering, analytics dashboards, and scheduled notification reminders.

The application is built using React Native with Expo, making it cross-platform compatible (iOS, Android, and web). It uses Firebase for optional cloud-based authentication and data persistence, with a fully functional local/demo mode when Firebase is not configured.

## Problem It Solves

Many task management apps are either too complex (full project management suites) or too limited (simple lists). TaskMetrics strikes a balance by providing:

1. **Organization** — Tasks can be categorized, filtered, and searched, reducing mental clutter
2. **Accountability** — Deadline tracking with overdue indicators and completion statistics provide visibility into productivity
3. **Timely Reminders** — Scheduled local notifications ensure users never miss important deadlines
4. **Simplicity** — An intuitive interface with minimal learning curve, accessible to non-technical users
5. **Cross-Device Access** — Available on both iOS and Android from a single codebase

## Target Users

| User Type | Use Case |
|-----------|----------|
| **Students** | Track assignments, exam deadlines, and study sessions |
| **Professionals** | Manage work tasks, project milestones, and meeting prep |
| **Freelancers** | Organize client work, deadlines, and deliverables |
| **Individuals** | Personal errands, goals, habits, and daily to-dos |
| **Small Teams** | Shared task tracking with consistent status reporting (future feature) |

## Benefits

| Benefit | Detail |
|---------|--------|
| **Cross-Platform** | Runs on Android, iOS, and web from a single codebase |
| **Offline First** | Works without an internet connection using local state; syncs when Firebase is available |
| **Real-Time Sync** | When Firebase is configured, tasks sync across devices in real time |
| **No Account Required** | Demo mode allows immediate use without registration |
| **Accessible UI** | Responsive scaling and font size adjustments support different devices and accessibility needs |
| **Customizable** | Dark/light theme, multiple categories, and customizable alarm sounds |
| **Lightweight** | Minimal dependencies, fast load times, optimized animations |

## Technical Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React Native 0.81, Expo SDK 54 |
| **Navigation** | Expo Router 6 (file-based routing) |
| **Backend** | Firebase Firestore (optional, with local fallback) |
| **Auth** | Firebase Authentication (optional, with demo fallback) |
| **Notifications** | Expo Notifications (local scheduling) |
| **Fonts** | Inter (via @expo-google-fonts/inter) |
| **Icons** | @expo/vector-icons (Ionicons) |
| **Date Picker** | @react-native-community/datetimepicker |
| **Animations** | React Native Animated API |
