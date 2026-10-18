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

- Presentation tier decision: Replace the placeholder views with API-backed activity, team, leaderboard, and workout screens, including loading, empty, and error states. Run npm test --prefix octofit-tracker/frontend.
- Logic tier decision: Implement and validate the API services: activities, teams, leaderboard, then workout suggestions. Run npm run test:api --prefix octofit-tracker/backend until it passes.
- Data tier decision: Add required Mongoose validation for users, teams, activities, and workouts. Run npm run test:data --prefix octofit-tracker/backend; preserve the seed behavior that already passes.
- Activity tracking approach: List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`.
- Team management approach: List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`.
- Leaderboard approach: Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`.
- Workout suggestions approach: Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`).

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend`

Result: 

"
> test:data
> vitest run tests/data.contract.test.ts


 RUN  v2.1.9 /workspaces/skills-build-applications-w-copilot-agent-mode/octofit-tracker/backend

 ❯ tests/data.contract.test.ts (5) 700ms
   ❯ OctoFit data contract (5) 700ms
     × requires meaningful user identity and goals
     × requires teams to have a name, mascot, and members array
     × requires activities to connect users, teams, types, minutes, points, and dates
     × defines workout suggestions with focus, duration, and difficulty
     ✓ seeds representative data for all four capabilities idempotently 681ms

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/data.contract.test.ts > OctoFit data contract > requires meaningful user identity and goals
AssertionError: expected undefined to be defined
 ❯ tests/data.contract.test.ts:11:32
      9|     const user = new User({});
     10|     const error = user.validateSync();
     11|     expect(error?.errors.name).toBeDefined();
       |                                ^
     12|     expect(error?.errors.email).toBeDefined();
     13|     expect(error?.errors.fitnessGoal).toBeDefined();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  tests/data.contract.test.ts > OctoFit data contract > requires teams tohave a name, mascot, and members array
AssertionError: expected undefined to be defined
 ❯ tests/data.contract.test.ts:25:34
     23|     expect(withMember.members.map((member) => member.toString())).toE…
     24|     const missing = new Team({}).validateSync();
     25|     expect(missing?.errors.name).toBeDefined();
       |                                  ^
     26|     expect(missing?.errors.mascot).toBeDefined();
     27|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  tests/data.contract.test.ts > OctoFit data contract > requires activities to connect users, teams, types, minutes, points, and dates
AssertionError: expected undefined to be defined
 ❯ tests/data.contract.test.ts:31:32
     29|     const activity = new Activity({});
     30|     const error = activity.validateSync();
     31|     expect(error?.errors.type).toBeDefined();
       |                                ^
     32|     expect(error?.errors.user).toBeDefined();
     33|     expect(error?.errors.team).toBeDefined();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  tests/data.contract.test.ts > OctoFit data contract > defines workout suggestions with focus, duration, and difficulty
AssertionError: expected undefined to be defined
 ❯ tests/data.contract.test.ts:41:33
     39|     const workout = new Workout({ title: 'Intervals' });
     40|     const error = workout.validateSync();
     41|     expect(error?.errors.focus).toBeDefined();
       |                                 ^
     42|     expect(error?.errors.minutes).toBeDefined();
     43|     expect(error?.errors.difficulty).toBeDefined();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯

 Test Files  1 failed (1)
      Tests  4 failed | 1 passed (5)
   Start at  21:33:38
   Duration  1.39s (transform 132ms, setup 0ms, collect 439ms, tests 700ms, environment 0ms, prepare 72ms)

- API command: `npm run test:api --prefix octofit-tracker/backend`

Results: 

"
> test:api
> vitest run tests/api.contract.test.ts


 RUN  v2.1.9 /workspaces/skills-build-applications-w-copilot-agent-mode/octofit-tracker/backend

 ❯ tests/api.contract.test.ts (4) 623ms
   ❯ OctoFit API contract (4)
     × creates and lists valid activities while rejecting invalid input
     × creates teams and exposes members
     × orders leaderboard entries by total points
     × suggests workouts that match each user activity pattern

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/api.contract.test.ts > OctoFit API contract > creates and lists valid activities while rejecting invalid input
AssertionError: expected 501 to be 400 // Object.is equality

- Expected
+ Received

- 400
+ 501

 ❯ tests/api.contract.test.ts:34:28


⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  tests/api.contract.test.ts > OctoFit API contract > creates teams and exposes members
AssertionError: expected 501 to be 400 // Object.is equality

- Expected
+ Received

- 400
+ 501

 ❯ tests/api.contract.test.ts:57:28
     55|     const member = await User.create({ name: 'Mona', email: 'mona@exa…
     56|     const invalid = await request(app).post('/api/teams').send({ masc…
     57|     expect(invalid.status).toBe(400);
       |                            ^
     58|     const created = await request(app).post('/api/teams').send({ name…
     59|     expect(created.status).toBe(201);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  tests/api.contract.test.ts > OctoFit API contract > orders leaderboard entries by total points
AssertionError: expected [] to deeply equal [ Array(2) ]

- Expected
+ Received

- Array [
-   Object {
-     "rank": 1,
-     "teamName": "Robocats",
-     "totalPoints": 35,
-   },
-   Object {
-     "rank": 2,
-     "teamName": "Octocats",
-     "totalPoints": 25,
-   },
- ]
+ Array []

 ❯ tests/api.contract.test.ts:76:172
     74|     const response = await request(app).get('/api/leaderboard');
     75|     expect(response.status).toBe(200);
     76|     expect(response.body.leaderboard.map(({ teamName, totalPoints, ra…
       |                      ^
     77|       { teamName: 'Robocats', totalPoints: 35, rank: 1 },
     78|       { teamName: 'Octocats', totalPoints: 25, rank: 2 },

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  tests/api.contract.test.ts > OctoFit API contract > suggests workouts that match each user activity pattern
AssertionError: expected { …(6) } to match object { title: 'Intervals', …(2) }
(4 matching properties omitted from actual)

- Expected
+ Received

  Object {
    "focus": "endurance",
-   "reason": StringMatching /run|endurance|activity/i,
    "title": "Intervals",
  }

 ❯ tests/api.contract.test.ts:96:46
     94|     const monaResponse = await request(app).get('/api/workouts/sugges…
     95|     expect(monaResponse.status).toBe(200);
     96|     expect(monaResponse.body.suggestions[0]).toMatchObject({ title: '…
       |                                              ^
     97| 
     98|     const hubotResponse = await request(app).get('/api/workouts/sugge…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯

 Test Files  1 failed (1)
      Tests  4 failed (4)
   Start at  21:34:30
   Duration  1.37s (transform 92ms, setup 0ms, collect 489ms, tests 623ms, environment 0ms, prepare 69ms)"

- Frontend command: `npm test --prefix octofit-tracker/frontend`

Results: 

" Test Files  1 failed (1)
      Tests  15 failed (15)
   Start at  21:35:01
   Duration  12.46s (transform 82ms, setup 0ms, collect 284ms, tests 11.31s, environment 552ms, prepare 80ms)"

- Backend build command: `npm run build --prefix octofit-tracker/backend`

Results:

" 
> build
> tsc --noEmit
"
- Frontend build command: `npm run build --prefix octofit-tracker/frontend`

Results:

"> tsc --noEmit && vite build

vite v6.4.4 building for production...
✓ 46 modules transformed.
dist/index.html                   0.36 kB │ gzip:  0.27 kB
dist/assets/index-BL5QWnkG.css  231.14 kB │ gzip: 30.69 kB
dist/assets/index-CHHcG4Gz.js   264.34 kB │ gzip: 83.85 kB
✓ built in 2.90s"