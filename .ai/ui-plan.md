# UI Architecture for Home Crew

## 1. UI Structure Overview

The UI architecture of the Home Crew application has been designed as a responsive web application based on the Astro framework with React components, focusing on managing household chores in family households. The main emphasis has been placed on:

- **Responsiveness**: Grid layout automatically adapting to desktop/tablet/mobile devices
- **Accessibility**: Full ARIA support (labels, role, live regions), keyboard navigation, screen reader compatibility
- **Security**: Role-based UI controls hiding administrative functions for regular members
- **UX**: Main daily view as navigation center, collapsible sidebar, drag-and-drop between To Do/Done columns with mobile fallback

The application uses shadcn/ui and Tailwind CSS for consistent design system, React Context for global state management, and React Query for efficient API data caching and updates.

## 2. Views List

### 2.1 Landing with Authentication

- **Path**: `/`
- **Main goal**: Welcome non-logged-in users and simultaneously enable registration/login on one page
- **Key information**: Application logo, advertising slogan at the top; registration/login toggle below, multi-step registration process with role selection (admin/member), registration/login forms, user type selection, PIN for members
- **Key components**: Welcome header (logo, tagline), auth toggle, multi-step forms, validation feedback, role selector
- **UX**: Welcome at the top, forms below; toggle between registration and login, real-time validation, clear error messages, success redirect to dashboard
- **Accessibility**: ARIA labels on all buttons, form labels, error announcements, keyboard navigation between sections and toggle
- **Security**: Secure password fields, role-based validation, protection against 409/422 errors, public access to welcome section

### 2.3 Main Daily View

- **Path**: `/daily_chores` (after login)
- **Main goal**: Application center - overview of chores for selected day with management capabilities
- **Key information**: Two columns To Do/Done, task list with assignments, user points, date picker
- **Key components**: Chore columns, date navigator, add chore button, points badge, collapsible sidebar
- **UX**: Drag-and-drop between columns with mobile fallback, optimistic updates, toast notifications
- **Accessibility**: ARIA live regions for status updates, keyboard navigation, screen reader support for tasks
- **Security**: Role-based controls (only admin sees certain functions), assignee validation

### 2.4 Household Management

- **Path**: `/household`
- **Main goal**: Admin-only view for managing household and members
- **Key information**: Member list, household PIN, household name, user roles
- **Key components**: Member list, PIN display, household settings, role management controls
- **UX**: Clear hierarchy, confirmation dialogs for destructive actions
- **Accessibility**: Table navigation, action button labels, screen reader announcements
- **Security**: Only admin has access, confirmation for member removal, PIN hidden for members

### 2.5 User Profile

- **Path**: `/profile`
- **Main goal**: Managing personal information and points overview
- **Key information**: User data, total points, activity history (outside MVP), avatar
- **Key components**: Profile form, points summary, activity log, avatar upload
- **UX**: Edit-in-place for simple fields, points history with pagination
- **Accessibility**: Form labels, data table navigation, progress indicators for points
- **Security**: Only own data, validation for all fields

### 2.6 Add Chore Modal

- **Path**: Modal in Daily View (/daily_chores)
- **Main goal**: Add new chore to selected day from catalog
- **Key information**: Task catalog (predefined + ability to add custom), date/time/assignment selection
- **Key components**: Chore catalog browser, date/time selectors, assignee picker
- **UX**: Search/filter in catalog, validation feedback, success toast
- **Accessibility**: Modal focus management, list navigation, form validation announcements
- **Security**: Validation of 50 daily tasks limit, household context

### 2.7 Assign Chore Modal

- **Path**: Modal in Daily View
- **Main goal**: Change chore assignment to household member
- **Key information**: Household member list, current assignment
- **Key components**: Member selector, current assignee display
- **UX**: Quick selection, immediate feedback
- **Accessibility**: Radio group navigation, current selection announcement
- **Security**: Only admin/member can assign, household validation

### 2.8 Points History - optional

- **Path**: `/points` or modal in Profile
- **Main goal**: Detailed overview of points history and activity
- **Key information**: Points events list, date filters, summary
- **Key components**: Points events table, date filters, summary stats
- **UX**: Paginated list, filter controls, export option (future)
- **Accessibility**: Table navigation, filter controls, data announcements
- **Security**: Only own data, date range validation

## 3. User Journey Map

### Main use case: Household chores management

1. **First launch**: User visits `/` → if not logged in: sees landing with welcome at the top and registration/login form below; if logged in: automatic redirect to Daily View (`/daily_chores`)
2. **Registration**: Role selection (admin/member) → registration form → validation → success → redirect to Daily View
3. **Admin flow**: Household creation (name) → PIN receipt → family invitation
4. **Member flow**: PIN entry → household joining → access to shared tasks
5. **Daily usage**: Daily View (daily-chores) with To Do/Done tasks → adding tasks from catalog → drag-and-drop to Done → automatic points award
6. **Management**: Admin can manage members in Household Management → members can edit profile

### Key interactions:

- **Add task**: "Add" button → catalog selection modal → configuration → save → optimistic update in Daily View. Task is automatically assigned to current user, but member list can be changed
- **Status change**: Drag-and-drop between columns → API call → points award if Done
- **Assignment**: Click on task → member selection modal (if we want different than default user) → update → live update for all
- **Day navigation**: Date picker → prefetch neighboring days → smooth transition

## 4. Navigation Layout and Structure

### Main navigation levels:

1. **Public**: Landing page with registration/login
2. **Protected**: All other views require authorization

### Navigation structure:

- **Header**: Logo, points badge, user menu (profile, household, logout)
- **Sidebar**: Collapsible menu with: Daily View, Household (admin), Profile, Points History
- **Breadcrumbs**: In management views for context
- **Modals**: Overlay for actions (add task, assign, confirmations)

### Navigation responsiveness:

- **Desktop**: Full sidebar + header
- **Tablet**: Collapsed sidebar with hamburger menu
- **Mobile**: Collapsed sidebar with hamburger menu

### Navigation guards:

- Role-based visibility (admin functions hidden for members)
- Auth guards redirecting non-logged-in users to /
- Loading states during permission checking

## 5. Key Components

### UI Components (shadcn/ui):

- **Button**: Primary/secondary/destructive variants with loading states
- **Card**: Container for tasks, members, summaries
- **Dialog/Modal**: Overlay for forms and confirmations
- **Input/Textarea**: Form controls with validation
- **Table**: Member list, points history
- **Badge**: Task status, roles, points
- **Avatar**: Member profile pictures

### Business Components:

- **ChoreCard**: Draggable card with title, assignee, time, points
- **ChoreColumn**: Drop zone for To Do/Done with limits
- **DateNavigator**: Picker with prefetching of neighboring days
- **PointsBadge**: Header badge with current points
- **MemberSelector**: Dropdown/radio for member selection
- **ChoreCatalog**: Searchable list of predefined tasks

### System Components:

- **ErrorBoundary**: Global catch for errors with fallback UI
- **ToastProvider**: Notifications for successes/errors
- **LoadingSpinner**: Consistent loading states
- **AuthGuard**: Route protection wrapper
- **RoleGuard**: Conditional rendering based on user role

All components implement ARIA attributes, keyboard navigation, and responsive design according to accessibility guidelines.
