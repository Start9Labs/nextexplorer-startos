# NextExplorer

## Documentation

- [NextExplorer documentation](https://nxzai.github.io/NextExplorer/) — the full upstream manual.
- [Features](https://nxzai.github.io/NextExplorer/experience/features.html) — what the file manager can do, screen by screen.
- [User volumes](https://nxzai.github.io/NextExplorer/admin/user-volumes.html) — assigning folders to the people you add.

## What you get on StartOS

One web interface, and a drive called **Files** behind it. Everything you upload lives on your server and goes into your StartOS backups along with your accounts, your share links and your settings.

StartOS issues the admin sign-in for you rather than leaving you to create it in a setup screen, and it is the only place that credential can be changed. Each extra account you create is private by default: its own **My Files** space, and no shared folders until you grant them.

## Getting set up

1. StartOS will show a task telling you to set an admin password — the service will not start until you do.
2. Run the **Set Admin Password** action. It generates a strong password and shows it to you along with the email address to sign in with. **Copy both into your password manager now.**
3. Start NextExplorer and open the **Web UI**.
4. Sign in with the email and password from step 2.

You'll land in a drive called **Files**. That's your storage — everything you put there is kept on your server.

## Using NextExplorer

### Web interface

Drag files onto the page to upload them, or use the upload button. Folders work the way you'd expect: create them, drag things between them, rename and delete.

Click a file to preview it. Images, video, audio, PDFs and common document formats open in the browser. Text and code files open in an editor you can save from.

The first time you add a lot of files, thumbnails take a little while to appear — they're generated in the background.

### Sharing

Right-click a file or folder and choose to share it. NextExplorer creates a link you can send to someone. Anyone with the link can open it without an account, so treat those links as secrets.

### Adding people

Go to **Settings → Admin → Users** and create an account. A new account starts with nothing shared: it sees only its own **My Files** space, which no one else can open.

To let someone into your files, open their account, go to the **Volumes** tab, and add each folder they should reach — you give it a label, pick the folder, and choose read-only or read/write. They see the labels you chose and nothing else. You manage all of this inside NextExplorer; StartOS is not involved.

Your own account is the administrator and always sees every folder.

### Actions

**Set Admin Password** — generates a new random password for the admin account. Use it the first time, and any time you want to rotate the credential.

Change the admin password **here**, not inside NextExplorer. StartOS re-applies the stored password every time the service starts, so a change made in NextExplorer's own settings page will be undone on the next restart. This applies only to the admin account you were given at setup — passwords for accounts you create inside NextExplorer work normally and are never touched.

## Limitations

**The built-in terminal is unavailable.** Upstream ships a terminal that gives any administrator a shell inside the service, and it is switched off here. Nothing else in the file manager depends on it.
