# Nebeng-App — Development Plan

## 1. Project Summary

**Nebeng-App** is a PWA-first anonymous carpool coordination and cost-splitting app for small daily carpool groups such as friends, roommates, or co-workers.

The app focuses on three main goals:

1. Remove daily carpool coordination chaos.
2. Protect user privacy with a Zero-PII room-based model.
3. Calculate fair fuel contribution based on baseline route and detour distance.

The first production version should be simple, mobile-first, and usable by one driver and multiple passengers through a shared anonymous room link.

---

## 2. Product Principles

### 2.1 Zero-PII First

The app must not require:

- Email
- Phone number
- Password
- Real identity
- Exact home address
- Account registration

Access is based on:

- Anonymous room code
- Room link
- Local browser token for the driver
- Nickname-only passenger identity

### 2.2 PWA-First

The app should feel like a native mobile app without requiring App Store or APK distribution.

Core PWA expectations:

- Installable from browser
- Mobile-first layout
- Fast initial load
- Offline-friendly shell
- Cached static assets
- App icon and splash screen

### 2.3 Keep the MVP Lean

The MVP should not attempt to solve every carpool scenario. It should focus on the most common daily flow:

```text
Driver creates room
Driver shares link
Passengers add nickname and pickup pin
Passengers toggle joining today
Driver sequences route
Driver calculates billing
Driver copies report to WhatsApp
```

---

## 3. MVP Scope

## 3.1 Included in MVP

### Driver Features

- Create anonymous room.
- Set driver nickname.
- Set origin point.
- Set destination point.
- Configure fuel cost per kilometer.
- Configure baseline toll cost.
- Share room link to WhatsApp.
- View passengers in the room.
- Toggle passengers active or inactive for today.
- Reorder active passengers manually.
- View route distance estimate using OSRM.
- Calculate billing breakdown.
- Copy daily report text.
- Open native map navigation using deep link.
- Persist driver admin access in `localStorage`.

### Passenger Features

- Join room from shared link.
- Enter nickname.
- Drop fuzzy pickup pin on map.
- Save pickup point.
- Toggle daily status:
  - Joining Today
  - Absent Today
- Reopen app and keep passenger identity locally.

### Privacy Features

- No account creation.
- No login.
- Alias-only passenger data.
- Fuzzy location reminder in UI.
- Room-code-based access.
- Supabase RLS policies.

### Billing Features

- Calculate base cost per person.
- Calculate detour cost per active passenger.
- Generate passenger invoice total.
- Generate WhatsApp-friendly text report.

---

## 3.2 Excluded from MVP

These should not be built in the first version:

- Payment gateway.
- QRIS automation.
- Push notifications.
- Login system.
- User profiles.
- Multiple drivers per room.
- Route optimization algorithm.
- Automatic toll detection.
- Driver/passenger chat.
- Trip history analytics.
- Monthly settlement ledger.
- Native mobile app.
- Google Maps paid API integration.

---

## 4. Recommended Tech Stack

| Layer | Tech | Purpose |
| --- | --- | --- |
| Frontend | Next.js | React app framework |
| Styling | Tailwind CSS | Fast mobile-first UI styling |
| Database | Supabase PostgreSQL | Store rooms, passengers, route data |
| Auth model | Anonymous room token + localStorage | No formal login needed |
| Map UI | Leaflet.js | Interactive pickup pin and route map |
| Map tiles | OpenStreetMap | Free map tiles |
| Routing | OSRM public API | Distance and route geometry |
| PWA | `@ducanh2912/next-pwa` | Service worker and installable app support |
| Deployment | Vercel Hobby | Free hosting |

---

## 5. Main User Flows

## 5.1 Driver Flow

```text
Open app
→ Click Create Room
→ Enter driver nickname
→ Set origin and destination points
→ Set fuel cost/km and toll cost
→ Room code generated
→ Admin token saved locally
→ Driver shares room link to WhatsApp
→ Passengers join and drop pins
→ Driver opens dashboard
→ Driver toggles today's active passengers
→ Driver manually reorders pickup sequence
→ App calculates actual route distance
→ Driver clicks Calculate Billing
→ App generates daily report
→ Driver copies report to WhatsApp
```

## 5.2 Passenger Flow

```text
Click room link from WhatsApp
→ Enter nickname
→ Read fuzzy location privacy warning
→ Drop pickup pin near public landmark
→ Save profile
→ Later open app again
→ Toggle Joining Today or Absent Today
```

---

## 6. Route Calculation Logic

## 6.1 Route Inputs

The route calculation needs these points:

1. Driver origin point.
2. Active passenger pickup points in selected order.
3. Driver destination point.

Example order:

```text
Driver Home → Andi Pickup → Budi Pickup → Office
```

## 6.2 Baseline Route

The baseline route is:

```text
Driver Home → Office
```

This gives:

```text
D_base
```

## 6.3 Actual Route

The actual route is:

```text
Driver Home → Active Pickups → Office
```

This gives:

```text
D_actual
```

## 6.4 Detour Distance

```text
Delta Distance = D_actual - D_base
```

If `D_actual` is less than `D_base` because of routing API variance, force detour distance to zero.

```ts
const detourDistance = Math.max(0, actualDistanceKm - baseDistanceKm);
```

---

## 7. Billing Formula

## 7.1 Variables

| Variable | Meaning |
| --- | --- |
| `D_base` | Driver's direct route distance from origin to destination |
| `D_actual` | Total route distance after passenger pickups |
| `deltaD` | Extra detour distance caused by pickups |
| `fuelCostPerKm` | Fuel cost per kilometer |
| `tollCost` | Baseline toll cost |
| `activePassengers` | Passengers joining today |
| `peopleInCar` | Driver + active passengers |

## 7.2 Formula

```text
Base Cost Total = D_base × fuelCostPerKm + tollCost
Base Cost Per Person = Base Cost Total / peopleInCar
Detour Cost Total = deltaD × fuelCostPerKm
Detour Cost Per Passenger = Detour Cost Total / activePassengers
Passenger Invoice = Base Cost Per Person + Detour Cost Per Passenger
Driver Cost = Base Cost Per Person
```

## 7.3 Edge Cases

### No active passengers

Do not calculate passenger invoices.

Show:

```text
No active passengers today.
```

### One active passenger

The passenger pays:

```text
Base share + full detour cost
```

### Zero detour

Passengers only pay their base share.

### Negative detour

Clamp to zero.

### Missing fuel cost

Block calculation and ask driver to fill fuel cost/km.

---

## 8. Database Design

## 8.1 `rooms` Table

Stores the carpool room and driver settings.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `room_code` | Text | Unique public room code, e.g. `JKT-77X` |
| `admin_token_hash` | Text | Hashed admin token |
| `driver_alias` | Text | Nickname only |
| `origin_lat` | Float | Driver origin latitude |
| `origin_lng` | Float | Driver origin longitude |
| `destination_lat` | Float | Destination latitude |
| `destination_lng` | Float | Destination longitude |
| `fuel_cost_per_km` | Integer | Example: `1200` |
| `toll_cost` | Integer | Example: `15000` |
| `created_at` | Timestamp | Default now |
| `updated_at` | Timestamp | Auto update |

## 8.2 `passengers` Table

Stores anonymous passenger pickup data.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `room_id` | UUID | Foreign key to `rooms.id` |
| `alias` | Text | Nickname only |
| `pickup_lat` | Float | Fuzzy pickup latitude |
| `pickup_lng` | Float | Fuzzy pickup longitude |
| `is_joining_today` | Boolean | Daily attendance status |
| `pickup_order` | Integer | Manual order set by driver |
| `local_member_token_hash` | Text | Optional token for passenger edit ownership |
| `created_at` | Timestamp | Default now |
| `updated_at` | Timestamp | Auto update |

## 8.3 Optional Later Table: `trip_reports`

Do not build this in MVP unless needed.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `room_id` | UUID | Foreign key |
| `report_date` | Date | Trip date |
| `base_distance_km` | Float | Baseline distance |
| `actual_distance_km` | Float | Actual distance |
| `total_detour_km` | Float | Detour distance |
| `report_text` | Text | Generated report |
| `created_at` | Timestamp | Default now |

---

## 9. Supabase RLS Plan

## 9.1 Important Security Note

Because this app is intentionally anonymous, it should not use traditional user-auth-based RLS in the MVP. Instead, security is based on room-code possession and admin token possession.

This is acceptable for a small trusted carpool group, but the UI must clearly communicate that anyone with the room link can access the room.

## 9.2 RLS Policy Direction

Recommended practical MVP approach:

- Enable RLS on all tables.
- Use Supabase Edge Functions or API routes for sensitive operations.
- Do not expose service role key to the client.
- Client can read room data only through validated room code.
- Admin-only operations require admin token validation.

## 9.3 Operation Access

| Operation | Access Rule |
| --- | --- |
| Read room by code | Anyone with valid room code |
| Create room | Public via controlled API route |
| Update driver settings | Admin token required |
| Add passenger | Anyone with valid room code |
| Update own passenger status | Passenger local token or admin token |
| Reorder passengers | Admin token required |
| Delete passenger | Admin token required |

---

## 10. Folder Structure

Recommended Next.js App Router structure:

```text
nebeng-app/
├── app/
│   ├── page.tsx
│   ├── room/
│   │   └── [roomCode]/
│   │       └── page.tsx
│   ├── admin/
│   │   └── [roomCode]/
│   │       └── page.tsx
│   └── api/
│       ├── rooms/
│       │   └── route.ts
│       ├── passengers/
│       │   └── route.ts
│       ├── route-distance/
│       │   └── route.ts
│       └── billing/
│           └── route.ts
├── components/
│   ├── MapPicker.tsx
│   ├── RouteMap.tsx
│   ├── PassengerList.tsx
│   ├── AttendanceToggle.tsx
│   ├── BillingCard.tsx
│   ├── ShareRoomButton.tsx
│   └── InstallPwaPrompt.tsx
├── lib/
│   ├── supabase.ts
│   ├── room-code.ts
│   ├── tokens.ts
│   ├── osrm.ts
│   ├── billing.ts
│   ├── currency.ts
│   └── navigation.ts
├── public/
│   ├── icons/
│   └── manifest.json
├── types/
│   └── index.ts
├── middleware.ts
├── next.config.js
└── package.json
```

---

## 11. Core Components

## 11.1 `MapPicker`

Used by:

- Driver origin selection.
- Driver destination selection.
- Passenger pickup selection.

Responsibilities:

- Render Leaflet map.
- Allow user to place or move marker.
- Return latitude and longitude.
- Show privacy warning for passengers.

## 11.2 `RouteMap`

Used by driver dashboard.

Responsibilities:

- Render origin, pickups, and destination markers.
- Render OSRM polyline route.
- Update when passenger order changes.

## 11.3 `PassengerList`

Used by driver dashboard.

Responsibilities:

- Show all passengers.
- Toggle joining status.
- Drag-and-drop pickup sequence.
- Separate active and inactive passengers.

## 11.4 `BillingCard`

Responsibilities:

- Show base distance.
- Show actual distance.
- Show detour distance.
- Show per-passenger amount.
- Generate WhatsApp-friendly report.
- Copy report to clipboard.

## 11.5 `ShareRoomButton`

Responsibilities:

- Copy room link.
- Open WhatsApp share URL.

---

## 12. OSRM Integration Plan

## 12.1 OSRM Route Request

Use OSRM route service:

```text
/route/v1/driving/{lng},{lat};{lng},{lat};...
```

Example:

```text
https://router.project-osrm.org/route/v1/driving/106.8,-6.2;106.9,-6.25?overview=full&geometries=geojson
```

## 12.2 Wrapper Function

Create `lib/osrm.ts`:

```ts
export async function getRouteDistanceKm(points: LatLng[]): Promise<RouteResult> {
  if (points.length < 2) {
    throw new Error('At least two points are required');
  }

  const coordinates = points
    .map((point) => `${point.lng},${point.lat}`)
    .join(';');

  const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch route from OSRM');
  }

  const data = await response.json();
  const route = data.routes?.[0];

  if (!route) {
    throw new Error('No route found');
  }

  return {
    distanceKm: route.distance / 1000,
    durationMinutes: route.duration / 60,
    geometry: route.geometry,
  };
}
```

## 12.3 Important OSRM Limitation

The public OSRM server is free but not guaranteed for heavy production use. For a portfolio MVP and small group usage, it is fine. If the app grows, migrate to:

- Self-hosted OSRM.
- GraphHopper.
- OpenRouteService.
- Paid routing provider.

---

## 13. Billing Logic Implementation

Create `lib/billing.ts`:

```ts
export function calculateBilling(input: BillingInput): BillingResult {
  const {
    baseDistanceKm,
    actualDistanceKm,
    fuelCostPerKm,
    tollCost,
    activePassengers,
  } = input;

  const passengerCount = activePassengers.length;

  if (passengerCount === 0) {
    return {
      baseCostPerPerson: 0,
      detourCostPerPassenger: 0,
      passengerInvoices: [],
      driverCost: baseDistanceKm * fuelCostPerKm + tollCost,
      detourDistanceKm: 0,
    };
  }

  const peopleInCar = passengerCount + 1;
  const detourDistanceKm = Math.max(0, actualDistanceKm - baseDistanceKm);

  const baseCostTotal = baseDistanceKm * fuelCostPerKm + tollCost;
  const baseCostPerPerson = baseCostTotal / peopleInCar;

  const detourCostTotal = detourDistanceKm * fuelCostPerKm;
  const detourCostPerPassenger = detourCostTotal / passengerCount;

  const passengerInvoice = baseCostPerPerson + detourCostPerPassenger;

  return {
    baseCostPerPerson,
    detourCostPerPassenger,
    detourDistanceKm,
    driverCost: baseCostPerPerson,
    passengerInvoices: activePassengers.map((passenger) => ({
      passengerId: passenger.id,
      alias: passenger.alias,
      amount: Math.round(passengerInvoice),
    })),
  };
}
```

---

## 14. Native Navigation Deep Link

Create `lib/navigation.ts`:

```ts
export function openNativeNavigation(destination: LatLng) {
  const { lat, lng } = destination;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (isIOS) {
    window.location.href = `maps://maps.apple.com/?daddr=${lat},${lng}`;
    return;
  }

  window.location.href = `geo:${lat},${lng}?q=${lat},${lng}`;
}
```

For multi-stop navigation, the MVP can start with the next pickup point only. Later, add full Google Maps URL with waypoints.

---

## 15. UI Pages

## 15.1 Landing Page

Route:

```text
/
```

Content:

- Product name.
- Short explanation.
- Create Room button.
- Privacy-first promise.

Primary CTA:

```text
Create Room
```

## 15.2 Create Room Page or Modal

Inputs:

- Driver nickname.
- Origin point.
- Destination point.
- Fuel cost/km.
- Toll cost.

Output:

- Room code.
- Admin dashboard redirect.

## 15.3 Passenger Room Page

Route:

```text
/room/[roomCode]
```

States:

1. New passenger:
   - Nickname input.
   - Pickup pin map.
   - Save button.
2. Existing passenger:
   - Joining toggle.
   - Pickup pin preview.
   - Edit pickup point button.

## 15.4 Driver Dashboard

Route:

```text
/admin/[roomCode]
```

Sections:

- Room code and share link.
- Driver settings summary.
- Active passengers.
- Inactive passengers.
- Route map.
- Calculate billing button.
- Copy report button.
- Navigate button.

---

## 16. UI Copy Guidelines

## 16.1 Privacy Reminder for Passengers

Use friendly wording:

```text
For privacy, do not place the pin exactly on your house.
Pick a nearby public point like an Indomaret, gate, gas station, or safe pickup spot.
```

## 16.2 Room Access Warning

```text
Anyone with this room link can open the room. Only share it with your carpool group.
```

## 16.3 Passenger Status Toggle

Use simple labels:

```text
Joining Today
Absent Today
```

## 16.4 Billing Button

```text
Calculate Today’s Split
```

---

## 17. Report Format

Generated report should be WhatsApp-friendly:

```text
🚗 DAILY CARPOOL REPORT 🚗
Date: {date}

Driver: {driverAlias}
Passengers: {passengerAliases}

--------------------------------------
💸 Ledger Breakdown:
• {Passenger 1}: IDR {amount}
• {Passenger 2}: IDR {amount}

(Route Base: {baseDistanceKm}km | Actual: {actualDistanceKm}km | Detour: {detourDistanceKm}km)
Please settle via manual transfer/QRIS to {driverAlias}. Drive safe! 🙏
```

---

## 18. Development Phases

## Phase 1 — Project Setup

Goal: Create working Next.js PWA foundation.

Tasks:

- Initialize Next.js project.
- Install Tailwind CSS.
- Install Leaflet and React Leaflet.
- Install Supabase client.
- Install PWA package.
- Configure manifest.
- Add app icons.
- Create basic mobile layout.
- Deploy empty app to Vercel.

Deliverable:

```text
A deployed mobile-first PWA shell.
```

---

## Phase 2 — Room Creation

Goal: Driver can create a room and access dashboard.

Tasks:

- Create Supabase project.
- Create `rooms` table.
- Add room code generator.
- Add admin token generator.
- Hash admin token before saving.
- Store raw admin token in `localStorage`.
- Build create room form.
- Save origin and destination points.
- Redirect to admin dashboard.

Deliverable:

```text
Driver can create a room and reopen admin dashboard.
```

---

## Phase 3 — Passenger Join Flow

Goal: Passenger can join room and set pickup point.

Tasks:

- Create `passengers` table.
- Build `/room/[roomCode]` page.
- Add nickname input.
- Add fuzzy pickup pin map.
- Save passenger data.
- Store passenger local token in `localStorage`.
- Add attendance toggle.

Deliverable:

```text
Passengers can join anonymously and update daily status.
```

---

## Phase 4 — Driver Dashboard

Goal: Driver can manage today’s passenger list.

Tasks:

- Fetch passengers by room code.
- Show active and inactive passengers.
- Add attendance override toggle.
- Add manual pickup ordering.
- Add drag-and-drop support.
- Persist pickup order.
- Add share room link button.

Deliverable:

```text
Driver can control who joins today and in what pickup order.
```

---

## Phase 5 — Map and Routing

Goal: Driver can see calculated route distance.

Tasks:

- Build OSRM route wrapper.
- Fetch baseline route distance.
- Fetch actual route distance.
- Render route polyline on Leaflet map.
- Show distance summary.
- Handle OSRM loading and error states.
- Add native navigation deep link.

Deliverable:

```text
Driver can view route distance and open native navigation.
```

---

## Phase 6 — Billing Calculator

Goal: Driver can calculate fair passenger split.

Tasks:

- Implement billing formula.
- Add edge case handling.
- Build billing result card.
- Format currency as IDR.
- Generate text report.
- Add copy-to-clipboard button.

Deliverable:

```text
Driver can calculate and copy daily carpool report.
```

---

## Phase 7 — PWA Polish and Production Hardening

Goal: Make app feel production-ready.

Tasks:

- Add install prompt.
- Improve offline shell caching.
- Add loading skeletons.
- Add empty states.
- Add error states.
- Add mobile safe-area padding.
- Test on Android Chrome.
- Test on iOS Safari.
- Review privacy copy.
- Review Supabase RLS and API route protection.

Deliverable:

```text
Production-ready portfolio MVP.
```

---

## 19. Two-Week Build Schedule

## Week 1

| Day | Focus | Output |
| --- | --- | --- |
| Day 1 | Setup project, Tailwind, PWA config, Vercel | Deployed app shell |
| Day 2 | Supabase schema and room creation | Driver can create room |
| Day 3 | Map picker for origin/destination | Driver can save route endpoints |
| Day 4 | Passenger join page | Passenger can add nickname and pickup pin |
| Day 5 | Attendance toggle and local passenger token | Passenger can update daily status |
| Day 6 | Driver dashboard passenger list | Driver can view active/inactive users |
| Day 7 | Manual ordering and room sharing | Driver can sequence pickups |

## Week 2

| Day | Focus | Output |
| --- | --- | --- |
| Day 8 | OSRM baseline and actual route distance | Distance data works |
| Day 9 | Leaflet route rendering | Driver can see route line |
| Day 10 | Billing algorithm | Cost split works |
| Day 11 | Report generator and copy button | WhatsApp report works |
| Day 12 | Native navigation deep link | Driver can open map app |
| Day 13 | RLS, error states, mobile polish | Safer and cleaner MVP |
| Day 14 | Testing, README, deployment cleanup | Portfolio-ready release |

---

## 20. Acceptance Criteria

The MVP is considered complete when:

- Driver can create a room without login.
- Room link can be shared through WhatsApp.
- Passenger can join using only nickname.
- Passenger can place fuzzy pickup pin.
- Passenger can toggle joining status.
- Driver can see all passengers.
- Driver can manually reorder active passengers.
- App calculates baseline route distance.
- App calculates actual route distance.
- App calculates passenger payment amount.
- App generates a clean daily report.
- App works well on mobile browser.
- App can be installed as PWA.
- App is deployed on Vercel.
- No email, phone number, password, or exact address is required.

---

## 21. Testing Checklist

## 21.1 Functional Testing

- Create new room.
- Refresh after room creation and confirm admin dashboard persists.
- Open room link in another browser.
- Add passenger.
- Edit pickup pin.
- Toggle joining status.
- Add multiple passengers.
- Reorder passengers.
- Calculate billing.
- Copy report.
- Open navigation deep link.

## 21.2 Privacy Testing

- Confirm no email field exists.
- Confirm no phone field exists.
- Confirm no password field exists.
- Confirm passenger only needs nickname.
- Confirm fuzzy location reminder is visible.
- Confirm admin actions require admin token.

## 21.3 Mobile Testing

Test on:

- Android Chrome.
- iOS Safari.
- WhatsApp in-app browser.
- Installed PWA mode.

Check:

- Map touch controls.
- Marker dragging.
- Button sizes.
- Safe area spacing.
- Copy-to-clipboard behavior.
- Navigation deep link behavior.

## 21.4 Edge Case Testing

- No passenger joined.
- Passenger joined but absent today.
- One active passenger.
- Multiple active passengers.
- OSRM API fails.
- Invalid room code.
- Missing fuel cost.
- Very long nickname.
- Duplicate nickname.

---

## 22. Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| OSRM public API rate limits | Route calculation may fail | Cache route results, show retry button, later migrate to self-hosted routing |
| OSM tile usage policy | Heavy usage may be restricted | Fine for MVP, later use a dedicated tile provider |
| Room link leakage | Anyone with link can access room | Show room access warning, allow driver to regenerate room later |
| Inaccurate pickup pins | Driver confusion | Encourage public landmark pickup points |
| LocalStorage token loss | Driver may lose admin dashboard access | MVP accepts this; later add admin recovery code |
| No payment automation | Manual settlement required | Keep scope lean; QRIS/payment can be later phase |

---

## 23. Future Improvements

After MVP validation, consider adding:

- Monthly ledger history.
- QRIS image upload for payment instruction.
- Multiple trip templates.
- Morning/evening route separation.
- Passenger pickup notes.
- Room reset link.
- Admin recovery phrase.
- Route optimization suggestion.
- Per-passenger detour attribution.
- Push notification reminder.
- Self-hosted routing engine.
- Export monthly report to CSV.

---

## 24. Suggested First Commit Plan

```text
feat: initialize nebeng-app pwa project
feat: add room creation flow
feat: add supabase schema
feat: add passenger join flow
feat: add map picker
feat: add driver dashboard
feat: add osrm route distance calculation
feat: add billing calculator
feat: add whatsapp report generator
feat: add pwa manifest and install support
chore: polish mobile ui and deployment config
```

---

## 25. Final MVP Positioning

Nebeng-App should be positioned as:

```text
A privacy-first PWA for small daily carpool groups to coordinate pickups and split fuel fairly, without accounts or personal data.
```

This is a strong portfolio project because it demonstrates:

- Real-world business problem solving.
- Mobile-first product thinking.
- Privacy-conscious architecture.
- Map and routing integration.
- Cost calculation logic.
- Database design.
- PWA deployment.
- Practical UX for Indonesian daily transportation habits.
