# Presight Frontend Exercise

Build a small full-stack user directory application. The goal is to evaluate how you design a searchable, filterable, paginated UI backed by persisted data and clear API boundaries.

The application should include:

- A React client.
- A Node.js API server.
- A SQLite database used as the source of truth for user data.
- Docker configuration for running the application locally.

## Scenario

Users need to browse a large directory of people, search by name, and narrow results by nationality and hobbies. The filter sidebar should help users discover useful filters based on the result set they are currently viewing.

## Requirements

### Data Model

Seed a SQLite database with enough records to make pagination, infinite scroll, search, and filter counts meaningful.

Each user should have:

- `avatar`
- `first_name`
- `last_name`
- `age`
- `nationality`
- `hobbies`, from 0 to 10 hobbies per user

Choose a data model that supports the required behavior.

SQLite must be the persisted source of user data.

### API

Expose an API that supports:

- Paginated user results.
- Text filtering from user input across `first_name` and `last_name`.
- Filtering by one or more nationalities.
- Filtering by one or more hobbies.
- Sorting by `first_name`, `last_name`, `age`, and `nationality`.
- Pagination metadata so the client can determine whether more results are available.
- Top 20 hobbies for the active text filter and filter state, including `{ value, count }`.
- Top 20 nationalities for the active text filter and filter state, including `{ value, count }`.

The top 20 values and counts must reflect the currently applied text filter and selected filters, not the global dataset.

Filter semantics:

- Multiple selected hobbies should match users who have all selected hobbies.
- Multiple selected nationalities should match users from any selected nationality.
- Text, hobby, and nationality filters should apply together.

Sorting semantics:

- Sorted results must be deterministic. Use `id` as a final tie-breaker when values are equal.
- Pagination must respect the active sort without duplicate or missing users.

### Client

Build a React interface that includes:

- A text filter input for `first_name` and `last_name`.
- A virtualized, infinitely scrolling list of user cards.
- A sidebar containing the top 20 hobbies and top 20 nationalities for the current result set, including counts.
- Controls for applying and removing hobby and nationality filters.
- Controls for choosing sort field and sort direction.
- Loading, empty, and error states.
- A responsive layout that remains usable on desktop and mobile.

User cards should follow this structure:

```text
|----------------------------------|
| avatar      first_name+last_name |
|             nationality      age |
|                                  |
|             (2 hobbies) (+n)     |
|----------------------------------|
```

Show up to 2 hobbies on the card. If the user has more hobbies, display the remaining count as `+n`.

Use a virtual scroll implementation for the list.

When the text filter or selected filters change, the client must refresh both:

- The paginated user list.
- The top 20 hobbies and nationalities in the sidebar.

The text filter value, selected hobbies, selected nationalities, sort field, and sort direction must be reflected in the URL query string. Reloading or sharing the URL should restore the same view state.

## Implementation Notes

- Keep the database setup easy to run locally.
- Include seed logic or a documented command that creates the SQLite database.
- Include a `Dockerfile` and `docker-compose.yml` that can run the application locally.

## Evaluation Focus

We will pay particular attention to:

- Correct data persistence and API behavior.
- Correct filtering, sorting, pagination, and top 20 counts.
- Smooth infinite scrolling with virtualization.
- URL-synced state.
- Clear loading, empty, and error states.
- Easy local and Docker-based setup.

## Deliverables

Please provide:

- Source code for the React client and Node.js server.
- A `Dockerfile` and `docker-compose.yml`.
- Instructions for setup, database seeding, and running locally.
- Instructions for running with Docker Compose.

---

## Setup & Development

### Prerequisites

- Node.js 22+ (required by `better-sqlite3`)
- Yarn, via Corepack: `corepack enable`
- Docker Desktop, if running via Docker Compose

### Install (client + server)

From the repo root:

```bash
yarn install
```

### Configuration (optional)

Both workspaces run with working defaults and need no configuration. To override them, copy the
example env file in each workspace and edit as needed:

```bash
cp server/.env.example server/.env   # PORT, DATABASE_PATH
cp client/.env.example client/.env   # VITE_API_BASE_URL
```

### Run the server

```bash
yarn workspace presight-server seed   # creates and seeds server/data/app.db (5,000 users)
yarn workspace presight-server dev    # starts the API on http://localhost:3001
```

`seed` only needs to be run once — it creates the schema and seeds `server/data/app.db`. It's
safe to re-run any time you want to reset the dataset back to its original seeded state.

`dev` stays running in the foreground — keep it in its own terminal.

### Run the client

In a **second terminal**:

```bash
yarn workspace presight-client start
```

Starts the Vite dev server (e.g. `http://localhost:5173`), calling the API at
`http://localhost:3001` by default. Override with a `VITE_API_BASE_URL` env var if the API runs
elsewhere. This also stays running in the foreground.

### Run tests

```bash
yarn workspace presight-client test   # hooks + component tests (React Testing Library)
yarn workspace presight-server test   # filter/sort/pagination/facet semantics, against real SQLite
```

## Running with Docker Compose

From the repo root, with Docker Desktop running:

```bash
docker compose up --build
```

This builds and starts two containers:

- **server** — the API on `http://localhost:3001`. On first start, it automatically seeds a
  fresh SQLite database (baked into the image at build time) into a named Docker volume
  (`sqlite-data`), so no manual seed step is needed. Subsequent restarts reuse the same
  persisted data.
- **client** — the built React app, served by nginx on `http://localhost:8080`.

To stop: `docker compose down` (add `-v` to also delete the persisted database volume and start
fresh next time).

If port `3001` or `8080` is already in use on your machine, change the host-side port in
`docker-compose.yml` (the left number in `"HOST:CONTAINER"`) — and if you change the server's
port, also update the `VITE_API_BASE_URL` build arg for `client` to match, since the browser
calls that URL directly and it's baked into the client bundle at build time.

## What's implemented

- **Client**: React + TypeScript + Tailwind v4 (Vite). Virtualized, infinitely-scrolling user
  list (`@tanstack/react-virtual` + `@tanstack/react-query`). Text search, hobby/nationality
  filters, and sort field/direction — all synced to the URL query string, so reloading or
  sharing a URL restores the same view. Loading, empty, and error states with matching skeleton
  placeholders. Tested with Vitest + React Testing Library (URL-sync hook, debounce hook, and
  card rendering, including the avatar-load-failure fallback).
- **Server**: Node/Express + `better-sqlite3`, fully normalized schema (`users`, `nationalities`,
  `hobbies`, `user_hobbies`). Hobby filters use relational division (match-all semantics);
  nationality filters use OR semantics. Top-20 hobby/nationality facet counts are computed for
  the active search/filter state, each excluding its own dimension's filter. Deterministic
  sorting with an `id` tie-breaker; offset-based pagination with correct `hasMore`/`total`
  metadata. Validated with `zod`; 21 tests covering the same filter/sort/pagination/facet
  semantics as the client, run against a real seeded SQLite database.
- **Docker**: multi-stage builds for both images; the server's database is seeded once at build
  time (not at runtime, so `@faker-js/faker` never ships in the production image) and installed
  into a persistent volume on first container start.
