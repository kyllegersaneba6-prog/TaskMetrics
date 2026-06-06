# User Roles

TaskMetrics currently operates with a single user role structure. Each user has full access to their own tasks and settings. Future versions may add team-based roles.

---

## User

**Description:** Any authenticated or demo user of the application.

### Access

| Feature | Access Level |
|---------|-------------|
| Task Creation | Full |
| Task Viewing | Own tasks only |
| Task Editing | Own tasks only |
| Task Deletion | Own tasks only |
| Task Search | Own tasks only |
| Task Filtering | Own tasks only |
| Dashboard Analytics | Own tasks only |
| Reminder Notifications | Per-task opt-in |
| Theme Settings | Personal preference |
| Profile View | Own profile |
| Profile Edit | Placeholder (future) |
| Sign Out | Yes |

### Permissions

- Can create unlimited tasks
- Can set deadlines, reminders, and categories on own tasks
- Can mark tasks as complete/incomplete
- Can schedule and cancel reminder notifications
- Can choose alarm sounds for reminders
- Can search and filter own tasks
- Can view personal productivity statistics
- Can toggle dark/light theme
- Can sign out of the application

### Limitations

- Cannot view or modify other users' tasks (multi-user sharing not yet implemented)
- Cannot manage other users' accounts
- No administrative functions
- Cannot customize or extend application features

---

## Future Roles (Planned)

### Admin

| Feature | Access Level |
|---------|-------------|
| All User Features | Full |
| View All Users | Full |
| Manage Users | Full |
| System Settings | Full |
| Analytics Dashboard | Global |
| Audit Logs | Full |

### Team Member

| Feature | Access Level |
|---------|-------------|
| Own Tasks | Full |
| Shared Tasks | Assigned only |
| Team Dashboard | Team scope |
| Comments | Create and view |

### Team Manager

| Feature | Access Level |
|---------|-------------|
| All Team Member Features | Full |
| Task Assignment | Full |
| Team Analytics | Team scope |
| Member Management | Within team |
