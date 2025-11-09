# Household Management View Implementation Plan

## 1. Overview

Household Management view is an admin-only interface allowing household administrators to manage household settings and family members. The main goal is to enable admins to view and modify household information (name, PIN), manage member list, and control their roles in the system. The view provides secure access only for administrators and contains appropriate validation mechanisms and error handling.

## 2. View Routing

The view should be available at the `/household` path. Access to this path should be protected - only logged-in users with household administrator role can access the view.

## 3. Component Structure

```
HouseholdManagementView (main container)
├── HouseholdInfo (household information + inline editing)
│   ├── HouseholdName (household name with Edit button for admins)
│   ├── HouseholdNameEditor (inline name edit form)
│   └── HouseholdPin (PIN - admins only)
└── MembersList (member list)
    └── MemberCard[] (individual member cards)
        ├── MemberInfo (member information)
        ├── RoleSelector (role change - admins only)
        └── RemoveButton (member removal - admins only)
```

## 4. Component Details

### HouseholdManagementView

- **Component description**: Main component of the household management view. Responsible for loading household and member data, managing state, and coordinating between subcomponents.
- **Main elements**: Main container with sections for household information, member list, and settings. Uses shadcn/ui Card components for layout organization.
- **Handled interactions**: Data loading on mount, error handling, data updates after changes in subcomponents.
- **Validation handled**: Checking if user is household administrator, validation of access to sensitive data (PIN).
- **Types**: HouseholdManagementViewModel, HouseholdDTO, MemberDTO[].
- **Props**: None (standalone component).

### HouseholdInfo

- **Component description**: Component displaying basic household information and enabling inline name editing for administrators.
- **Main elements**: Name field (with Edit button for admins), inline edit form, access PIN (admins only).
- **Handled interactions**: Data display, PIN hiding for members, inline name editing by admins.
- **Validation handled**: PIN visible only for admins, name validation (3-100 characters).
- **Types**: HouseholdDTO, UpdateHouseholdCmd.
- **Props**: household: HouseholdDTO, currentUserRole: 'admin' | 'member', onUpdate?: (updates: UpdateHouseholdCmd) => Promise<void>, isUpdating?: boolean.

### MembersList

- **Component description**: List of all household members with role management and removal capabilities.
- **Main elements**: List of MemberCard components in scrollable container, action buttons visible only for admins.
- **Handled interactions**: Member list rendering, passing role change and removal events.
- **Validation handled**: Access control to modification controls (admin only), preventing removal of last admin or self.
- **Types**: MemberDTO[].
- **Props**: members: MemberDTO[], currentUserRole: 'admin' | 'member', onUpdateRole: (memberId: string, role: string) => void, onRemoveMember: (memberId: string) => void.

### MemberCard

- **Component description**: Individual household member card containing avatar, name, role, and management controls.
- **Main elements**: Avatar (or placeholder), text information, dropdown for role change, removal button.
- **Handled interactions**: Role change via dropdown, member removal with confirmation.
- **Validation handled**: Cannot change role to member if this is the last admin, cannot remove self or last admin.
- **Types**: MemberDTO.
- **Props**: member: MemberDTO, currentUserRole: 'admin' | 'member', currentUserId: string, onUpdateRole: (role: string) => void, onRemove: () => void.

## 5. Types

### Existing types from types.ts

- `HouseholdDTO`: { id: UUID, name: string, timezone: string, pin?: string }
- `MemberDTO`: { id: UUID, user_id: UUID, name: string, avatar_url?: string | null, role: "admin" | "member", joined_at: ISODate }
- `UpdateMemberRoleCmd`: { role: "admin" | "member" }
- `UpdateHouseholdCmd`: { name?: string, timezone?: string }

### New ViewModel types

```typescript
interface HouseholdManagementViewModel {
  household: HouseholdDTO | null;
  members: MemberDTO[];
  currentUserRole: 'admin' | 'member';
  currentUserId: string;
  isLoading: boolean;
  error: string | null;
  isUpdatingHousehold: boolean;
  isUpdatingMember: boolean;
}

interface HouseholdManagementActions {
  loadData: () => Promise<void>;
  updateHousehold: (updates: UpdateHouseholdCmd) => Promise<void>;
  updateMemberRole: (memberId: string, role: 'admin' | 'member') => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
}
```

## 6. State Management

View state will be managed by a custom hook `useHouseholdManagement`. The hook will be responsible for:

- **Local state**: household, members, loading states, error states
- **Data fetching**: Automatic data loading on component mount
- **Updates**: Optimistic updates for better UX, rollback on errors
- **Synchronization**: State updates after successful API operations
- **Errors**: Centralized error management with appropriate messages

The hook will use a state management library (likely React Query or Zustand) for caching and data synchronization.

## 7. API Integration

The view integrates with the following endpoints:

- **GET /v1/households/current**: Get current user's household information
  - Request: No body, JWT authorization
  - Response: HouseholdDTO (PIN only for admins)

- **GET /v1/members**: Get household member list
  - Request: No body, household_id resolved server-side
  - Response: MemberDTO[]

- **PATCH /v1/households/:id**: Update household
  - Request: UpdateHouseholdCmd in body
  - Response: HouseholdDTO

- **PATCH /v1/members/:id**: Change member role
  - Request: UpdateMemberRoleCmd in body
  - Response: MemberDTO

- **DELETE /v1/members/:id**: Remove member
  - Request: No body
  - Response: 204 No Content

All API calls will be handled by the service layer with appropriate error handling and retry logic.

## 8. User Interactions

1. **Data display**: Upon entering the page, household and member data loads automatically
2. **Household inline editing**: Admin can click "Edit" button next to household name, make changes inline and save
3. **Member management**: Admin can change member role via dropdown or remove member
4. **Confirmations**: Destructive actions (member removal) require confirmation via dialog
5. **Feedback**: All actions provide immediate feedback through toast notifications
6. **Responsiveness**: Interface adapts to different screen sizes

## 9. Conditions and Validation

- **View access**: Only household administrators can see the full view
- **PIN display**: PIN visible only for administrators
- **Role changes**: Only administrators can change other members' roles
- **Member removal**: Only administrators, cannot remove last admin or self
- **Household name**: Required, 3-100 characters, automatically trimmed
- **Member count**: Maximum 10 people (enforced by backend)

Validation occurs at the level of:

- **Components**: Access and permission validation
- **Forms**: Input data validation (Zod schemas)
- **API**: Business logic validation on backend

## 10. Error Handling

- **401 Unauthorized**: Redirect to login, clear local state
- **403 Forbidden**: Message about lack of permissions, hide admin controls
- **404 Not Found**: Message about missing household/member
- **409 Conflict**: Detailed messages for business rules (last admin, self-removal)
- **422 Validation Failed**: Display validation errors at form fields
- **500 Internal Server Error**: General error message with retry suggestion

Errors will be presented through toast notifications and appropriate UI states (loading, error states).

## 11. Implementation Steps

1. **Structure preparation**: Create `src/pages/household.astro` file and components in `src/components/household/`
2. **Hook implementation**: Create `useHouseholdManagement` hook with data fetching and updating logic
3. **Basic components**: Implement HouseholdManagementView and HouseholdInfo with inline editing
4. **Member list**: Add MembersList and MemberCard components
5. **Validation and security**: Add role and permission checks
6. **Error handling**: Implement comprehensive API error handling
7. **UI/UX**: Add responsiveness, animations and visual improvements
8. **Testing**: Add unit tests and integration tests
9. **Optimization**: Implement lazy loading and performance optimizations
