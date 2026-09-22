# Folio (React frontend)

A React app for the Folio portfolio builder. Talks directly to the Folio
API in `../backend` — nothing is stored in the browser anymore except your
login token.

## What's here

- **Login / sign up** (`src/pages/AuthPage.jsx`) — a private login gate.
  Only someone with your email and password can edit your portfolio.
- **Editor** (`src/pages/EditorPage.jsx`) — the same sections as before
  (Profile, Social links, Experience, Education, Skills, Tech stack,
  Projects, Testimonials, Messages), each one now reading and writing
  through the API in real time.
- **Public page** (`src/pages/PublicPage.jsx`, route `/p/:profileId`) — the
  read-only page anyone can visit if you've turned "Make my portfolio
  public" on, including a working contact form.

New accounts start empty, except three social links (GitHub, Facebook, and
Email — with your signup email already filled in) so your contact info is
one click away from being ready.

## Run it

You'll need the backend (`../backend`) running first — see its README for
connecting it to your Aiven database.

```bash
npm install
cp .env.example .env
```

Edit `.env` so `VITE_API_URL` points at your running backend (defaults to
`http://localhost:4000`).

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). Sign up for an
account, and you're in.

## Getting your public link

Once logged in, turn on "Make my portfolio public" in the Profile tab — your
shareable link (`/p/<your profile id>`) appears right below the toggle.

## Building for production

```bash
npm run build
```

Outputs static files to `dist/`, which you can host anywhere (Netlify,
Vercel, or a static bucket) as long as `VITE_API_URL` is set to your
deployed backend's URL at build time.
