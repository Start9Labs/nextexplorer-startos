# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

**Start every task at the recipe index** — `../start-technologies/projects/start-sdk/docs/src/recipes.md`
(or <https://docs.start9.com/packaging/recipes.html>). It maps an intent ("prompt the user to create
admin credentials", "expose a web UI") to the constructs, the reference pages, and a named production
package to copy. Find the recipe before you read this package's neighbours: a package you reach by
grepping may be non-conformant, and the recipe outranks it.

Freshly scaffolded? Work the
[New Package Checklist](../start-technologies/projects/start-sdk/docs/src/new-package-checklist.md)
(or <https://docs.start9.com/packaging/new-package-checklist.html>) from top to bottom. It is a
guide page, not a file in this repo — read it, don't copy it in.

Keep `README.md` (technical reference for an AI support or administering agent) and
`instructions.md` (end-user docs) in sync with your changes.

**Bugs and feature requests are GitHub issues on this repo** — file them as you find them.
Don't record work in the repo instead: no `TODO.md`, no `NOTES.md`, no `PLAN.md`. What you
verified, tried, and decided belongs in the commit message and the PR body.

## This repo

- **The daemon must run as root.** The image sets no `USER`; its entrypoint calls `usermod`/`groupmod` and then `gosu`s to uid 1000. Executing the container as a non-root user makes the entrypoint fail with `groupmod: Permission denied`. Do not "fix" this by setting a user on the exec.
- **The `prepare-storage` oneshot is load-bearing.** The entrypoint chowns `/config` and `/cache` but never `/mnt`, so StartOS's root-owned 0755 volume leaves the app able to browse but not write — a silent partial failure rather than a startup error. The oneshot also creates `/mnt/Files`, because NextExplorer renders each immediate subdirectory of `VOLUME_ROOT` as a drive and an empty root shows the user nothing.
- **Leave `PUBLIC_URL` unset.** Setting it pins CORS to a single origin; StartOS serves the same service over LAN and Tor addresses simultaneously.
- **Never substitute an empty string for a missing secret.** NextExplorer skips its admin bootstrap for a password under six characters, leaving the setup wizard open to whoever reaches it first.
- **Keep `USER_VOLUMES` and `USER_DIR_ENABLED` on.** Upstream defaults both to false: the first gives every authenticated account full read/write over every drive under `VOLUME_ROOT`, the second leaves the per-account space unreachable from the UI. Neither is settable from inside the application.
