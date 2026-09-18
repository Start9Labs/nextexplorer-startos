export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting NextExplorer': 0,
  'Web Interface': 1,
  'The web interface is ready': 2,
  'The web interface is not ready': 3,

  // interfaces.ts
  'Web UI': 4,
  'The web interface of NextExplorer': 5,

  // actions/setAdminPassword.ts
  'Set Admin Password': 6,
  'Generate a new random password for the NextExplorer admin account. Replaces any existing password.': 7,
  'Admin Credentials': 8,
  'Use these credentials to sign in to NextExplorer. Write them down or save them to a password manager.': 9,
  Email: 10,
  Password: 11,

  // init/watchCredentials.ts
  'Set the admin password before signing in to NextExplorer': 12,

  // actions/importFromFileBrowser.ts
  'Import Files from File Browser': 13,
  'Copy everything stored in File Browser or FileBrowser Quantum into a NextExplorer drive named FileBrowser. File Browser is left untouched, so you can uninstall it once you have checked the result.': 14,
  'Files only. User accounts, passwords, per-user folder restrictions, share links and settings are not imported. Afterwards, create each account again in NextExplorer and give it access to the FileBrowser drive, and re-create any share links.': 15,
  'File Browser is not installed, so there is nothing to import.': 16,
  'Imported files from File Browser': 17,
  "File Browser's storage is empty, so there is nothing to import.": 18,
  'Imported ${files} files (${size}) into the ${drive} drive. ${skipped} already there were left as they are.': 19,
  'The copies share storage with the originals, so no extra space was used.': 20,
  '${failed} could not be copied. First error: ${error}': 21,
  'Next: create each account again in NextExplorer and give it access to the ${drive} drive, then re-create any share links. Uninstall File Browser only after every other service that reads its files has been switched to NextExplorer.': 22,
  'Import Finished with Errors': 23,
  'Import Finished': 24,

  // init/watchFileBrowser.ts
  'File Browser is installed on this server. NextExplorer can import its files into a drive of its own. Only the files come across: accounts, passwords, folder permissions and share links do not, and you will re-create those in NextExplorer.': 25,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
