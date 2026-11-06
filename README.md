# TemanBunda

This is a code bundle for TemanBunda. The original project is available at https://www.figma.com/design/ZYkG6Ue1NHojOULQfJavP0/UNITLESS.

## Akun Demo Juri

Buka [TemanBunda](https://unitless-insevent.vercel.app/) dan masuk menggunakan salah satu akun berikut:

| Peran | Email | Kata sandi |
| --- | --- | --- |
| Ibu | `juri.ibu@example.com` | `Juri!JtNHRcSpKn2fq-we` |
| Suami / Pendamping | `juri.suami@example.com` | `Juri!m747rrSBfgTxZV2C` |

Kedua akun sudah tersinkronisasi dan dapat langsung digunakan tanpa konfirmasi
email. Data demo mencakup kehamilan 32 minggu saat dibuat, riwayat pemeriksaan,
vitamin, gerakan janin, jadwal ANC, checklist persiapan, dan rencana persalinan.

Akun ini dibagikan secara publik untuk pengujian juri. Semua data keluarga
bersifat fiktif; gunakan data fiktif saat mencoba fitur aplikasi. Gunakan dua
browser atau profil browser yang berbeda untuk mencoba kedua akun bersamaan.

Panduan membuat atau memperbarui data demo tersedia di
[README backend](backend/README.md#judges-demo-accounts).

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
