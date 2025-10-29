# Craig Pets Backend

Node.js/Express API powering the Craig Pets luxury feline catalogue. Provides authenticated admin endpoints, PostgreSQL persistence, and secure image upload handling.

## Prerequisites

- Node.js 18+
- PostgreSQL running with the credentials defined in `.env`

## Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Update `.env` with production credentials and a strong `JWT_SECRET`. The example configuration targets a local PostgreSQL instance on port `1998` named `craigpets`.

## Available scripts

- `npm run dev` – start the API in watch mode with Nodemon
- `npm start` – run the compiled server

## Database

The server automatically ensures the schema and seeds sample cats on startup. Tables:

- `cats` – catalogue entries with health, temperament, and logistics metadata
- `cat_images` – associated gallery images

## API overview

| Method | Endpoint              | Description                         | Auth |
| ------ | --------------------- | ----------------------------------- | ---- |
| POST   | `/api/auth/login`     | Create JWT session for admin portal | No   |
| GET    | `/api/cats`           | List cats with optional filters     | No   |
| GET    | `/api/cats/:id`       | Retrieve a single cat dossier       | No   |
| POST   | `/api/cats`           | Create a new cat listing            | Yes  |
| PUT    | `/api/cats/:id`       | Update an existing cat              | Yes  |
| DELETE | `/api/cats/:id`       | Remove a cat listing                | Yes  |
| POST   | `/api/uploads/images` | Upload gallery images via Multer    | Yes  |

All authenticated endpoints expect a `Bearer` token returned by `/api/auth/login`.

## File uploads

Images are stored under `public/uploads` and exposed at `/uploads/<filename>`. Accepted formats: JPEG, PNG, WebP. Max file size is 5 MB with up to 5 images per request.

## Health check

`GET /api/health` returns status and environment metadata for monitoring.
