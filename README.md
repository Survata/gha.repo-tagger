# gha.repo-tagger

A GitHub Action that creates date-based release tags. Used across Upwave's backend repos to stamp a `DEPLOY_VERSION` for the build / deploy pipeline.

Tags use the format `YYYY.MMDD.BB` — date plus a zero-padded build number that increments for multiple builds on the same day (e.g. `2026.0624.01`, `2026.0624.02`).

## Usage

```yaml
- name: Tag
  uses: Survata/gha.repo-tagger@v1
  with:
    mode: TAG
```

The action exports the resulting tag as the `DEPLOY_VERSION` environment variable for later steps in the same job:

```yaml
- name: Use the version
  run: echo "Deploying $DEPLOY_VERSION"
```

### Inputs

| Input  | Required | Description                        |
|--------|----------|------------------------------------|
| `mode` | yes      | `tag` or `list` (case-insensitive) |

### Modes

- **`tag`** — computes the next tag from the most recent existing tag, runs `git tag <next>` and `git push origin <next>`, and exports `DEPLOY_VERSION=<next>`.
- **`list`** — read-only; looks up the most recent existing tag and exports `DEPLOY_VERSION=<prior>` without creating anything.

All git operations shell out to the `git` CLI in the checked-out workspace, so the workflow must check out the repo (with its tags) and have push permission before invoking `mode: tag`.

## Development

Requires Node 24 (see `.nvmrc`).

```bash
nvm use
yarn install
yarn test       # tsc + jest
yarn lint
yarn package    # rebuilds bin/index.js
```

> The dated cases in `tag.test.ts` read the date in the runner's local timezone and assume UTC-or-behind (as on GitHub runners). On a machine east of UTC they fail; run `TZ=UTC yarn test` to reproduce CI.

### The committed bundle — how to update the binary

The action runs `bin/index.js`, a single-file bundle produced from the TypeScript sources by [`@vercel/ncc`](https://github.com/vercel/ncc). **`bin/index.js` is committed and is what GitHub Actions actually executes — not the `src/` TypeScript, and not `package.json` / `yarn.lock`.**

After **any** change that affects runtime behaviour — a source edit or a production-dependency bump — regenerate and commit the bundle:

```bash
yarn install
yarn lint
yarn test
yarn package                 # tsc -> dist/, then ncc -> bin/index.js
git add src/ bin/index.js package.json yarn.lock
git commit -m "..."
```

If you skip `yarn package`, consumers keep running the old code baked into `bin/index.js` even though the source and lockfile look updated.

> Reviewing the `bin/index.js` diff by eye is not useful — it's a large generated bundle. Trust the source diff and the tests.

## Publishing a new version

All consumers reference `Survata/gha.repo-tagger@v1`. `v1` is a **floating tag** — moving it rolls every consumer onto the new version on their next workflow run. **Merging to `master` does not roll anyone out; nothing is live until the `v1` tag is moved.**

After your change is merged to `master`:

1. Make sure the merged commit contains a freshly built `bin/index.js` (see [how to update the binary](#the-committed-bundle--how-to-update-the-binary)).

2. Move the `v1` tag to the merged commit and force-push it:

   ```bash
   git checkout master
   git pull
   git tag -f v1            # or: git tag -f v1 <sha>
   git push origin v1 --force
   ```

   Every consumer repo (currently ~33 references across the org) picks up the change on its next run. No consumer-side change is required.

3. Optional — cut an immutable version tag for traceability:

   ```bash
   git tag v1.1.0 <sha>
   git push origin v1.1.0
   ```

### Dependency updates

**GitHub Actions (Dependabot).** [`.github/dependabot.yml`](.github/dependabot.yml) monitors the SHA-pinned actions in `.github/workflows` monthly, grouped into a single PR. Such a PR only bumps a pinned action ref (its SHA and version comment); it does **not** touch `bin/index.js` and does **not** require moving `v1` — merge it like any other CI change.

**npm dependencies (manual).** The bundle's npm dependencies are not tracked by Dependabot version updates here — bump them by hand. Because the shipped artifact is the committed `bin/index.js`, a dependency bump only reaches consumers once the bundle is rebuilt and `v1` is moved:

```bash
yarn install && yarn lint && yarn test && yarn package
git add package.json yarn.lock bin/index.js
git commit -m "Rebuild bundle after dependency update"
```

Then follow [Publishing a new version](#publishing-a-new-version) to move `v1`.
