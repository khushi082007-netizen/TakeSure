# Migrations

`001_init.sql` is the authoritative PostgreSQL schema (Supabase-compatible). The SQLAlchemy models in
`backend/app/models` describe the same tables; `create_all` is used only for SQLite development and tests.

```bash
psql "$DATABASE_URL" -f database/migrations/001_init.sql
cd backend && python scripts/seed.py            # idempotent: validates then loads KB v1.0.0
```

Add new migrations as `002_<name>.sql`, never edit an applied file.
