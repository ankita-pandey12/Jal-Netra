# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:


## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
**Jal-Netra — Fleet & Live Tracking (Express + MySQL + Socket.IO + React/Leaflet)**

- **Overview:** Jal-Netra is a demo fleet allocation and live-tracking integration. The backend (Node.js + Express + mysql2) manages `trucks`, `locations`, `assignments`, and `telemetry`. Realtime updates use Socket.IO under namespace `/fleet`. The frontend is a React app (Leaflet) that calls REST endpoints for initial data and subscribes to telemetry via Socket.IO for live updates.

**Architecture**
- **Backend:** [server/index.js](server/index.js) — Express API + Socket.IO `/fleet` namespace. DB access via `mysql2` pool in [server/db.js](server/db.js).
- **Database schema & seeds:** [server/schema.sql](server/schema.sql)
- **Frontend:** React app in `src/` — `src/context/WaterContext.jsx` fetches `/api/locations` and `/api/trucks`. Live map component is `src/components/trucktracking/trucktracking.jsx` and `src/components/TruckTracking.jsx` (Leaflet + socket.io-client).

**Quick Setup (Windows)**
1. Install node dependencies (project root):

```bash
cd d:/hackathon_2/Jal-Netra
npm install
```

2. Configure database credentials: edit `server/.env` and set `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`.

3. Create / seed the MySQL schema (run as a user with CREATE and INSERT privileges):

```bash
# using mysql CLI
mysql -u root -p < d:/hackathon_2/Jal-Netra/server/schema.sql
```

4. Start backend (server):

```bash
cd d:/hackathon_2/Jal-Netra/server
npm install   # install server deps if separate
node index.js
# or use nodemon if available: npx nodemon index.js
```

5. Start frontend dev server (Vite):

```bash
cd d:/hackathon_2/Jal-Netra
npm run dev
```

Open `http://localhost:5173` (or the port shown by Vite) in the browser and the backend at `http://localhost:5000` (default port).

**Important Commands & Endpoints**
- Apply DB schema & seeds: `mysql -u root -p < server/schema.sql`
- Backend start: `node server/index.js`
- Frontend start: `npm run dev`

REST endpoints (examples)
- GET /api/locations -> list available locations
- GET /api/trucks -> list all trucks (id, status, assignment_id, lat, lng)
- POST /api/assignments { "locationId": "<id>" } -> atomically allocate next AVAILABLE truck
- GET /api/assignments -> list assignments
- GET /api/telemetry?truckId=T-101 -> recent telemetry points
- POST /api/telemetry -> ingest telemetry (body: truckId, lat, lng, speed?, status?)

Socket.IO (Realtime)
- Namespace: `/fleet`
- Server emits:
	- `telemetry` { truckId, lat, lng, status, ts }
	- `truck.updated` { truckId, status, assignmentId, lat, lng }
	- `assignment.created` { assignmentId, truckId, locationId }
- Client: connect to `/fleet` and `socket.emit('subscribe', { truckId })` to join the truck room `truck:<truckId>`.

Example cURL to allocate a truck:
```bash
curl -X POST -H "Content-Type: application/json" -d '{"locationId":"loc-1"}' http://localhost:5000/api/assignments
```

**Frontend integration notes**
- On load: call `/api/locations` and `/api/trucks` and render markers & list items.
- Allocate: call `POST /api/assignments` with `locationId`.
- Live view: use `socket.io-client` and subscribe to `/fleet`. When clicking "View" for a tanker, open the inline `TruckTracking` component and call `socket.emit('subscribe', { truckId })`. Update marker/polylines from `telemetry` events.
- Helpful components/files in repo:
	- `src/context/WaterContext.jsx` — centralized fetch and allocation logic
	- `src/components/LogisticsPage.jsx` — allocation UI and fleet table
	- `src/components/trucktracking/trucktracking.jsx` — live map panel

**Troubleshooting**
- Vite import error for `socket.io-client`: ensure dependency installed `npm install socket.io-client` (I added this to package.json). If Vite still fails, clear `node_modules` and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

- DB connection errors: check `server/.env` values and that MySQL is running on those credentials. Run a quick DB test:

```sql
-- login to mysql and verify tables
USE jalnetra;
SHOW TABLES;
SELECT COUNT(*) FROM locations;
```

- If allocations return `409` or `No AVAILABLE trucks`: ensure some trucks are seeded with `status='AVAILABLE'` in `trucks` table.

**Testing concurrent allocations**
- The server uses transactions + `SELECT ... FOR UPDATE` on `trucks` to prevent double allocation. Test by firing two concurrent POST /api/assignments requests for the same location — one should succeed and the other should return 409 if only one truck was AVAILABLE.

**Next steps / Improvements**
- Add Docker Compose (MySQL + app) for reproducible local dev.
- Add unit tests that simulate concurrent allocation and verify no double assignment.
- Add authentication (JWT/api-keys) to protect REST and WebSocket endpoints.
- Add `GET /api/assignments?truckId=` to simplify frontend destination lookup.

If you want, I can now:
- Add a small telemetry simulator to the backend that emits periodic telemetry for assigned trucks.
- Add Docker Compose and npm scripts to bring up MySQL + server quickly.
- Add the `GET /api/assignments?truckId=` endpoint and update the tracker to call it.

Pick one and I'll implement it next.
