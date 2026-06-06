# Folder Structure

This document explains the project directory structure and the purpose of important files and folders.

---

## Top-Level Structure

```
TaskMetrics-master/
├── app/                    # Expo Router screens and layouts
├── assets/                 # Static assets (images, icons)
├── docs/                   # Documentation
├── scripts/                # Build/utility scripts
├── src/                    # Application source code
│   ├── animations/         # Reusable animation hooks
│   ├── components/         # Reusable UI components
│   ├── context/            # React context providers
│   ├── firebase/           # Firebase configuration
│   ├── services/           # External services (notifications)
│   └── utils/              # Utility functions and constants
├── app.json                # Expo configuration
├── AGENTS.md               # AI agent instructions
├── CLAUDE.md               # AI assistant instructions
├── package.json            # Dependencies and scripts
├── package-lock.json       # Dependency lock file
└── LICENSE                 # License file
```

---

## Detailed Breakdown

### `app/` — Application Screens

```
app/
├── _layout.js              # Root layout: providers, fonts, notifications
├── index.js                # Entry point: auth check + redirect
├── (auth)/                 # Authentication screens (group)
│   ├── _layout.js          # Auth stack navigator
│   ├── login.js            # Login screen
│   └── register.js         # Registration screen
└── (tabs)/                 # Tab-based screens (group)
    ├── _layout.js          # Tab bar navigator (Dashboard, Tasks, Settings)
    ├── dashboard.js        # Dashboard screen with analytics
    ├── settings.js         # Settings screen
    └── tasks/              # Task screens (stack)
        ├── _layout.js      # Tasks stack navigator
        ├── index.js        # Task list screen
        └── [id].js         # Task detail screen (dynamic route)
```

**Explanation:**

| File/Dir | Purpose |
|----------|---------|
| `_layout.js` | Defines navigation structure for a route group. Wraps child screens. |
| `index.js` | Entry/redirect screen for the route group. |
| `(auth)/` | Route group for authentication screens (group name doesn't affect URL). |
| `(tabs)/` | Route group for main app screens with a tab bar. |
| `[id].js` | Dynamic route — matches `/tasks/any-task-id`. |

---

### `src/` — Application Source Code

```
src/
├── animations/
│   └── entrance.js         # useFadeIn, useSlideIn, useScaleIn, useAnimatedPress, useAnimatedCheckbox
├── components/
│   ├── AnimatedBackground.js   # Animated gradient background for auth screens
│   ├── AnimatedSection.js      # Staggered entrance wrapper (fade + slide)
│   ├── AuthBubbleOverlay.js    # Floating bubbles for auth screens
│   ├── BottomSheet.js          # Draggable bottom sheet with PanResponder
│   ├── BouncyInput.js          # TextInput wrapper with focus animation
│   ├── ConfirmDialog.js        # Modal confirmation dialog with slide animations
│   ├── DropdownPicker.js       # Bottom-sheet style dropdown selector
│   ├── EmptyState.js           # Empty list placeholder
│   ├── FilterChips.js          # Status filter chip row
│   ├── LoadingSpinner.js       # Full-screen loading indicator
│   ├── PressableBounce.js      # Pressable wrapper with spring scale
│   ├── SearchBar.js            # Text input with search icon
│   ├── StatusBadge.js          # Colored pill badge for task status
│   ├── TabBubbleOverlay.js     # Floating bubbles for tab screens
│   ├── TaskCard.js             # Individual task list item
│   ├── TaskDetailSheet.js      # Task detail view in bottom sheet
│   └── TaskFormSheet.js        # Add/edit task form
├── context/
│   ├── AuthContext.js          # Authentication state and methods
│   ├── TasksContext.js         # Task CRUD operations and state
│   └── ThemeContext.js         # Light/dark theme state
├── firebase/
│   └── config.js               # Firebase initialization and export
├── services/
│   └── notifications.js        # Local notification scheduling
└── utils/
    ├── constants.js             # Colors, fonts, scaling functions
    ├── dateHelpers.js           # Date formatting and comparison
    ├── highlightRef.js          # Cross-screen highlight state
    ├── sheetRef.js              # Bottom sheet open state
    └── taskOpenRef.js           # Cross-screen task open events
```

**Explanation of key folders:**

| Folder | Purpose |
|--------|---------|
| `animations/` | Reusable custom hooks for common animation patterns. Each hook returns `Animated.Value` objects that can be spread onto `Animated.View` style props. |
| `components/` | Reusable UI components. Each component is self-contained with its own styles. Components use `useTheme()` for dynamic colors and `moderateScale` / `fontScale` for responsive sizing. |
| `context/` | React Context providers that wrap the app. AuthContext manages user state, TasksContext manages task data, ThemeContext manages appearance. |
| `firebase/` | Firebase SDK initialization. Exports `auth`, `db`, and `firebaseAvailable` flag. |
| `services/` | External service integrations. Currently only `notifications.js` for local notification scheduling with expo-notifications. |
| `utils/` | Shared utility functions and constants. These are pure functions (no React dependencies) except `useIsTablet`. |

---

### `assets/` — Static Resources

```
assets/
├── android-icon-background.png   # Android adaptive icon background
├── android-icon-foreground.png   # Android adaptive icon foreground
├── android-icon-monochrome.png   # Android adaptive icon monochrome
├── favicon.png                   # Web favicon
├── icon.png                      # App icon (iOS + fallback)
├── splash-icon.png               # Expo default splash icon
└── taskmetrics-icon.png          # Custom splash screen image
```

---

### `docs/` — Documentation

```
docs/
├── README.md                   # Overview and table of contents
├── system-overview.md          # Purpose, problem, benefits
├── features.md                 # Feature breakdown
├── user-roles.md               # User roles and permissions
├── pages-and-screens.md        # Screen documentation
├── system-flow.md              # Workflow documentation
├── database-structure.md       # Data model
├── installation-setup.md       # Setup instructions
├── folder-structure.md         # This file
├── api-or-backend.md           # Firebase integration
├── validation-and-rules.md     # Validation rules
├── errors-and-troubleshooting.md # Common issues
├── future-improvements.md      # Planned enhancements
└── changelog.md                # Version history
```

---

## Key Configuration Files

| File | Purpose |
|------|---------|
| `app.json` | Expo configuration: app name, version, icons, splash screen, plugins, permissions |
| `package.json` | npm dependencies, scripts (start, android, ios, web) |
| `AGENTS.md` | Instructions for AI coding assistants working on this project |
| `CLAUDE.md` | Additional instructions for AI coding assistants |

---

## Import Aliases

The project does not currently use import aliases. All imports use relative paths:

```javascript
// Example imports by depth:
import { COLORS } from "../../../src/utils/constants";  // 3 levels deep
import { useTasks } from "../../../src/context/TasksContext";
import TaskCard from "../../../src/components/TaskCard";
```

> **TODO:** Configure `tsconfig.json` or `babel.config.js` with path aliases (e.g., `@/` → `src/`) for cleaner imports.
