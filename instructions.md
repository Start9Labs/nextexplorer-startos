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

## Coming from File Browser

If File Browser or FileBrowser Quantum is installed on this server, StartOS shows a task suggesting you import its files. You can run it right away or dismiss it and come back later.

**Only your files come across.** The **Import Files from File Browser** action copies everything in File Browser's storage into a new drive called **FileBrowser**. It does not touch File Browser, it takes seconds however much you have stored, and it uses no extra space. Run it again at any time and it picks up only what is new.

What the import does not bring, because File Browser keeps it in its own database:

- **Accounts and passwords.** Create each person's account again in NextExplorer under **Settings → Admin → Users**.
- **Folder restrictions.** Open each new account's **Volumes** tab and add the FileBrowser drive, or just the folders they should reach.
- **Share links.** Existing links keep pointing at File Browser. Share the files again from NextExplorer.
- **Settings and branding.**

Once you have checked the result, move on: point any other service that reads from File Browser (Jellyfin, Immich, Nextcloud, qBittorrent, Start9 Pages and the like) at NextExplorer instead, and only then uninstall File Browser. Moving folders from the FileBrowser drive into Files is instant.

**If you use Nextcloud**, look in its NextExplorer folder before you uninstall File Browser. That folder shows the Files drive, so if what you imported is not there, move it from the FileBrowser drive into Files and it will appear.

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

**Import Files from File Browser** — copies the files stored in File Browser or FileBrowser Quantum into a drive called FileBrowser. Files only; see [Coming from File Browser](#coming-from-file-browser). Shown only while File Browser is installed.

Change the admin password **here**, not inside NextExplorer. StartOS re-applies the stored password every time the service starts, so a change made in NextExplorer's own settings page will be undone on the next restart. This applies only to the admin account you were given at setup — passwords for accounts you create inside NextExplorer work normally and are never touched.

## Limitations

**The built-in terminal is unavailable.** Upstream ships a terminal that gives any administrator a shell inside the service, and it is switched off here. Nothing else in the file manager depends on it.
