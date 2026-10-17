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

## Notes

- Max file size configurable via `MAX_FILE_SIZE_MB` (default 100).
- Expiry via `EXPIRY_MINUTES` (default 10). MongoDB TTL index + cron cleanup every minute.
- Storage abstraction in `server/src/storage/` — swap `local.storage` for S3/R2 without touching services.
- Uploads folder is never served statically.
