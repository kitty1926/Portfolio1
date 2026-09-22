# Folio API

A REST API for the Folio portfolio builder. Built with Node.js, Express, and
PostgreSQL, matching the schema in `schema.sql` exactly (the tables and
columns from your ER diagram — `user`, `profile`, `education`, `experience`,
`project`, `project_media`, `skills`, `tech_stack`, `social_link`,
`testimonial`, `analytics`, `contact_message`). The only addition is
`profile.photo_url`, needed to store the profile picture.

## 1. Install

You'll need Node.js 18+ and your Aiven PostgreSQL database.

```bash
cd backend
npm install
```

## 2. Configure

```bash
cp .env.example .env
```

Get your connection string from Aiven:
1. Log into [console.aiven.io](https://console.aiven.io)
2. Open your PostgreSQL service
3. On the **Overview** tab, copy the **Service URI**
4. Paste it into `.env` as `DATABASE_URL`

It looks like this (the `defaultdb` at the end matches Aiven's default
database name — you don't need to change it):

```
postgres://avnadmin:YOUR_PASSWORD@your-service-name.aivencloud.com:12345/defaultdb?sslmode=require
```

Leave `PGSSL=true` — Aiven requires SSL for every connection.

Also set `JWT_SECRET` to a long random string (a one-line command to
generate one is in the `.env.example` file).

## 3. Create the tables

```bash
npm run migrate
```

This runs `schema.sql` against your database. Safe to re-run — it uses
`CREATE TABLE IF NOT EXISTS`.

## 4. Run it

```bash
npm start
```

The API listens on `http://localhost:4000` (or whatever `PORT` you set).
Check it's alive:

```bash
curl http://localhost:4000/api/health
```

## How it's organized

- **Auth** (`/api/auth/register`, `/api/auth/login`) — creates a `user` row
  plus an empty `profile` row in one step, and returns a JWT. Every other
  route (except the `/api/public/*` ones) requires this token in an
  `Authorization: Bearer <token>` header.
- **Profile** (`/api/profile`) — get/update your own name, bio, and
  visibility; `/api/profile/photo` accepts a multipart image upload and
  saves it under `/uploads`.
- **Simple resources** (`/api/education`, `/api/experience`, `/api/skills`,
  `/api/tech-stack`, `/api/social-links`, `/api/testimonials`) — plain
  list/create/update/delete, always scoped to your own profile. These six
  share one generic router (`src/utils/crud.js`) since they're all the same
  shape.
- **Projects** (`/api/projects`) — same idea, plus nested endpoints for
  `project_media`: `POST/PUT/DELETE /api/projects/:id/media/:mediaId`.
- **Messages** (`/api/messages`) — your inbox of `contact_message` rows.
- **Analytics** (`/api/analytics`) — your view count.
- **Public** (`/api/public/:profileId`) — no login required. Returns
  everything needed to render one person's public portfolio page (only if
  they've turned `is_public` on), and logs a view. Its sibling,
  `POST /api/public/:profileId/contact`, is how a visitor's contact form
  submission gets in without them needing an account.

## The frontend

The `frontend/` folder (next to this one) is a React app that talks to this
API directly — login, editing, and the public portfolio page are all wired
up to these endpoints already. See `frontend/README.md` to run it.

## A note on deployment

This server needs to run somewhere that stays on — a small VM, Render,
Railway, Fly.io, etc. — and the `uploads` folder needs persistent storage
(or swap it for S3/Cloudinary) since most hosts wipe local disk on redeploy.
Your Aiven database itself is already always-on and doesn't need any of this.
