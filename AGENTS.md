# Mongoose Voting - Agent Instructions

## Project Overview

Mongoose plugin that adds upvote/downvote functionality to any schema. Extends documents with nine instance methods for voting.

## Tech Stack

- **Runtime**: Node.js (>=20) & npm
- **Language**: TypeScript (v5+)
- **Module System**: Dual build (ESM + CommonJS)
  - `dist/esm`: ESM build
  - `dist/cjs`: CommonJS build
- **Database**: MongoDB (v7.0 via Docker for local dev)
- **Testing**: Jest (unit + integration, separate configs)
- **CI**: GitHub Actions (Node 20 + 22 matrix with MongoDB service)

## Build & Test

- **Build**: `npm run build` (generates both ESM and CJS in `dist/`)
- **Unit tests**: `npm run test:unit` (no database needed)
- **Integration tests**:
  1. `npm run test:integration:setup` (starts MongoDB via Docker)
  2. `npm run test:integration` (runs integration tests)
  3. `npm run test:integration:teardown` (stops MongoDB)
- **Watch mode**: `npm run test:watch`

## File Structure

- `src/index.ts` — Plugin source and type exports
- `src/index.test.ts` — Unit tests
- `tests/` — Integration tests (require MongoDB)
- `dist/` — Build artifacts (gitignored)
- `.docker/` — Docker Compose for local MongoDB
- `.github/workflows/` — CI configuration
- `examples/` — Example Express app

## Coding Conventions

- Methods are sync mutations — they modify the document in memory. Users call `save()` themselves.
- No callbacks — mongoose 9 is Promise-only.
- Plugin follows mongoose conventions: `(schema, opts?) => void`.
- Exported types: `VotingDocument`, `VotingMethods`, `VoterInput`, `VotingPaths`, `VotingOptions`.
