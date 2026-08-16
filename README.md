<p align="center">
  <img src="icon.svg" alt="NextExplorer Logo" width="21%">
</p>

# NextExplorer on StartOS

> Everything not listed in this document should behave the same as upstream
> NextExplorer. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

NextExplorer is a self-hosted web file manager: browse, upload, preview and share files from directories mounted into the container, with local accounts and per-user home folders. Upstream: <https://github.com/nxzai/NextExplorer>.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

One prebuilt upstream image, run in a single subcontainer named `nextexplorer-sub`. A Node/Express backend serves both the API and the prebuilt Vue SPA from one port.

| | |
| --- | --- |
| Image id | `nextexplorer` |
| Upstream image | `nxzai/explorer` |
| Architectures | `x86_64`, `aarch64` |
| Subcontainer | `nextexplorer-sub` |
| Runs as | root entrypoint, dropping to uid 1000 |

The image declares no `USER`, and its entrypoint must run as root: it calls `usermod`/`groupmod` to align the app user with `PUID`/`PGID` and then `gosu`s down to uid 1000. Running the container as a non-root user makes the entrypoint fail outright. The package therefore launches `sdk.useEntrypoint()` as root and lets it drop privileges itself.

Note that the upstream image is published to Docker Hub only. A GHCR mirror exists but was never made public — it returns 401 rather than 404, which is easy to misread as "the artifact is missing".

### StartOS-managed environment variables

| Variable | Why |
| --- | --- |
| `AUTH_ADMIN_EMAIL` | Identifies the bootstrapped admin account |
| `AUTH_ADMIN_PASSWORD` | Applied from the package store on every start |
| `SESSION_SECRET` | Generated once at install and persisted; the upstream default is random per boot, which would sign every user out on restart |
| `TERMINAL_ENABLED` | Forced off — see Limitations |

## Volume and Data Layout

Three volumes, split by durability.

| Volume | Mount | Contents |
| --- | --- | --- |
| `data` | `/mnt` | The user's files |
| `config` | `/config` | SQLite database, package store, uploaded branding |
| `cache` | `/cache` | Thumbnails and the session store |

`/mnt` is `VOLUME_ROOT`, and NextExplorer turns each of its immediate subdirectories into a top-level drive in the UI. An empty `/mnt` therefore presents the user with nothing to click, so the `prepare-storage` oneshot creates a `Files` directory inside it.

`/cache` is mounted rather than left on the container's writable layer so that thumbnail generation has somewhere durable to go without inflating the backup.

## File Models

One model, `startos/fileModels/store.json.ts`, bound to `/config/startos.json`.

NextExplorer has no config file worth binding — it is configured entirely by environment variables, plus a JSON file and SQLite tables it manages itself. The store therefore holds only the two secrets the package owns: `adminPassword` and `sessionSecret`.

## Dependencies

None.

## Network Access and Interfaces

A single HTTP interface. API, SPA and the WebSocket endpoint all share one port.

| Interface | Type | Port |
| --- | --- | --- |
| `ui` | ui | 3000 |

`PUBLIC_URL` is deliberately left unset. Setting it would pin CORS to one origin, and StartOS serves the same service over both a LAN address and a `.onion`. Left unset, NextExplorer allows any origin, share links are built client-side from `window.location.origin`, and the session cookie's `secure` flag adapts per request — so both addresses work.

## Installation and First-Run Flow

On install the package seeds the store, generating `SESSION_SECRET`, and raises a critical task to set the admin password. Because the task is critical, the service cannot start until it is done.

Running **Set Admin Password** writes the credential to the store and clears the task. NextExplorer's own bootstrap then creates the admin account before the HTTP server binds, so a 200 from the health check means the account already exists. `main.ts` reads the store with `.const(effects)`, so rotating the password restarts the service and takes effect immediately.

## Actions

One, because NextExplorer administers everything else from inside its own UI.

| Action | When to run | Effect |
| --- | --- | --- |
| `set-admin-password` | At install, or to rotate the credential | Generates a new random password and stores it. Repeat-safe. Applied on the next start. |

## Tasks

| Task | Severity | Raised when |
| --- | --- | --- |
| `set-admin-password` | critical | The store has no admin password |

## Health Checks

The `primary` daemon's `ready` check requests `GET /healthz` and expects 200.

The endpoint is mounted before any auth middleware, and the app runs its database migrations and admin bootstrap inside `await bootstrap()` *before* `app.listen()`. A 200 therefore means initialised and serving, not merely "process started".

## Backups and Restore

`data` and `config` are backed up by direct volume sync. `cache` is excluded: it holds only thumbnails and the session store, both of which NextExplorer regenerates — restoring without it costs users a re-login and some thumbnail rework.

The database at `/config/app.db` is SQLite. StartOS quiesces the service before syncing, so it is captured at rest rather than hot.

## Limitations and Differences

- **The built-in terminal is disabled.** Upstream ships `TERMINAL_ENABLED=true`, which gives any admin a shell inside the service container. That is not a file-management feature and it widens the blast radius of a compromised admin session, so the package forces it off.
- **The admin password is owned by StartOS, not by NextExplorer.** `AUTH_ADMIN_PASSWORD` is re-applied on every start, and upstream's bootstrap re-asserts it unconditionally rather than only on first run. Changing the admin password inside NextExplorer's own UI will therefore be reverted on the next restart — rotate it with the action instead. This applies only to the bootstrapped admin account; passwords for accounts created inside NextExplorer are untouched.
- **Only Docker Hub is a valid source for the image.** See Image and Container Runtime.

## Troubleshooting

**Uploads and folder creation fail with `EACCES`, but browsing works.** The storage root is not owned by uid 1000. The image's entrypoint chowns `/config` and `/cache` but never `/mnt`, which is why the `prepare-storage` oneshot exists; if it was skipped or failed, its log line will say so.

**Everyone is signed out after a restart.** `SESSION_SECRET` did not reach the container, so NextExplorer generated a random one at boot. Check that `/config/startos.json` contains `sessionSecret`.

**A password set inside NextExplorer stopped working.** Expected for the admin account — see Limitations.

To inspect the running container: `start-cli package attach nextexplorer -n nextexplorer-sub -- <cmd>`.

## Contributing

Build and development workflow follow the StartOS packaging guide: <https://docs.start9.com/packaging>. Keep `README.md`, `instructions.md`, and `AGENTS.md` in sync with any change to user-visible behavior or package structure.

---

## Quick Reference for AI Consumers

```yaml
package_id: nextexplorer
image: nxzai/explorer
architectures: [x86_64, aarch64]
subcontainers: [nextexplorer-sub]
volumes:
  data: /mnt
  config: /config
  cache: /cache
file_models:
  - /config/startos.json
startos_managed_env_vars:
  - AUTH_ADMIN_EMAIL
  - AUTH_ADMIN_PASSWORD
  - SESSION_SECRET
  - TERMINAL_ENABLED
dependencies: none
interfaces:
  ui: { type: ui, port: 3000 }
actions:
  - set-admin-password
tasks:
  - { action: set-admin-password, severity: critical }
health_checks:
  - primary
```
