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

## Setup & Development (current progress)

This is being built frontend-first against a mocked API layer. The client is fully functional
against a large generated in-memory dataset; the real Node/Express API, SQLite persistence, and
Docker setup described above have not been started yet.

### Prerequisites

- Node.js 20+ (an LTS release, e.g. 22 or 24, is recommended)
- Yarn, via Corepack: `corepack enable`

### Install

From the repo root:

```bash
yarn install
```

### Run the client

```bash
yarn workspace presight-client start
```

Starts the Vite dev server and prints the local URL (e.g. `http://localhost:5173`).

### Regenerate the mock dataset

The client ships with a pre-generated, seeded dataset at `client/src/mock/data/users.json`
(5,000 users across 40 nationalities and 40 hobbies). To regenerate it:

```bash
yarn workspace presight-client generate:mock
```

### Run tests

```bash
yarn workspace presight-client test
```

Runs the `queryEngine` unit tests (filtering, sorting, pagination, and facet-count logic).

### What's implemented

- React + TypeScript + Tailwind v4 client (Vite).
- Virtualized, infinitely-scrolling user list (`@tanstack/react-virtual` + `@tanstack/react-query`).
- Text search, hobby/nationality filters, and sort field/direction — all synced to the URL query
  string, so reloading or sharing a URL restores the same view.
- Top-20 hobby/nationality facet counts, computed for the active search/filter state and
  excluding each facet's own dimension (e.g. hobby counts ignore the current hobby selection).
- Loading, empty, and error states, including matching skeleton placeholders.
- A mocked API layer (`client/src/api/`) shaped like a real REST API, backed for now by an
  in-memory query engine over the generated dataset — the intent is that swapping in the real
  backend later requires no changes to any caller.

### Not yet implemented

- The real Node/Express API server and SQLite persistence.
- Docker / `docker-compose` setup.
