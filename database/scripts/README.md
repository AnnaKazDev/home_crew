# Database Scripts

This directory contains SQL scripts for database diagnostics, testing, and development utilities.

## Available Scripts

### Diagnostics
- `check_rls.sql` - Check Row Level Security settings on tables
- `test.sql` - Test database connectivity and table existence

### Test Data
- `test_data.sql` - Test data for development
- `insert_seed.sql` - Seed data (consider using `supabase/seed.sql` instead)

### Legacy Scripts (May be outdated)
- `create_table.sql` - Manual table creation (use migrations instead)
- `disable_rls.sql` - Disable RLS (use migrations instead)

## Important Notes

⚠️ **Legacy scripts may be outdated** - prefer using Supabase migrations in `supabase/migrations/` for schema changes.

⚠️ **Seed data** - `insert_seed.sql` appears to duplicate `supabase/seed.sql`. Consider consolidating.

## Usage

Run scripts directly with your database client or Supabase CLI:

```bash
# Check RLS settings
psql -f database/scripts/check_rls.sql

# Or with Supabase CLI
supabase db reset --linked
```
