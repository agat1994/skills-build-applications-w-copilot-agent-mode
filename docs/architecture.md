# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Keep data fetching in the feature components and use the shared API client for URL construction and JSON responses. Show accessible loading, error, empty, and success states.
- Logic tier decision: Keep route handlers thin; implement request validation and capability behavior in explicit service functions. 
- Data tier decision: Use Mongoose schemas for field validation and references; keep the existing idempotent seed behavior.
- Activity tracking approach: Validate user and team IDs and confirm both records exist. Store the activity type and minutes, award one point per minute, and set the occurrence time when creating the record.
- Team management approach: Preserve the submitted name and mascot; validate member IDs and store members as user references. 
- Leaderboard approach: Sum activity points by team, sort teams by total points descending, and assign 1-based ranks.
- Workout suggestions approach: Find the user by email, prioritize workouts matching their fitness goal or recent activity, include a reason, and return a 4xx response for an unknown user.

## Test plan

Record the commands you run and what each failure means.

- Data tier: `npm run test:data --prefix octofit-tracker/backend` — Initial run: 4 failed, 1 passed because required model validation was missing. Final run: **PASS (5 tests)**. Failures indicate a Mongoose schema or seed-data contract mismatch.
- API: `npm run test:api --prefix octofit-tracker/backend` — Initial run: 4 failed because the service behavior did not match the API contract. Final run: **PASS (4 tests)**. Failures indicate incorrect request validation, persistence, leaderboard calculations, or workout recommendations.
- Frontend: `npm test --prefix octofit-tracker/frontend` — Initial run: 15 failed because views and API response handling did not match the presentation contract. Final run: **PASS (15 tests)**. Failures indicate mismatched API calls or missing rendering, loading, empty, error, or accessible UI states.
- Backend build: `npm run build --prefix octofit-tracker/backend` — **PASS**. Failures indicate backend TypeScript type-check errors.
- Frontend build: `npm run build --prefix octofit-tracker/frontend` — **PASS**. Failures indicate frontend type-check or Vite production-build errors.
