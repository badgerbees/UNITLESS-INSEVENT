# UNITLESS

This is a code bundle for UNITLESS. The original project is available at https://www.figma.com/design/ZYkG6Ue1NHojOULQfJavP0/UNITLESS.

## Running the code

Run `pnpm i` to install the dependencies.

Run `pnpm run dev` to start the development server.

## Docker

Local development (hot reload for both applications):

```powershell
docker compose up --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000/docs`

The development compose file reads backend secrets from `backend/.env` and frontend public variables from the root `.env`.

Production-like local build:

```powershell
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up
```

- Frontend: `http://localhost:8080`
- Nginx proxies `/api` to the backend container.

Never place `SUPABASE_SERVICE_ROLE_KEY` in frontend build arguments or any `VITE_*` variable.
