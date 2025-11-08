# Daily View Implementation Plan

## 1. Overview

Daily View is the main view of the Home Crew application center, enabling management of daily household chores. The view displays tasks divided into two columns: To Do and Done, allows navigation between days, adding new tasks from the catalog, assigning members, and changing task status through drag-and-drop or buttons. The goal is to provide a clear overview of duties considering user points and administrative functionalities.

## 2. View Routing

View available at `/daily_chores` path (after login). Requires user authorization - unauthenticated users are redirected to the login page.

## 3. Component Structure

```
DailyView (main container)
├── DailyViewHeader
│   ├── PointsBadge
│   ├── DateNavigator
│   └── AddChoreButton
├── ChoreColumns (flex layout for responsiveness)
│   ├── ChoreColumn (To Do)
│   │   └── ChoreCard[] (task list)
│   └── ChoreColumn (Done)
│       └── ChoreCard[] (task list)
├── AddChoreModal
│   ├── ChoreCatalogSelector
│   ├── ChoreForm (for custom tasks)
│   └── ChoreConfigurator (date, time, assignee)
└── AssignChoreModal
    └── MemberSelector
```

## 4. Component Details

### DailyView

- **Component Description**: Main container of the daily view, manages global state and coordinates all subcomponents. Handles data loading, modal management, and React Query integration.
- **Main Elements**: Container div with header, main content area for task columns, overlay for modals.
- **Handled Events**: onDateChange (date change), onChoreAdd (task addition), onChoreUpdate (status/assignment change), onChoreDelete (deletion).
- **Validation Conditions**: User must be a household member; 50 daily tasks limit per household (add button blocked after exceeding); assignee must belong to the same household.
- **Types**: DailyChoreDTO[], ChoreViewModel[], HouseholdDTO, MemberDTO[].
- **Props**: None (main view component).

### DailyViewHeader

- **Component Description**: Header with points badge, date navigator, and add button. Responsive layout adapting to mobile devices.
- **Main Elements**: Flex container with PointsBadge, DateNavigator, and AddChoreButton.
- **Handled Events**: onDateChange (passed to parent), onAddChoreClick (modal opening).
- **Validation Conditions**: Add button hidden when 50 daily tasks limit is reached.
- **Types**: HouseholdDTO (for context), number (user points).
- **Props**: currentDate: ISODate, totalPoints: number, choresCount: number, onDateChange: (date: ISODate) => void, onAddChoreClick: () => void.

### ChoreColumns

- **Component Description**: Container for two To Do and Done columns with drag-and-drop support between them.
- **Main Elements**: Flex container with two ChoreColumn components, DropZone for drag-and-drop.
- **Handled Events**: onChoreDrop (task movement between columns), onChoreClick (task click).
- **Validation Conditions**: Drag-and-drop only for tasks assigned to current user or by admin.
- **Types**: ChoreViewModel[], MemberDTO[].
- **Props**: chores: ChoreViewModel[], members: MemberDTO[], currentUserId: UUID, onChoreUpdate: (id: UUID, updates: UpdateDailyChoreCmd) => void, onChoreClick: (chore: ChoreViewModel) => void.

### ChoreColumn

- **Component Description**: Single task column (To Do or Done) with task dropping capability.
- **Main Elements**: Column container with title, ChoreCard component list, DropZone.
- **Handled Events**: onDrop (dropped task acceptance), onChoreClick (passed to parent).
- **Validation Conditions**: Accepts only tasks with appropriate target status.
- **Types**: ChoreViewModel[], 'todo' | 'done'.
- **Props**: title: string, status: 'todo' | 'done', chores: ChoreViewModel[], onDrop: (choreId: UUID) => void, onChoreClick: (chore: ChoreViewModel) => void.

### ChoreCard

- **Component Description**: Single task card with information and action controls.
- **Main Elements**: Card container with title, emoji, time, assignee avatar/name, action buttons (assign, delete).
- **Handled Events**: onDragStart (drag start), onAssignClick (assignment modal opening), onDeleteClick (task deletion).
- **Validation Conditions**: Assign button visible only for assignee or admin; delete button only for task creator or admin.
- **Types**: ChoreViewModel, MemberDTO[].
- **Props**: chore: ChoreViewModel, assignee: MemberDTO | null, onAssign: () => void, onDelete: () => void.

### DateNavigator

- **Component Description**: Component for navigation between days with date picker and arrow buttons.
- **Main Elements**: Flex container with prev/next buttons and date picker input.
- **Handled Events**: onDateChange (selected date change).
- **Validation Conditions**: No specific validations, but prefetch of neighboring days for optimization.
- **Types**: ISODate.
- **Props**: currentDate: ISODate, onDateChange: (date: ISODate) => void.

### AddChoreModal

- **Component Description**: Modal for adding new task with catalog selection or custom creation.
- **Main Elements**: Dialog with ChoreCatalogSelector, optional ChoreForm for custom tasks, ChoreConfigurator.
- **Handled Events**: onChoreSelect (catalog selection), onCustomChoreCreate (custom creation), onSubmit (task save).
- **Validation Conditions**: Title ≤50 characters, points 0-100, assignee must be in household; 50 daily tasks limit.
- **Types**: CatalogItemDTO[], CreateDailyChoreCmd, MemberDTO[].
- **Props**: isOpen: boolean, onClose: () => void, onSubmit: (cmd: CreateDailyChoreCmd) => void, catalogItems: CatalogItemDTO[], members: MemberDTO[].

### AssignChoreModal

- **Component Description**: Modal for assigning member to task.
- **Main Elements**: Dialog with household member list for selection.
- **Handled Events**: onMemberSelect (member selection), onSubmit (assignment save).
- **Validation Conditions**: Selected member must belong to household; only assignee or admin can change assignment.
- **Types**: ChoreViewModel, MemberDTO[].
- **Props**: isOpen: boolean, chore: ChoreViewModel, members: MemberDTO[], onClose: () => void, onSubmit: (assigneeId: UUID | null) => void.

## 5. Types

### Existing types from types.ts:

- `DailyChoreDTO`: id, date, time_of_day, status, assignee_id, points, chore_catalog_id
- `CreateDailyChoreCmd`: date, chore_catalog_id, assignee_id?, time_of_day?
- `UpdateDailyChoreCmd`: status?, assignee_id?
- `CatalogItemDTO`: id, title, emoji, time_of_day, category, points, predefined, created_by_user_id, created_at, deleted_at
- `MemberDTO`: id, user_id, name, avatar_url, role, joined_at
- `HouseholdDTO`: id, name, timezone, pin?

### New ViewModel Types:

```typescript
interface ChoreViewModel extends DailyChoreDTO {
  catalogTitle: string; // Title from catalog
  catalogEmoji?: string; // Emoji from catalog
  catalogCategory: string; // Category from catalog
  catalogTimeOfDay: TimeOfDayType; // Time of day from catalog
  assigneeName?: string; // Assigned member name
  assigneeAvatar?: string; // Assigned member avatar
  canEdit: boolean; // Can user edit (assignee or admin)
  canDelete: boolean; // Can user delete (creator or admin)
}

interface DailyViewState {
  currentDate: ISODate;
  chores: ChoreViewModel[];
  members: MemberDTO[];
  household: HouseholdDTO;
  currentUserId: UUID;
  isAddModalOpen: boolean;
  isAssignModalOpen: boolean;
  selectedChore: ChoreViewModel | null;
  isLoading: boolean;
  error: string | null;
}
```

## 6. State Management

State managed through combination of React Context (global application state) and local hooks. Main view state stored in DailyView component using useState for modals and temporary states. React Query used for API data with invalidation after mutations.

Custom hook `useDailyView` encapsulates logic:

- Data fetching (chores, members, household)
- Mutation handling (create, update, delete chores)
- Optimistic updates with error rollback
- Cache invalidation on date changes

Local state for:

- Open modals (isAddModalOpen, isAssignModalOpen)
- Selected task (selectedChore)
- Loading and error states

## 7. API Integration

Integration through React Query with custom hooks in `src/hooks/useChores.ts` and `src/hooks/useHousehold.ts`.

**GET /v1/daily-chores**:

- Request: query params `date`, optionally `status`, `assignee_id`
- Response: `DailyChoreDTO[]`
- Usage: Fetching tasks for selected date on day change or refresh

**POST /v1/daily-chores**:

- Request body: `CreateDailyChoreCmd`
- Response: `DailyChoreDTO`
- Usage: Adding new task from modal, optimistic update

**PATCH /v1/daily-chores/:id**:

- Request body: `UpdateDailyChoreCmd` (status or assignee_id)
- Response: `DailyChoreDTO`
- Usage: Status change through drag-and-drop or member assignment

**DELETE /v1/daily-chores/:id**:

- Response: 204 No Content
- Usage: Task deletion, confirmation through dialog

All calls use service client with RLS bypass for authorization.

## 8. User Interactions

- **Task Addition**: Click "Add" → AddChoreModal opening → catalog selection or custom creation → date/time/assignee configuration → save → modal close and list refresh
- **Status Change**: Task card drag-and-drop between To Do/Done columns → immediate UI update → background API call → points recorded in points_events and profile updated with fresh calculation
- **Member Assignment**: Task card click → AssignChoreModal opening → member selection from list → save → modal close
- **Day Navigation**: Date picker or arrow buttons usage → date change → new data prefetch → smooth transition animation
- **Task Deletion**: Delete button click on card → dialog confirmation → deletion → list update

## 9. Conditions and Validation

- **Daily Task Limit**: Checked before AddChoreModal opening; add button hidden/disabled when ≥50 tasks
- **Member Assignment**: Validation if selected member belongs to household; 400 error if not
- **Edit Permissions**: assignee or admin can change status/assignment; 403 error if not
- **Delete Permissions**: task creator or admin; 403 error if not
- **Task Uniqueness**: Duplicate prevention (household_id, date, chore_catalog_id, assignee_id, time_of_day); 409 error
- **Field Validation**: assignee_id nullable, status enum ('todo'|'done'), date in ISO format

Conditions verified at component level through disabled states and button hiding, and through API with appropriate error codes.

## 10. Error Handling

- **Network Errors**: Toast notification with retry option; fallback UI for offline states
- **Authorization Errors (403)**: Error message "No permissions to perform this action"
- **Validation Errors (400/422)**: Invalid field highlighting in forms with detailed messages
- **Conflicts (409)**: Specific messages for task limits or duplicates
- **Server Errors (500)**: Generic error message with retry option
- **Optimistic Update Errors**: Rollback to previous state with user notification

Error boundary at application level catches unexpected errors with fallback UI.

## 11. Implementation Steps

1. **File Structure Creation**: `src/pages/daily_chores.astro`, `src/components/DailyView.tsx`, subcomponents in `src/components/daily-view/`

2. **ViewModel Types Implementation**: Extension of existing DTOs with ChoreViewModel and DailyViewState in `src/types/daily-view.types.ts`

3. **Custom Hook useDailyView**: Implementation in `src/hooks/useDailyView.ts` with React Query integration for all API calls

4. **Basic DailyView Layout**: Container with header and column placeholders, hook integration

5. **DateNavigator Component**: Picker with navigation buttons, prefetch handling

6. **ChoreColumn and ChoreCard**: Drag-and-drop implementation with React DnD, responsive design

7. **AddChoreModal**: ChoreCatalog integration, form validation, custom tasks handling

8. **AssignChoreModal**: Member list with selector, permission validation

9. **Points Integration**: PointsBadge in header with update on status change

10. **Responsiveness and Accessibility**: ARIA labels addition, keyboard navigation, mobile fallbacks

11. **Testing**: Component unit tests, API integration tests, accessibility tests

12. **Optimization**: Image lazy loading, component memoization, bundle splitting
