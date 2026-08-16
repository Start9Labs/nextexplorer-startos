# NextExplorer

## Documentation

- [NextExplorer documentation](https://explorer.nxz.ai/) — the full upstream manual.
- [FAQ](https://explorer.nxz.ai/reference/faq.html) — common questions about storage, thumbnails and sharing.

## What you get on StartOS

NextExplorer is a file manager you use from a web browser. Upload files from any device, organize them into folders, and open images, video, audio, PDFs and documents right in the page without downloading them first. Text files can be edited in place, and there's a search box that looks across everything you've stored.

You can also create accounts for other people, give each of them their own private folder, and hand out links to individual files or folders when you want to share something.

## Getting set up

1. Install NextExplorer. StartOS will show a task telling you to set an admin password — the service will not start until you do.
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

In **Settings**, create accounts for other people. Each account can be given its own folder so people don't see each other's files. You manage all of this inside NextExplorer — StartOS is not involved.

### Actions

**Set Admin Password** — generates a new random password for the admin account. Use it the first time, and any time you want to rotate the credential.

Change the admin password **here**, not inside NextExplorer. StartOS re-applies the stored password every time the service starts, so a change made in NextExplorer's own settings page will be undone on the next restart. This applies only to the admin account you were given at setup — passwords for accounts you create inside NextExplorer work normally and are never touched.
