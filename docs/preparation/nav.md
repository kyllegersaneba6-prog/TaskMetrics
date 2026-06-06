# Navigation

This page explains how navigation is structured in TaskMetrics.

---

## Navigation Framework

TaskMetrics uses **Expo Router 6** with file-based routing. The folder structure inside `app/` defines the routes:

```
app/
  index.js         →   /              (root redirect)
  _layout.js       →   Root Layout
  (auth)/
    _layout.js     →   Auth Layout
    login.js       →   /login
    register.js    →   /register
  (tabs)/
    _layout.js     →   Tabs Layout
    dashboard.js   →   /dashboard
    tasks/
      index.js     →   /tasks
      [id].js      →   /tasks/:id   (not currently used)
    settings.js    →   /settings
```

---

## Screen Types

### Root Layout (`app/_layout.js`)
- Wraps the app with providers: `SafeAreaProvider`, `AuthProvider`, `TasksProvider`, `ThemeProvider`
- Contains a `Stack` navigator with three groups: index, (auth), (tabs)
- All screens have `headerShown: false`
- Handles font loading, splash screen, and notification permissions

### Auth Screens (unauthenticated)
- **Login** (`/(auth)/login`) — email and password form with Sign In button
- **Register** (`/(auth)/register`) — name, email, password, confirm password form
- Both are inside a Stack navigator with no header

### Tabs (authenticated)
- Bottom tab navigator with 3 tabs:

| Tab | Route | Icon | Description |
|-----|-------|------|-------------|
| Dashboard | `/(tabs)/dashboard` | `apps-outline` | Stats cards, weekly chart, recent tasks |
| Tasks | `/(tabs)/tasks` | `checkbox-outline` | Task list, search, filter, FAB |
| Settings | `/(tabs)/settings` | `cog-outline` | Profile display, theme toggle, sign out |

---

## How Users Move Between Screens

### Navigation methods used:

| Method | Usage |
|--------|-------|
| `router.push(path)` | Navigate to a route (adds to history stack) |
| `router.replace(path)` | Navigate and replace current history entry (used after login) |
| `router.back()` | Go to previous screen |

### Flow diagram:

```
App Start
  │
  ├─ User not logged in ──→ /(auth)/login
  │                            │
  │                            ├─ "Create Account" link → /(auth)/register
  │                            │
  │                            └─ Login success ──→ /(tabs)/dashboard
  │
  └─ User logged in ──→ /(tabs)/dashboard
                           │
                           ├─ Bottom tab: Tasks ──→ /(tabs)/tasks
                           ├─ Bottom tab: Settings ──→ /(tabs)/settings
                           └─ Bottom tab: Dashboard ──→ /(tabs)/dashboard
```

---

## Bottom Tab Navigation

The tab bar (`app/(tabs)/_layout.js`) contains:

- Three tabs: Dashboard, Tasks, Settings
- Active tab has bold text and filled icon color
- Tab bar hides when the task bottom sheet is open (controlled via `sheetRef`)
- Styling: background matches theme, no shadow, safe area aware
- Icons use `@expo/vector-icons/Ionicons`

---

## Protected Screens

- All screens inside `(tabs)/` require authentication
- The root `index.js` checks `user` from AuthContext:
  - If `user` is null → redirect to `/(auth)/login`
  - If `user` exists → redirect to `/(tabs)/dashboard`
- The auth screens (login, register) are NOT accessible once logged in
- There is no middleware or route guard — the redirect in `index.js` handles protection

---

## Modals and Sheets (not full screen navigation)

These are rendered as overlays over the current screen, not as separate routes:

- **TaskFormSheet** — bottom sheet for add/edit task
- **TaskDetailSheet** — bottom sheet for task details
- **ConfirmDialog** — centered modal for delete confirmation
- **Help modal** — centered overlay with usage instructions
