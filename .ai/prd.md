# Product Requirements Document (PRD) - Home Crew

## 1. Product Overview

Home Crew is a responsive web application (EN) helping families fairly plan and track daily household chores/tasks.
The system enables creating a household (up to 10 people), selecting from a list of 50 predefined tasks or adding custom ones,
assigning tasks to members, moving them from "To Do" to "Done" status, and browsing task history in the daily view.
All operations are logged in the database.

## 2. User Problem

Household members don't have a clear way to track who performed which household chore/task and when.
This leads to disputes about fair work distribution and difficulties in remembering task sequences and planning future tasks/schedules.

## 3. Functional Requirements

FR-01 User registration with role selection "Family Admin" or "Family Member".
FR-02 Authentication: email, password + password reset via email. Login (name/nickname) is a separate field in the profile.
FR-03 Admin creates a household (name) and receives a 6-digit PIN; member joins by providing the PIN.
FR-04 Daily calendar view with two columns: To Do / Done; ability to switch days (past/future) and a button to add chores to a specific day ("Add" button).
FR-05 List of 50 built-in tasks + ability to add/edit/delete custom tasks (title, time of day (morning, afternoon, evening, night), emoji from icon pool). Added task expands the pool of built-in (predefined) tasks.
FR-06 Drag-and-drop or click to change task status (To Do → Done, and vice versa).
FR-07 Ability to assign a family member (yourself or someone else) to a task (both in To Do and Done status)
FR-08 50 daily tasks limit per household; after exceeding, the "Add" button is hidden.
FR-09 RWD support - desktop, tablet, phone.
FR-10 Edit and delete tasks only by the family member who added them.
FR-11 Audit log (creation, assignment, status, edits) saved in database, no UI view in MVP.
FR-12 Language: EN with browser detection.
FR-13 Chore data stored in a way that ensures scalability and security.
FR-14 Users' personal data and their household chores stored in compliance with GDPR
FR-15 Right to access and delete data (account along with chores) upon user request.
FR-16 Only logged-in user can see daily view, task list, chores, etc.
FR-17 Points system: each task has an assigned number of points (0-100); after marking "Done", points are added to the user's account. Points are always calculated fresh from current completed tasks (excluding deleted tasks) and can be used for rewards (e.g., 1h of computer games). In MVP only point accumulation, no rewards/stats screen.

## 4. Product Boundaries

• No push/SMS notifications, mobile app, task sorting or filtering in MVP.
• One household per admin account; no multi-household support.
• No data export and statistics panel in MVP.
• Realtime refresh optional (considered only for status changes).
• Rewards UI and point redemption outside MVP (points are saved in database).

## 5. User Stories

### US-001: Admin Registration

**As a new user I want to create a household, give it a name and receive a PIN, so I can invite my family.**

**Acceptance Criteria:**

1. Registration form with "Admin" role available in the shared authentication view
2. After submission: account created, PIN and name saved, confirmation email sent
3. User gets logged in and sees empty task list for the current day
4. Authentication view contains toggle between registration and login
5. User can log out via the sidebar menu button.

---

### US-002: Member Registration

**As a family member I want to join, providing PIN during registration, so I can see shared chores.**

**Acceptance Criteria:**

1. Form with PIN field available in the shared authentication view
2. PIN verified; account assigned to household
3. After registration user sees today's task view

---

### US-003: Password Reset

**As a user I want to reset my password when I forget it.**

**Acceptance Criteria:**

1. "Forgot password" link
2. Reset email sent
3. After setting new password I can log in

---

### US-004: Daily Overview

**As a user I want to see today's chores divided into To Do and Done.**

**Acceptance Criteria:**

1. Two columns visible
2. Tasks assigned to appropriate status
3. View responsive on mobile
4. In each task I see: title, category the task belongs to, optionally: time, emoji, assigned person

---

### US-005: Day Navigation

**As a user I want to switch to yesterday's and tomorrow's days, to plan or check completion.**

**Acceptance Criteria:**

1. Arrows / date-picker allow changing the day
2. Data loaded for selected date

---

### US-006: Add Task

**As a user I want to add a new task to the list of predefined tasks (~50 tasks) visible to all members of a given family. The task has appropriate fields.**

**Acceptance Criteria:**

1. Add form opens
2. Validation: title (50 characters - required), category (required), emoji limit (1 - optional), points number, time of day (optional);
3. After saving, task appears in the predefined tasks list. From there it can be selected and added - then it appears in the To Do column.

---

### US-007: Select Task/Household Chore from Task List

**As a user I want to select a task from the predefined list (containing ~50 predefined tasks plus those added by family members as custom ones.)**

**Acceptance Criteria:**

1. Predefined list displays ~50 items plus any custom tasks added by members of the given household.
2. Selecting an item adds it to today's list

---

### US-008: Self-Assignment

**As a user I want to assign myself to a To Do task, so it's clear who will do it.**

**Acceptance Criteria:**

1. "Assign" click (shows list of available family members, I can choose someone or myself)
2. Icon/text indicates assigned user

---

### US-009: Mark Done

**As a user I want to move a task to the Done column when I complete it.**

**Acceptance Criteria:**

1. Drag-and-drop or "Done" button
2. Task status changed; update visible to everyone

---

### US-010: Edit Task

**As a user I want to edit task title/time/emoji, even from past days.**

**Acceptance Criteria:**

1. No task editing capability in MVP scope
2. The only available option is to delete the given task from the daily view and possibly add a new one

---

### US-011: Delete Task

**As a user I want to delete a task that is outdated.**

**Acceptance Criteria:**

1. "Delete" action with confirmation
2. Task disappears from the day's view

### US-012: Earning Points

**As a** family member **I want** to receive points for each completed task, **so** I have motivation and can redeem them for rewards later.

**Acceptance Criteria:**

1. After marking task "Done", the number of points assigned to the task is added to my account.
2. Points are stored in the user profile.
3. In MVP no rewards view; points can be seen in profile (or just in database).

### US-013: Login to Application

**As a user with an account I want to log into the system, to access my household chores.**

**Acceptance Criteria:**

1. Login form with email and password fields available in the shared authentication view
2. Input validation (email and password required)
3. After successful login user is redirected to the daily task view
4. Login error handling with appropriate messages
5. "Forgot password?" button leading to password reset
6. User cannot use the service without logging in
7. Logged-in user entering the main page `/` gets automatically redirected to the daily task view

## 6. Success Metrics

• MS-01 Average of 2 or more chores added daily per active household member

```

```
