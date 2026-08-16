# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Keep `README.md` (architecture, for developers and LLMs) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **Package id is `nextexplorer`.** One `ui` interface on the `main` host, port 3000, carrying the API, the SPA and a WebSocket endpoint.
- **The daemon must run as root.** The image sets no `USER`; its entrypoint calls `usermod`/`groupmod` and then `gosu`s to uid 1000. Executing the container as a non-root user makes the entrypoint fail with `groupmod: Permission denied`. Do not "fix" this by setting a user on the exec.
- **The `prepare-storage` oneshot is load-bearing.** The entrypoint chowns `/config` and `/cache` but never `/mnt`, so StartOS's root-owned 0755 volume leaves the app able to browse but not write — a silent partial failure rather than a startup error. The oneshot also creates `/mnt/Files`, because NextExplorer renders each immediate subdirectory of `VOLUME_ROOT` as a drive and an empty root shows the user nothing.
- **`SESSION_SECRET` must be persisted.** Unset, upstream generates a fresh random value per boot, silently signing every user out on each restart. It is generated once in `seedFiles` and lives in the package store.
- **`AUTH_ADMIN_PASSWORD` is re-asserted on every start**, not just first run — upstream's `ensureEnvAdminUser()` calls `setLocalPasswordAdmin` unconditionally. That is why the admin credential is StartOS-owned and why `instructions.md` tells users not to change it in-app. Removing the env var after bootstrap would let the user own it, but then a restore from backup would have no way to recover the account.
- **Leave `PUBLIC_URL` unset.** Setting it pins CORS to a single origin; StartOS serves the same service over LAN and Tor addresses simultaneously.

## Inspecting a running install

To run a command inside the service's container, use `start-cli package attach nextexplorer -n nextexplorer-sub -- <cmd>`. Select the subcontainer by **name** with `-n` (the name passed to `SubContainer.of` in `main.ts` — here `nextexplorer-sub`) or by image with `-i`. Note: `-s/--subcontainer` matches the internal **Guid**, not the name, so passing a name to `-s` fails with "no matching subcontainers".
