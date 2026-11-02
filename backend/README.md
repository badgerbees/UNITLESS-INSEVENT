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

For production, set `ENVIRONMENT=production`, `FRONTEND_URL` to the deployed frontend origin, and keep `SUPABASE_SERVICE_ROLE_KEY` only in the backend/Vercel environment. Never expose the service-role key through `VITE_*` variables.
