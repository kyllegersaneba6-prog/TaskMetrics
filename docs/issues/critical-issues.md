# Critical Issues — All Resolved

- ~~**#1. Overdue count includes tasks with no deadline**~~ Fixed: added `t.deadline &&` guard in `dashboard.js:276`
- ~~**#2. `formatDate` crashes on invalid dates**~~ Fixed: added `isNaN(d.getTime())` check in `dateHelpers.js:5`
