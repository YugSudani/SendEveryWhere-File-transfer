# Send Everywhere

Simple file-sharing web app (MERN). Sender uploads files and gets a 6-digit code. Receiver enters the code to download. Files expire after 10 minutes.

## Structure

- `server/` — Express + Mongoose + Multer + archiver + node-cron
- `client/` — React (Vite) + React Router + Axios

## Run locally

1. Start MongoDB locally.
2. Backend:

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

3. Frontend:

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`. API runs on `http://localhost:5000`.

## API

- `POST /api/files/upload` (multipart field `files`)
- `GET /api/files/:code` (info)
- `GET /api/files/:code/download` (single file or ZIP)
- `GET /health`

Response shape: `{ success, data, message }`.

## Deploying
1. Set environment variables on your host (see `server/.env.example`). `MONGO_URI` must point to a reachable MongoDB (Atlas or self-hosted). `.env` is gitignored and is NOT deployed automatically.
2. MongoDB Atlas: add your host's IP (or `0.0.0.0/0`) under Network Access, otherwise connections are rejected.
3. If your host/DNS refuses SRV lookups (`querySrv EREFUSED`), use the direct (non-`+srv`) connection string from `.env.example` instead of the `mongodb+srv://` form.
4. Set `CLIENT_URL` to your deployed frontend origin and `VITE_API_BASE_URL` (client) to your deployed API URL.
5. Ensure the `uploads/` directory is writable (or switch to S3/R2 storage).

## Notes

- Max total transfer size configurable via `MAX_TOTAL_SIZE_GB` (default 1, applies to all files in one transfer combined).
- Expiry via `EXPIRY_MINUTES` (default 10). MongoDB TTL index + cron cleanup every minute.
- Storage abstraction in `server/src/storage/` — swap `local.storage` for S3/R2 without touching services.
- Uploads folder is never served statically.
