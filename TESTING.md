# Testing Guide - Home Crew

## Overview

This project uses a comprehensive testing setup with **Vitest** for unit tests and **Playwright** for end-to-end tests, following the tech stack requirements.

## Tech Stack for Testing

- **Vitest** - Fast unit testing framework for TypeScript/JavaScript with native ESM support
- **React Testing Library** - Testing utilities for React components with focus on user interactions
- **Playwright** - End-to-end testing framework for modern web apps with cross-browser support
- **jsdom** - DOM environment for unit tests

## Project Structure

```
src/
├── _tests/                 # Unit tests (moved from __tests__ for consistency)
│   ├── components/         # Unit tests for components
│   ├── daily-chores/       # Unit tests for daily-chores components
│   ├── hooks/              # Unit tests for hooks
│   └── integration/        # Integration tests
├── test/
│   ├── setup.ts            # Global test setup
│   └── test-utils.tsx      # Custom render utilities
e2e/                        # End-to-end tests
└── add-chore-flow.spec.ts
```

## Unit Tests (Vitest)

### Running Tests

```bash
# Run all unit tests
npm run test:run

# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Writing Unit Tests

#### Basic Component Test

```tsx
import { render, screen } from '@/test/test-utils'
import { MyComponent } from '../MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)

    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('handles user interactions', async () => {
    const user = userEvent.setup()
    render(<MyComponent />)

    await user.click(screen.getByRole('button'))

    expect(screen.getByText('Clicked!')).toBeInTheDocument()
  })
})
```

#### Custom Render with Providers

All tests automatically include:
- React Query Provider
- Theme Provider (next-themes)
- Jest-DOM matchers

```tsx
import { render, screen } from '@/test/test-utils'
```

### Test Configuration

- **Environment**: jsdom for DOM testing
- **Setup**: `src/test/setup.ts` - includes jest-dom and mocks
- **Globals**: Vitest globals enabled (no imports needed)
- **CSS**: CSS processing enabled for styled components

## End-to-End Tests (Playwright)

### Prerequisites

E2E tests require a running development server.

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run E2E tests
npm run test:e2e
```

### Test Environment Setup

**Tests use test data from `.env.test` file** - just start the database and server!

```bash
# 1. Start Supabase locally
supabase start

# 2. Reset the database (applies migrations and seed data)
supabase db reset

# 3. Configure environment variables for tests (SECURE! 📋)
# Get values from Supabase CLI (local keys):
supabase status -o env
# Add to .env.test:
# SUPABASE_URL=http://127.0.0.1:54321
# SUPABASE_SERVICE_ROLE_KEY=your_service_key_from_cli
# TEST_USER_EMAIL=test@example.com
# TEST_USER_PASSWORD=secure_password
# TEST_USER_ID=generated_uuid

# 4. Create test user (one-time, secure setup)
# Copy create-test-user.example.js to create-test-user.js
cp create-test-user.example.js create-test-user.js
# Run: node create-test-user.js

# 5. Start development server in test mode
npm run dev:e2e

# 6. In another terminal, run tests
npm run test:e2e
```

**Test users (defined in `.env.test`):**
- **Admin**: `dev@example.com` / `password` (ID: `e9d12995-1f3e-491d-9628-3c4137d266d1`)

**How E2E tests work:**
- Tests load data from `.env.test` file
- Use the normal `/api/auth/login` endpoint for authentication
- Set session cookies for the test browser
- **Each test cleans up after itself** - removes added tasks at the end
- Environment stays clean between tests

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug
```

### Writing E2E Tests

```ts
import { test, expect } from '@playwright/test'

test.describe('My Feature', () => {
  test('should work end-to-end', async ({ page }) => {
    await page.goto('/')

    // Interact with your app
    await page.click('button:has-text("Click me")')

    // Assert results
    await expect(page.locator('text=Success!')).toBeVisible()
  })
})
```

### E2E Configuration

- **Browser**: Chromium only (as per guidelines)
- **Base URL**: `http://localhost:3001`
- **Parallel execution**: Enabled
- **Screenshots**: On failure only
- **Traces**: On first retry

## Best Practices

### Unit Tests

1. **Use React Testing Library** - Focus on user behavior, not implementation details
2. **Test user interactions** - Use `userEvent` for realistic interactions
3. **Mock external dependencies** - Use `vi.mock()` for APIs, services, etc.
4. **Test edge cases** - Null values, error states, loading states
5. **Keep tests fast** - Avoid unnecessary async operations

### E2E Tests

1. **Test user journeys** - Complete workflows, not isolated features
2. **Use page objects** - For complex interactions (future improvement)
3. **Handle async operations** - Wait for elements, not arbitrary timeouts
4. **Test on real data** - Use test database/seed data when possible
5. **Keep tests independent** - Each test should be runnable in isolation

### General

1. **Descriptive test names** - Explain what and why you're testing
2. **Arrange-Act-Assert pattern** - Clear test structure
3. **Avoid flaky tests** - Use proper waits and assertions
4. **Regular maintenance** - Update tests when UI changes

## CI/CD Integration

Tests are designed to work in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Unit Tests
  run: npm run test:run

- name: Run E2E Tests
  run: |
    npm run dev &
    npm run test:e2e
```

## Troubleshooting

### Common Issues

1. **Tests failing due to missing server**: Start dev server before E2E tests
2. **Import errors**: Check `@` alias resolution in vitest config
3. **DOM not found**: Ensure jsdom environment is set for unit tests
4. **Async timing**: Use `findBy*` queries for async content

### Debug Mode

```bash
# Debug unit tests
npm run test -- --reporter=verbose --no-coverage

# Debug E2E tests
npm run test:e2e:debug
```

## Future Improvements

- [ ] Page Object Model for E2E tests
- [ ] Visual regression testing with Playwright
- [ ] Component storybook integration
- [ ] API testing utilities
- [ ] Performance testing
- [ ] Accessibility testing
