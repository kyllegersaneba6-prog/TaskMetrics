# Basic Issues — All Resolved

- ~~**#3. Hex color alpha concatenation fragile**~~ Fixed: added `withAlpha(hex, alphaHex)` helper in `constants.js` and replaced all raw concatenations
- ~~**#5. Inline styles in 4 components**~~ Fixed: converted `SearchBar`, `LoadingSpinner`, `EmptyState`, `ConfirmDialog` to use `StyleSheet.create`
