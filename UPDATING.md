# Updating the upstream version

## Determining the upstream version

**NextExplorer** — [nxzai/NextExplorer](https://github.com/nxzai/NextExplorer):

```sh
gh api repos/nxzai/NextExplorer/tags --paginate --jq '.[].name'
gh api repos/nxzai/NextExplorer/releases --paginate \
  --jq '.[] | {tag_name, prerelease, draft}'
```

Choose the newest stable release with a published image. Do not trust the Latest badge: v4.0.0 was published as a prerelease.

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

Edit `startos/manifest/index.ts` and set the `IMAGE` build arg to `nxzai/explorer:<new tag>`, then bump `version` and rewrite `releaseNotes` in `startos/versions/current.ts`. While the root `Dockerfile` exists, keep it unless the new image's `NODE_VERSION` is 24.22.1 or later; if it is, delete it and put `source: { dockerTag: '<new image>' }` back.

Scale scrutiny to the jump as the packaging guide describes. For feature or breaking releases, read the release notes for the range being crossed, and check `backend/src/config/env.js` for changes to the environment variables the package sets — `AUTH_ADMIN_EMAIL`, `AUTH_ADMIN_PASSWORD`, `SESSION_SECRET`, `TRUST_PROXY`, `TERMINAL_ENABLED`, `USER_VOLUMES`, `USER_DIR_ENABLED`. That file is the single source of truth for configuration; there are no CLI flags.

For breaking releases, also check `backend/src/app.js`, `backend/src/routes/health.js`, and `backend/src/server.js` for the `/healthz` probe and bootstrap ordering, `docker/entrypoint.sh` for ownership handling, and `backend/src/services/db.js` for upstream-managed database migrations. Search and folder-size indexes live in `/cache/index.db`; accounts, settings, trash metadata, and version metadata remain in `/config/app.db`. Trash and version payloads live in reserved `.nextexplorer` folders on the data volume.
