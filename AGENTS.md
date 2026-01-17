# Mongoose Voting - Agent Instructions

## Project Overview
This is a Mongoose plugin that adds voting functionality (upvote/downvote) to any schema.

## Tech Stack
- **Runtime**: Node.js (>=20) & npm.
- **Language**: TypeScript (v5+).
- **Module System**: Dual Build (ESM + CommonJS).
    - Root defaults to CommonJS.
    - `dist/esm`: ESM build (marked with `package.json`).
    - `dist/cjs`: CommonJS build.
- **Database**: MongoDB (v7.0 via Docker).
- **Testing**: Jest (Unit & Integration).

## Build & Run
- **Build**: `npm run build` (Generates both ESM and CJS).
- **Unit Tests**: `npm run test:unit` (Runs isolated logic tests).
- **Integration Tests**: `npm run test:integration` (Requires MongoDB).
    - Docker: `pretest:integration` spins up `mongo:7.0` using `.docker/compose.test.yaml`.

## Coding Conventions
- **Exports**: Use named exports.
- **Types**: Explicitly define types for Mongoose schemas and methods.
- **Async/Await**: Prefer over callbacks where possible (though the library supports callbacks for legacy reasons).

## File Structure
- `src/`: Source code.
- `tests/`: Integration tests.
- `dist/`: Build artifacts (ignored).
- `.docker/`: Docker Compose configuration.
- `tsconfig.build.json`: Main build configuration.
