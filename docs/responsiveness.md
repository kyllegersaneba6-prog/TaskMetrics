# Responsiveness Implementation

## Utilities (`src/utils/constants.js`)

| Function | Description |
|----------|-------------|
| `scale(size)` | Linear scale based on screen width (base: 375px) |
| `moderateScale(size, factor)` | Moderate scale for padding/radius (factor 0.5 by default) |
| `fontSize(size)` | Applies both screen scale AND device font scale (`PixelRatio.getFontScale()`) |
| `isTablet()` | Static check for screen width >= 768 |
| `useIsTablet()` | Reactive hook using `useWindowDimensions` |

## Safe Area

- Root layout wrapped in `<SafeAreaProvider>` (`app/_layout.js`)
- All screens wrapped in `<SafeAreaView>` for notch/home indicator avoidance
- Tab bar uses `useSafeAreaInsets().bottom` for bottom padding
- FAB button uses `insets.bottom` to avoid home indicator

## Font Scaling

All `fontSize` values use `fontSize(size)` which multiplies by `PixelRatio.getFontScale()`. Text responds to the device's accessibility font size setting.

## Tablet Support

- `FilterChips` — chips layout adapts to 4-per-row on tablet (`width: "23%"`)
- `ConfirmDialog` — `maxWidth` adjusts (320 phone vs 400 tablet)
- `Dashboard` — shows more recent tasks (8 vs 5), modal maxWidth adapts

## Fixed Heights → `minHeight`

All input fields, buttons, and form elements use `minHeight` + vertical padding instead of fixed `height`, allowing content to grow with font scaling.
