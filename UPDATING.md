# Updating the upstream version

## Determining the upstream version

**NextExplorer** — [nxzai/NextExplorer](https://github.com/nxzai/NextExplorer):

```sh
gh release view -R nxzai/NextExplorer --json tagName -q .tagName
```

Every release this project has published is flagged stable; there are no prereleases or drafts.

Confirm the tag exists on Docker Hub and carries both architectures before pinning it:

```sh
curl -fsSL "https://hub.docker.com/v2/repositories/nxzai/explorer/tags/<tag>" \
  | jq -r '.images[] | "\(.architecture) \(.os)"'
```

Expect `amd64 linux` and `arm64 linux`.

Two traps:

- **The Docker tag keeps the leading `v`.** Git `v2.2.7` is published as `v2.2.7`; the bare `2.2.7` does not exist.
- **Check Docker Hub, not GHCR.** `ghcr.io/nxzai/explorer` exists but its package visibility was never made public, so anonymous requests return **401**. That is not evidence the image is missing — the repository is simply private. Docker Hub is the canonical registry; the GHCR mirror was added alongside it in v2.0.3, never as a replacement.

## Applying the bump

Edit `startos/manifest/index.ts` and set `dockerVersion` to the new tag, then bump `version` and rewrite `releaseNotes` in `startos/versions/current.ts`.

Read the release notes for the range being crossed, and check `backend/src/config/env.js` for changes to the environment variables the package sets — `AUTH_ADMIN_EMAIL`, `AUTH_ADMIN_PASSWORD`, `SESSION_SECRET`, `TRUST_PROXY`, `TERMINAL_ENABLED`, `USER_VOLUMES`, `USER_DIR_ENABLED`. That file is the single source of truth for configuration; there are no CLI flags.
