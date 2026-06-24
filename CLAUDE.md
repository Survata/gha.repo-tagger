# CLAUDE.md

Guidance for Claude Code sessions working in this repository.

## What this is

A custom GitHub Action that creates date-based release tags (`YYYY.MMDD.BB`) and exports them as `DEPLOY_VERSION` for the build / deploy pipeline. Written in TypeScript, bundled to a single JS file with `@vercel/ncc`, and consumed by Upwave backend repos via `uses: Survata/gha.repo-tagger@v1`.

Not published to the GitHub Marketplace — any repo with an `action.yaml` at its root is usable as an action by reference (`owner/repo@ref`).

## Layout

- `src/` — TypeScript sources: `index.ts` (entry), `action.ts` (mode dispatch), `tagger.ts` (git operations), `tag.ts` (tag arithmetic), `actionArgs.ts`, `util.ts`, and `*.test.ts`.
- `bin/index.js` — **committed build artifact**. This is what GitHub Actions executes. Regenerate with `yarn package` after any source or production-dependency change. Never hand-edit.
- `action.yaml` — action manifest. `using: node20` must match `.nvmrc`.
- `.nvmrc` — pins Node 20. `nvm use` to activate.

## Build & test

```
yarn install
yarn test       # tsc + jest
yarn lint
yarn package    # tsc + ncc -> bin/index.js
```

`yarn package` is required before committing any source change — the bundle is what runs, not the TS sources.

## Critical conventions

- **All git work shells out to the `git` CLI** (`child_process.execSync` in `src/tagger.ts`), not the GitHub API. The action does not use `@actions/github` / Octokit. The consuming workflow must check out the repo with its tags and have push permission for `mode: tag`.
- **Tag dates are read in the runner's local timezone** (`tag.ts` uses `Date#getFullYear/getMonth/getDate`). GitHub runners are UTC. The dated cases in `tag.test.ts` assume a UTC-or-behind timezone and fail on a developer machine east of UTC — run `TZ=UTC yarn test` to reproduce CI.
- **`mode` is case-insensitive** (`NewActionMode` upper-cases the input); an unknown mode resolves to `undefined`, which is reported but not fatal.

## Continuous integration

`.github/workflows/checkCommit.yaml` runs on every push to a non-`master` branch: `yarn install --frozen-lockfile`, `yarn lint`, `yarn test`, `yarn package`. Keep all four green.

## Publishing

See [README.md](README.md). Key thing: all consumers pin `@v1`, so moving the `v1` tag rolls everyone in one shot. Merging to `master` is **not** a rollout — nothing is live until `v1` moves, and a dependency bump is not shipped until `bin/index.js` is rebuilt and `v1` is moved.
