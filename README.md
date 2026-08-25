<p align="center">
  <img src="icon.svg" alt="NextExplorer Logo" width="21%">
</p>

# NextExplorer on StartOS

> Everything not listed in this document should behave the same as upstream
> NextExplorer. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[NextExplorer](https://github.com/nxzai/NextExplorer) is a web file manager: browse, upload, preview and share files, with local accounts and per-user home folders. On StartOS its files, its database and its regenerable caches live on three separate volumes, the admin credential is owned by StartOS rather than by the application, non-admin accounts reach only the folders an admin assigns them, and the built-in terminal is disabled.

- **Upstream repo:** <https://github.com/nxzai/NextExplorer>
- **Wrapper repo:** <https://github.com/Start9-Community/nextexplorer-startos>

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
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

The upstream image is used unmodified, with its own entrypoint, and one subcontainer runs the service. A Node/Express backend serves the API and the prebuilt Vue SPA from a single port.

| Property      | Value                                                                 |
| ------------- | --------------------------------------------------------------------- |
| Image         | `nxzai/explorer`                                                      |
| Architectures | x86_64, aarch64                                                       |
| Entrypoint    | Upstream default                                                      |
| Runs as       | root, dropping to uid 1000                                            |
| Subcontainer  | `nextexplorer-sub` — the `primary` daemon, and the one to `attach` to |

The image declares no `USER` and its entrypoint must start as root: it calls `usermod`/`groupmod` to align the application user with `PUID`/`PGID` and then `gosu`s down to uid 1000. Running the container as a non-root user makes the entrypoint fail outright, so the package launches it as root and lets it drop privileges itself.

The same subcontainer also runs a `prepare-storage` oneshot, ahead of the daemon on every start — see [Installation and First-Run Flow](#installation-and-first-run-flow).

Only Docker Hub is a valid source for this image. A GHCR mirror exists but was never made public, and returns 401 rather than 404 — which is easy to misread as the artifact being missing.

### StartOS-managed environment variables

Seven are set, and each is applied on every start rather than only at install.

| Variable              | Why                                                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AUTH_ADMIN_EMAIL`    | Identifies the bootstrapped admin account — `admin@nextexplorer.local`                                                                            |
| `AUTH_ADMIN_PASSWORD` | The credential from the package store; upstream re-asserts it on every start, which is what makes it StartOS-owned                                |
| `SESSION_SECRET`      | Generated once at install and persisted; upstream's default is random per boot, which would sign every user out on restart                        |
| `TRUST_PROXY`         | `1`, because every request arrives through the OS reverse proxy — see [Network Access and Interfaces](#network-access-and-interfaces)             |
| `TERMINAL_ENABLED`    | Forced off — see [Limitations and Differences](#limitations-and-differences)                                                                      |
| `USER_VOLUMES`        | Forced on, so a non-admin account reaches only the folders an admin assigned it — see [Limitations and Differences](#limitations-and-differences) |
| `USER_DIR_ENABLED`    | Forced on, so each account's own space under `/mnt/_users` is reachable from the UI                                                               |

## Volume and Data Layout

Three volumes, split by durability.

| Volume   | Mount Point | Purpose                                              |
| -------- | ----------- | ---------------------------------------------------- |
| `data`   | `/mnt`      | The user's files                                     |
| `config` | `/config`   | The SQLite database, the package store, and branding |
| `cache`  | `/cache`    | Thumbnails and the session store                     |

`/mnt` is `VOLUME_ROOT`, and NextExplorer turns each of its immediate subdirectories into a top-level drive in the UI. An empty `/mnt` therefore presents the user with nothing to click, which is why the `prepare-storage` oneshot creates a `Files` directory inside it.

`/mnt/_users` is the exception: it is `USER_ROOT`, holding one private directory per account, and NextExplorer excludes the name from the drive listing and from the admin's folder picker.

`/cache` is a mounted volume rather than the container's writable layer so that thumbnail generation has somewhere durable to go without inflating the backup.

The application's database is `/config/app.db`.

## File Models

One model, and it holds only the two secrets the package owns.

| File           | Format | Modelled                | Written by                                 |
| -------------- | ------ | ----------------------- | ------------------------------------------ |
| `startos.json` | JSON   | Yes — `FileHelper.json` | Install, and the Set Admin Password action |

NextExplorer has no configuration file worth binding: it is configured entirely by environment variables, plus a JSON file and SQLite tables it manages itself.

**Yours, but only through the action:** `adminPassword`. It is written by Set Admin Password and read into `AUTH_ADMIN_PASSWORD` on every start, so it is the source of truth for that account rather than whatever NextExplorer has stored.

**Seeded once and then fixed:** `sessionSecret`, generated at install and never rewritten. It is what makes signed-in sessions survive a restart; if it ever went missing the package would refuse to start rather than let the application fall back to a per-boot random value and silently sign everyone out.

A hand edit to either key survives — nothing re-asserts them — and `main` holds the file with `.const()`, so writing it restarts the service and the new value reaches the container without any further step. That is what carries a rotated password through while the service is running; it is not a reason to edit the file by hand.

## Dependencies

None.

## Network Access and Interfaces

One interface. The API and the prebuilt SPA share it; with the terminal disabled the service opens no WebSocket at all.

| Interface | Id   | Type | Port | Description                    |
| --------- | ---- | ---- | ---- | ------------------------------ |
| Web UI    | `ui` | ui   | 3000 | The NextExplorer web interface |

The port is bound on the `main` MultiHost and is not masked.

Every request arrives through the OS reverse proxy, which strips whatever `X-Forwarded-For` the client sent and writes the real client address as the only hop. `TRUST_PROXY=1` is what makes NextExplorer read it: left unset, Express reports the proxy as the peer for every request, and the login rate limiter — ten attempts per fifteen minutes — collapses into one bucket shared by everyone on the server, logging a stack trace each time it fires.

`PUBLIC_URL` is deliberately left unset. Setting it pins CORS to one origin, and StartOS serves the same service over a LAN address and a `.onion` at once. Left unset, NextExplorer allows any origin and share links are built client-side from `window.location.origin`, so every address the user has published works.

The session cookie is `Secure` on every address, because the proxy reports `https` upstream whichever address the request arrived on. That is accurate for the LAN and domain addresses, where the OS terminates TLS; on a `.onion`, where it does not, the cookie still reaches the service from any browser that treats an onion as a trustworthy origin.

## Installation and First-Run Flow

There is no first-run screen. Install seeds the store and then asks you for the one value it cannot generate on your behalf:

1. The package store is created and `SESSION_SECRET` is generated into it.
2. A `critical` task is raised pointing at Set Admin Password.
3. Running that action writes the credential and clears the task.

`critical` blocks the service from starting, so NextExplorer never serves without an admin password. It also never starts with a partial one: if either secret is somehow absent, the package raises rather than passing an empty value through, because NextExplorer skips its admin bootstrap below six characters and would leave its setup wizard open to whoever reached it first.

On every start thereafter, the `prepare-storage` oneshot runs as root before the daemon: it creates `/mnt/Files` and hands `/mnt` to uid 1000. The image's own entrypoint chowns `/config` and `/cache` but never the storage root, and the resulting failure is a quiet one — browsing works and every write returns `EACCES` — so if uploads and folder creation fail while the UI is otherwise fine, that oneshot's log line is the first thing to read.

NextExplorer runs its own database migrations and creates the admin account before it binds the port, so by the time the health check passes the account already exists.

## Actions

One action, user-facing. Everything else NextExplorer administers from inside its own UI.

### Set Admin Password

Generates a new random password for the bootstrapped admin account. Run it when the install task prompts, and any time you need to rotate the credential.

- **What it changes:** `adminPassword` in the package store, which reaches the application as `AUTH_ADMIN_PASSWORD` on the next start.
- **Availability:** any status.
- **Cost:** seconds, then a restart.
- **Repeat safety:** safe to re-run; each run generates a fresh password and the previous one stops working once the service restarts.
- **Outputs:** the sign-in email and the new password, the password masked and copyable, shown once.

## Tasks

One task, raised at install, and it blocks the service until you clear it.

| Task               | Severity   | Raised when                       | Cleared when    |
| ------------------ | ---------- | --------------------------------- | --------------- |
| Set Admin Password | `critical` | The store holds no admin password | The action runs |

The condition is re-evaluated on every init, so the task returns if the password is ever removed from the store.

## Health Checks

One check, on the only daemon.

| Check     | Displayed       | Method                           |
| --------- | --------------- | -------------------------------- |
| `primary` | "Web Interface" | `GET /healthz` on the local port |

The auth middleware ignores every path outside `/api`, so the check needs no credentials. It passes as soon as the port answers — and that is a meaningful signal here rather than a bare liveness probe, because NextExplorer runs its database migrations and its admin bootstrap inside `await bootstrap()` _before_ `app.listen()`. Nothing answers on port 3000 until both have finished.

A failure therefore means the process is down or crash-looping, not that it is still initialising. On a first start the likeliest cause is that `prepare-storage` did not complete.

## Backups and Restore

`data` and `config` are copied wholesale — `sdk.Backups.ofVolumes('data', 'config')`. No dump step.

- **Included:** every file the user has stored, the SQLite database with its accounts and shares, the uploaded branding, and the package store — so the admin credential and the session secret.
- **Excluded:** `cache`. It holds thumbnails and the session store, both of which NextExplorer regenerates; restoring without it costs users a re-login and some thumbnail rework.
- **Restore:** complete. Accounts and passwords return as they were, so the install task does not reappear.

The database is SQLite and StartOS quiesces the service before syncing, so it is captured at rest rather than hot.

Note the size implication: `data` is the whole file tree, so the backup is as large as what the user has stored.

## Limitations and Differences

1. **The admin password is owned by StartOS, not by NextExplorer.** Upstream's bootstrap re-asserts `AUTH_ADMIN_PASSWORD` on every start rather than only on first run, so a password changed inside NextExplorer's own settings page is reverted on the next restart. Rotate it with the action instead. Accounts created inside NextExplorer are untouched.
2. **The built-in terminal is disabled.** Upstream ships `TERMINAL_ENABLED=true`, which gives any admin a shell inside the service container.
3. **A non-admin account reaches only the folders it was assigned.** With upstream's `USER_VOLUMES=false`, every authenticated account sees every drive under `VOLUME_ROOT` and can write to all of it; `USER_DIR_ENABLED=false` then leaves the per-account space unreachable from the UI. Neither flag is settable from inside NextExplorer, so both are forced on here: a new account starts with its own space alone, and the admin grants drives from the account's Volumes tab. Admins are exempt from both and still see everything.
4. **Only Docker Hub is a valid source for the image** — see [Image and Container Runtime](#image-and-container-runtime).
5. **No riscv64 build.** x86_64 and aarch64 only.

---

## Quick Reference for AI Consumers

```yaml
package_id: nextexplorer
image: nxzai/explorer
architectures:
  - x86_64
  - aarch64
subcontainers:
  - nextexplorer-sub # the running daemon, and the prepare-storage oneshot
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
  - TRUST_PROXY # "1"
  - TERMINAL_ENABLED # forced false
  - USER_VOLUMES # forced true
  - USER_DIR_ENABLED # forced true
dependencies: []
interfaces:
  ui: { type: ui, port: 3000 } # API and SPA on the same port
actions:
  - set-admin-password
tasks:
  - { action: set-admin-password, severity: critical }
health_checks:
  - primary # the daemon's ready check, displayed "Web Interface"
```
