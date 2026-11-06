# TemanBunda Backend

FastAPI backend for the TemanBunda pregnancy companion application.

## Local development

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.

- Health check: `GET /api/health`
- Readiness check: `GET /api/ready`
- API docs: `http://localhost:8000/docs`

Copy `backend/.env.example` to `backend/.env` and fill in the Supabase values locally.

Account settings use `PATCH /api/me/email` and `POST /api/me/password`.
Set `SUPABASE_ANON_KEY` in the backend environment for current-password verification;
password changes also require `SUPABASE_SERVICE_ROLE_KEY` to save the new password.
These endpoints update Supabase Auth and do not require a database migration.

## Judges' demo accounts

After applying the database migrations, run from `backend`:

```powershell
python -m scripts.seed_judges
```

This creates confirmed `juri.ibu@example.com` and `juri.suami@example.com` accounts,
already paired, with fictional pregnancy, health, vitamin, calendar, checklist,
and birth-plan records. Generated passwords are saved in the ignored local
`scratch/judges-demo-credentials.json`. The current public demo login credentials
are published in the [repository README](../README.md#akun-demo-juri).
The script uses the configured Supabase service-role key; no PostgreSQL password
is needed. It refuses to modify unrelated accounts or pregnancies.

Running it again refreshes the marked demo family's sample records relative to
the current date in WIB, including today's logs and upcoming appointments.
This can overwrite edits to the seeded sample rows; records added separately by
judges are retained. Keep the local credentials file to reuse the same accounts.

For production, set `ENVIRONMENT=production`, `FRONTEND_URL` to the deployed frontend origin, and keep `SUPABASE_SERVICE_ROLE_KEY` only in the backend/Vercel environment. Never expose the service-role key through `VITE_*` variables.
