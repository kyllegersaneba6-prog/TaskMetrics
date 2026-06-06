# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

# TaskMetrics - Premium UI Redesign (June 2026)

## Color System
- Background: `#FAFAFA`, Cards: `#FFFFFF`, Text: `#111111`, Secondary: `#666666`, Light: `#999999`, Border: `#E5E5E5`
- Success: `#22C55E`, Warning: `#F59E0B`, Danger: `#EF4444`, Primary: `#3B82F6`

## Font System
- Inter font via `@expo-google-fonts/inter`
- Font families: `FONT.regular`, `.medium`, `.semiBold`, `.bold`, `.extraBold`
- All text uses `fontFamily: FONT.xxx` with `fontScale()` for responsive + accessibility scaling
- Imported in `app/_layout.js` via `useFonts`

## Import Changes (pre existing code using old names)
- `fontSize(x)` was renamed to `fontScale(x)` in constants.js
- `withAlpha(hex, "XX")` with hex string alpha was changed to `withAlpha(hex, 0.XX)` with decimal alpha

## Component Architecture
- All components use `StyleSheet.create` (inline via `useMemo` for dynamic colors + fonts)
- No inline styles except for truly dynamic values (colors, conditional properties)
- All screens use `useSafeAreaInsets()` for safe area, not `SafeAreaView`
- Scaling via `moderateScale()` (layout) and `fontScale()` (text)

## Key Patterns
- Dark primary text (`#111`) for buttons and key UI elements
- White FAB with rounded rectangle (52x52, borderRadius 16)
- Cards have 1px border (`colors.border`), no shadows
- Subtle `withAlpha(color, 0.04-0.1)` backgrounds for stat cards and icons
- Generous 24px horizontal padding on screens, 20px on inner cards
- Section labels: uppercase, 12px, semiBold, letterSpacing 0.5-0.8

## FAB Placement
- All FABs at `right: 24, bottom: 24 + insets.bottom`
- `tasks/add` uses keyboard-avoiding ScrollView

## ConfirmDialog
- Redesigned with centered icon + title + message layout
- Uses `withAlpha(confirmColor, 0.1)` for icon background

## EmptyState
- Rounded 16px icon container with `withAlpha(textLight, 0.08)` background

## Animation System (added June 2026)

### Files
- `src/animations/entrance.js` — Shared hooks: `useFadeIn`, `useSlideIn`, `useScaleIn`, `useAnimatedPress`, `useAnimatedCheckbox`
- `src/components/AnimatedBackground.js` — Animated gradient + floating circles for auth screens

### Pattern — Staggered Entrance
- All screen content uses `AnimatedSection(children, delay)` pattern (opacity 0→1, translateY 20→0 over 350ms)
- Delays: 0ms → 500ms in 80-100ms increments
- `useNativeDriver: true` for all entrance animations

### Auth Screen Background
- `AnimatedBackground` wraps entire screen behind content
- 2 floating circles (60% of screen size) with slow 10-12s loop translation + scale
- Subtle `LinearGradient` at 10% opacity
- Content uses white text on semi-transparent inputs
- Title fades in at 200ms, form at 500ms with translateY slide

### TaskCard Animations
- `useAnimatedCheckbox()` — spring scale sequence (0.8 → 1.1 → 1.0) + checkmark fade-in on completion
- `useAnimatedPress()` — scale to 0.97 on press-in, spring back on press-out
- `useSlideIn(index * 80)` for staggered list entrance
- `useEffect` watches `task.status` to trigger checkbox animation on status change

### Other Components
- `FilterChips` — spring scale bounce (0.92 → 1.05 → 1.0) on active chip selection
- FAB — spring slide-up from translateY(40) + fade-in at 400ms delay
- `SearchBar` — fades in as part of list header at 0ms
- Settings menu items — staggered 100ms per section
