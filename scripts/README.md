# Development Scripts

This directory contains utility scripts for development, testing, and debugging.

## Available Scripts

### Database & User Management

- `create-test-user.example.js` - Example script for creating test users (uses environment variables)
- `create-second-user.js` - Script for creating additional test users

### Debugging & Diagnostics

- `debug-points.js` - Debug script for points calculation issues
- `check-points.js` - Script to check points data
- `test-fresh-points.js` - Test fresh points calculation

### Database Utilities

- `check-household-pin.js` - Check household PIN data
- `test-db.js` - General database connectivity test

## Environment Variables

All scripts now use environment variables instead of hardcoded credentials:

### Required Variables

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for bypassing RLS
- `TEST_USER_ID` - Test user ID (for scripts that need a specific user)

### Setup

1. Get Supabase values: `supabase status -o env`
2. Create `.env.test` file with the required variables
3. Load variables: `source .env.test` or use your preferred method

## Security Note

✅ **All hardcoded credentials have been removed and replaced with environment variables.**
Scripts will fail with clear error messages if required variables are missing.

## Usage

Run scripts from the project root:

```bash
# Create test user
npm run db:create-test-user

# Debug points system
npm run debug:points

# Or run directly
node scripts/debug-points.js
```
