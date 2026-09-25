<p align="center">
  <img src="icon.svg" alt="NextExplorer Logo" width="21%">
</p>

# NextExplorer on StartOS

> Everything not listed in this document should behave the same as upstream
> NextExplorer. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[NextExplorer](https://github.com/nxzai/NextExplorer) is a web file manager: browse, upload, preview and share files, with local accounts and per-user home folders. On StartOS its files, its database and its regenerable caches live on three separate volumes, the admin credential is owned by StartOS rather than by the application, non-admin accounts reach only the folders an admin assigns them, and the built-in terminal is disabled. Locations can be added, renamed and removed with actions, and files kept in File Browser or FileBrowser Quantum can be imported into a location of their own.

- **Upstream repo:** <https://github.com/nxzai/NextExplorer>
- **Wrapper repo:** <https://github.com/Start9Labs/nextexplorer-startos>

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

`/mnt` is `VOLUME_ROOT`, and NextExplorer lists each of its immediate subdirectories under **Locations** in the UI (upstream's docs and API call them volumes). An empty `/mnt` therefore presents the user with nothing to click, which is why the `prepare-storage` oneshot creates a `Files` directory inside it whenever it holds no location.

`/mnt/_users` is the exception: it is `USER_ROOT`, holding one private directory per account, and NextExplorer excludes the name from the Locations list and from the admin's folder picker.

`/mnt/FileBrowser` exists only after [Import Files from File Browser](#import-files-from-file-browser) has run; it is an ordinary location: rename or remove it with the [Locations](#locations-add-rename-remove) actions, or move its contents into `Files` from the UI.

Other packages mount the `data` volume by name (Jellyfin, Immich, Nextcloud, qBittorrent and others read or write under it), so the volume id is load-bearing.

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

One, optional, and never declared as a current dependency: nothing about NextExplorer's own operation needs File Browser.

| Dependency    | Kind | Used by                                                                                           |
| ------------- | ---- | ------------------------------------------------------------------------------------------------- |
| `filebrowser` | —    | [Import Files from File Browser](#import-files-from-file-browser), which mounts its `data` volume |

The manifest entry exists so the import action can mount the volume with a typed `mountDependency`. Either flavor under the `filebrowser` id, File Browser or FileBrowser Quantum, satisfies it, since both keep their files at the root of the same `data` volume.

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
3. If a package with the id `filebrowser` is installed, an `important` task is raised pointing at Import Files from File Browser.
4. Running Set Admin Password writes the credential and clears its task.

`critical` blocks the service from starting, so NextExplorer never serves without an admin password. It also never starts with a partial one: if either secret is somehow absent, the package raises rather than passing an empty value through, because NextExplorer skips its admin bootstrap below six characters and would leave its setup wizard open to whoever reached it first.

On every start thereafter, the `prepare-storage` oneshot runs as root before the daemon: it creates `/mnt/Files` if `/mnt` holds no location, and hands `/mnt` to uid 1000. The image's own entrypoint chowns `/config` and `/cache` but never the storage root, and the resulting failure is a quiet one — browsing works and every write returns `EACCES` — so if uploads and folder creation fail while the UI is otherwise fine, that oneshot's log line is the first thing to read.

NextExplorer runs its own database migrations and creates the admin account before it binds the port, so by the time the health check passes the account already exists.

## Actions

Five actions, all user-facing. Everything else NextExplorer administers from inside its own UI.

### Set Admin Password

Generates a new random password for the bootstrapped admin account. Run it when the install task prompts, and any time you need to rotate the credential.

- **What it changes:** `adminPassword` in the package store, which reaches the application as `AUTH_ADMIN_PASSWORD` on the next start.
- **Availability:** any status.
- **Cost:** seconds, then a restart.
- **Repeat safety:** safe to re-run; each run generates a fresh password and the previous one stops working once the service restarts.
- **Outputs:** the sign-in email and the new password, the password masked and copyable, shown once.

### Locations: Add, Rename, Remove

Three actions in the **Locations** group manage the immediate subdirectories of `/mnt`. NextExplorer cannot do this itself: its API refuses to create a folder at the root, and its UI offers no rename or delete on a location.

- **Add Location** creates `/mnt/<name>`, owned by uid 1000. A service that depends on NextExplorer can run it directly (`access: 'dependent'`) to get a location of its own; for such a caller a location that already exists is a success, not an error.
- **Rename Location** takes a location from a select; the name field beneath it starts at that location's current name.
- **Remove Location** takes a location from a select and deletes it recursively, only once the field beneath it holds that location's exact name; the handler checks the match again.

Common to all three:

- **Names:** trimmed; must not start with `.` or contain `/`; must not be `_users` or one of the path prefixes NextExplorer routes before it looks at a location (`personal`, `share`, `volumes`, compared case-insensitively); must not collide with an existing entry in `/mnt`.
- **Availability:** any status. NextExplorer reads `/mnt` on every request, so a change shows on the next page load with no restart.
- **Cost:** instant, except that Remove takes as long as deleting the tree.
- **What a rename or removal breaks:** NextExplorer stores per-account volume assignments and share links by path, so accounts given the location in their Volumes tab lose it and share links into it stop resolving. Other services pointed at the path must be re-pointed. Nextcloud's external-storage entries follow on Nextcloud's next start, and the action's result says so when Nextcloud is installed.
- **`Files`:** `prepare-storage` recreates it only when `/mnt` holds no location, so renaming or removing `Files` sticks while any other location exists.
- **Outputs:** a one-line confirmation.

### Import Files from File Browser

Copies everything at the root of File Browser's `data` volume into `/mnt/FileBrowser`, so it appears in NextExplorer as a location named **FileBrowser**. Works for File Browser and FileBrowser Quantum alike, since both share the package id and the volume.

- **What it changes:** creates or extends `/mnt/FileBrowser` on the `data` volume. File Browser's volume is mounted read-only and never written.
- **Availability:** any status; the action is hidden while no `filebrowser` package is installed, and refuses to run if one is not.
- **Cost:** seconds on btrfs. Every file is cloned with a reflink, so the copy shares extents with the original and consumes no additional space until either side is modified. On a filesystem without reflinks each file is copied in full.
- **Repeat safety:** safe to re-run. A file that already exists at the destination is skipped, so a second run picks up only what File Browser gained since.
- **Outputs:** how many files were imported and their total size, how many were skipped, whether the copies share storage, and the first error if any file could not be read. The same summary is written to the service log as JSON.

Mechanics: a temporary subcontainer of the `nextexplorer` image runs a Node script as root with File Browser's volume at `/import` and this package's `data` volume at `/mnt`. Directories are created as needed, regular files are cloned with `COPYFILE_FICLONE_FORCE` and copied in full when the clone fails, symlinks are recreated with their original targets, other file types are skipped, and everything created is chowned to uid 1000 with the source's modification time. Hidden entries are copied like any other. An empty source is reported as an error rather than producing an empty location.

**What is not imported:** the File Browser database. Accounts, passwords, per-user folder scopes, share links and settings stay behind; the user re-creates accounts in NextExplorer and grants them the location.

## Tasks

Two tasks, both raised at install. The first blocks the service until you clear it; the second can be dismissed.

| Task                           | Severity    | Raised when                                                      | Cleared when                  |
| ------------------------------ | ----------- | ---------------------------------------------------------------- | ----------------------------- |
| Set Admin Password             | `critical`  | The store holds no admin password                                | The action runs               |
| Import Files from File Browser | `important` | A package with the id `filebrowser` is installed at install time | The action runs, or dismissed |

The admin-password condition is re-evaluated on every init, so that task returns if the password is ever removed from the store. The import task is raised once, on `install` only, so a dismissal holds across restarts and updates.

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
3. **A non-admin account reaches only the folders it was assigned.** With upstream's `USER_VOLUMES=false`, every authenticated account sees every location under `VOLUME_ROOT` and can write to all of it; `USER_DIR_ENABLED=false` then leaves the per-account space unreachable from the UI. Neither flag is settable from inside NextExplorer, so both are forced on here: a new account starts with its own space alone, and the admin grants locations from the account's Volumes tab. Admins are exempt from both and still see everything.
4. **Only Docker Hub is a valid source for the image** — see [Image and Container Runtime](#image-and-container-runtime).
5. **Importing from File Browser carries files only.** Accounts, passwords, folder scopes and share links are not converted — see [Import Files from File Browser](#import-files-from-file-browser).
6. **No riscv64 build.** x86_64 and aarch64 only.

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
dependencies:
  - filebrowser # optional; mounted only by import-from-filebrowser, never a current dependency
interfaces:
  ui: { type: ui, port: 3000 } # API and SPA on the same port
actions:
  - set-admin-password
  - add-location # group Locations; access: dependent
  - rename-location # group Locations
  - remove-location # group Locations; recursive delete
  - import-from-filebrowser # files only, reflinked into /mnt/FileBrowser
tasks:
  - { action: set-admin-password, severity: critical }
  - { action: import-from-filebrowser, severity: important } # only when filebrowser is installed at install time
health_checks:
  - primary # the daemon's ready check, displayed "Web Interface"
```
