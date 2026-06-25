# NebengNih

NebengNih is a mobile-first carpool coordination and cost-splitting app for small daily ride groups. A driver creates a room, shares the room link, passengers submit their pickup pins, and the driver gets a route overview plus a WhatsApp-friendly cost ledger.

The MVP is intentionally anonymous and room-based: no accounts, no passwords, no phone-number login, and no formal passenger profiles.

## Features

- Driver room creation with persistent driver session history.
- Passenger join flow through room code or shared link.
- Interactive pickup, start, and destination maps using Leaflet and OpenStreetMap.
- Current-location shortcut for pickup and route setup maps.
- Route distance and geometry through OSRM.
- Passenger lineup management: active toggle, reorder, optimize order, manual add, and delete.
- Cost split based on base route, pickup detour, fuel efficiency, fuel price, and additional cost.
- WhatsApp-ready ledger copy.
- Shareable passenger invite link.
- PWA assets and service worker shell.
- Supabase-backed room persistence with local development support.

## Tech Stack

- Next.js 16
- React 19
- Tailwind CSS 4
- Supabase PostgreSQL
- Leaflet
- OpenStreetMap tiles
- OSRM public routing API
- Vercel Analytics

## Project Structure

```text
.
├── nebengnih-fe/          # Next.js frontend app
├── supabase/migrations/   # Database schema migration
├── plan.md                # Product and MVP planning notes
└── README.md
```

## Getting Started

Install dependencies from the frontend app directory:

```bash
cd nebengnih-fe
npm install
```

Create your local environment file:

```bash
cp .env.example .env.local
```

Fill in the required values:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=
```

Run the app locally:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Supabase Setup

Apply the migration in:

```text
supabase/migrations/20260612000100_nebengnih_mvp.sql
```

The migration creates:

- `driver_sessions`
- `rooms`
- trigger-based `updated_at`
- RLS policies
- realtime publication setup for `rooms`

For local and Vercel environments, set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

The service role key is used only by server-side API routes. Never expose it in browser code.

## Main Flows

### Driver

```text
Open app
Create New Route Room
Fill driver name, start location, destination, and cost parameters
Save route and invite passengers
Open driver dashboard
Manage passenger lineup
Start route or copy ledger
```

### Passenger

```text
Open shared room link
Enter name
Set pickup location on map
Save location status
Wait for driver to send final price via WhatsApp or chat app
Reopen the same room link to edit pickup/name
```

## Useful Scripts

Run from `nebengnih-fe/`:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

TypeScript check:

```bash
npx tsc --noEmit
```

## Deployment

This project is prepared for Vercel.

Recommended Vercel settings:

- Root Directory: `nebengnih-fe`
- Build Command: `npm run build`
- Output: Next.js default

Set the same environment variables in Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Use the deployed app URL for `NEXT_PUBLIC_APP_URL` so invite links point to production.

## MVP Notes

NebengNih currently focuses on anonymous daily carpool coordination. The MVP does not include payments, chat, user accounts, monthly analytics, or advanced settlement history.

The app is designed around a simple trust model:

- Drivers own rooms through a secure session cookie.
- Passengers join through room links.
- Room state is stored in Supabase.
- Passenger privacy is protected by encouraging nearby public pickup points instead of exact home locations.

