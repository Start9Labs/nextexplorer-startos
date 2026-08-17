# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (technical reference for an AI support or administering agent) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **The daemon must run as root.** The image sets no `USER`; its entrypoint calls `usermod`/`groupmod` and then `gosu`s to uid 1000. Executing the container as a non-root user makes the entrypoint fail with `groupmod: Permission denied`. Do not "fix" this by setting a user on the exec.
- **The `prepare-storage` oneshot is load-bearing.** The entrypoint chowns `/config` and `/cache` but never `/mnt`, so StartOS's root-owned 0755 volume leaves the app able to browse but not write — a silent partial failure rather than a startup error. The oneshot also creates `/mnt/Files`, because NextExplorer renders each immediate subdirectory of `VOLUME_ROOT` as a drive and an empty root shows the user nothing.
- **Leave `PUBLIC_URL` unset.** Setting it pins CORS to a single origin; StartOS serves the same service over LAN and Tor addresses simultaneously.
- **`main` refuses to start on a missing secret rather than substituting an empty one.** NextExplorer skips its admin bootstrap for a password under six characters, which would leave the setup wizard open to whoever reached it first.
