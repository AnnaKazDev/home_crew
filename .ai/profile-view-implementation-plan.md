# User Profile View Implementation Plan

## 1. Overview

The User Profile view allows users to view and edit their personal data, such as name and avatar, as well as display accumulated points for completed tasks. This is a key element of the Home Crew application, providing personalization and motivation through the points system, compliant with security and data privacy requirements.

## 2. View Routing

The view should be available at the `/profile` path. In the Astro application, create a file `src/pages/profile.astro` or `src/pages/profile.tsx` with appropriate routing configuration.

## 3. Component Structure

- **ProfileView**: Main page component, containing layout and state management.
  - **ProfileForm**: Profile edit form with name and avatar fields.
  - **PointsDisplay**: Component displaying the user's total points.

## 4. Component Details

### ProfileView

- **Component description**: Main view component, responsible for loading profile data, managing state, and rendering subcomponents. Consists of header, edit form, and points section.
- **Main elements**: `<div>` container with `<h1>` title, `<ProfileForm>`, `<PointsDisplay>`.
- **Handled events**: onLoad (data fetching), onFormSubmit (profile update).
- **Validation conditions**: Form field validation according to API (name: 1-100 characters, avatar_url: optional URL). Validation errors displayed in real-time.
- **Types**: ProfileDTO for profile data, ViewModel for form state.
- **Props**: None (main component).

### ProfileForm

- **Component description**: Form for editing user name and avatar, with save button. Uses shadcn/ui for input fields and button.
- **Main elements**: `<form>` with `<Input>` for name, `<Input>` for avatar_url, `<Button>` submit.
- **Handled events**: onChange for fields, onSubmit for form.
- **Validation conditions**: name required, ≤100 characters, trimmed; avatar_url optional, must be valid URL if provided.
- **Types**: UpdateProfileCmd for form data, ProfileDTO for initial filling.
- **Props**: { profile: ProfileDTO, onUpdate: (data: UpdateProfileCmd) => Promise<void> }

### PointsDisplay

- **Component description**: Simple component displaying points number, using badge from shadcn/ui.
- **Main elements**: `<Badge>` or `<span>` with points text.
- **Handled events**: None (display only).
- **Validation conditions**: None.
- **Types**: ProfileDTO.total_points (number) - points calculated fresh from current tasks.
- **Props**: { points: number }

## 5. Types

- **ProfileDTO**: { id: string, name: string, avatar_url: string | null, total_points: number } - DTO from API for profile data.
- **UpdateProfileCmd**: { name: string, avatar_url?: string | null } - Command for updates.
- **ProfileFormViewModel**: { formData: UpdateProfileCmd, isLoading: boolean, errors: Record<string, string> } - ViewModel for form state, containing data, loading flag, and validation errors.

## 6. State Management

State is managed by the main ProfileView component using useState for profile and form. For complex operations, a custom hook `useProfile` is recommended, which handles fetch and update via API, returning { profile, loading, error, updateProfile }.

## 7. API Integration

Integration with `/v1/profiles/me` endpoint (GET for retrieval, PATCH for updates). GET request returns ProfileDTO, PATCH accepts UpdateProfileCmd and returns updated ProfileDTO. Use Supabase client from context.locals in Astro routes. Handle JWT token automatically.

## 8. User Interactions

- **Name editing**: User enters new name in input field, real-time validation.
- **Avatar editing**: Optional URL field, URL format validation.
- **Saving**: Submit button click sends PATCH, displays success toast or errors.
- **Points overview**: Static points display without interaction.

## 9. Conditions and Validation

- **Name**: Required, 1-100 characters, trimmed, checked by Zod schema in component.
- **Avatar URL**: Optional, must be valid URL if provided, validation in form.
- **UI state**: On validation errors submit button disabled, error messages displayed under fields.

## 10. Error Handling

- **API errors**: 401 - redirect to login, 422 - display API validation errors, 404 - message "profile not found", 500 - general server error.
- **Network errors**: Toast with "connection problem" message, retry option.
- **Validation errors**: Display under form fields, block submit.

## 11. Implementation Steps

1. Create `src/pages/profile.astro` file with basic layout.
2. Implement ProfileView component with data loading.
3. Create ProfileForm with validation using React Hook Form and shadcn/ui.
4. Add PointsDisplay as simple component.
5. Integrate API calls in useProfile hook.
6. Add error handling and toasts for user feedback.
7. Test responsiveness and accessibility according to shadcn/ui.
8. Conduct integration tests with backend.
