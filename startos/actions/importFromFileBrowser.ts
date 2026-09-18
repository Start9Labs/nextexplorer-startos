import { manifest as filebrowserManifest } from 'filebrowser-startos/startos/manifest'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { importDrive, importMountpoint, volumeRoot } from '../utils'

const source = 'filebrowser'
const target = `${volumeRoot}/${importDrive}`

// Runs as root inside the image; reflinks where the filesystem allows, so a
// copy shares storage with the original until either side changes.
const copyScript = `
const fs = require('fs'), path = require('path')
const src = ${JSON.stringify(importMountpoint)}, dst = ${JSON.stringify(target)}
const n = { files: 0, dirs: 0, links: 0, skipped: 0, failed: 0, bytes: 0, cloned: 0, firstError: null }
const exists = (p) => { try { fs.lstatSync(p); return true } catch { return false } }
const walk = (s, d) => {
  if (!exists(d)) { fs.mkdirSync(d); fs.chownSync(d, 1000, 1000); n.dirs++ }
  for (const e of fs.readdirSync(s, { withFileTypes: true })) {
    const sp = path.join(s, e.name), dp = path.join(d, e.name)
    try {
      if (e.isDirectory()) walk(sp, dp)
      else if (exists(dp)) n.skipped++
      else if (e.isSymbolicLink()) {
        fs.symlinkSync(fs.readlinkSync(sp), dp)
        fs.lchownSync(dp, 1000, 1000)
        n.links++
      } else if (e.isFile()) {
        try { fs.copyFileSync(sp, dp, fs.constants.COPYFILE_FICLONE_FORCE); n.cloned++ }
        catch { fs.copyFileSync(sp, dp) }
        const st = fs.statSync(sp)
        fs.chownSync(dp, 1000, 1000)
        fs.utimesSync(dp, st.atime, st.mtime)
        n.files++
        n.bytes += st.size
      }
    } catch (err) {
      n.failed++
      n.firstError ??= sp + ': ' + (err && err.message || err)
    }
  }
  const st = fs.statSync(s)
  fs.utimesSync(d, st.atime, st.mtime)
}
if (fs.readdirSync(src).length) walk(src, dst)
console.log(JSON.stringify(n))
`

type Summary = {
  files: number
  dirs: number
  links: number
  skipped: number
  failed: number
  bytes: number
  cloned: number
  firstError: string | null
}

const formatBytes = (bytes: number) => {
  const units = ['B', 'kB', 'MB', 'GB', 'TB']
  let i = 0
  while (bytes >= 1000 && i < units.length - 1) {
    bytes /= 1000
    i++
  }
  return `${i ? bytes.toFixed(1) : bytes} ${units[i]}`
}

export const importFromFileBrowser = sdk.Action.withoutInput(
  'import-from-filebrowser',

  async ({ effects }) => ({
    name: i18n('Import Files from File Browser'),
    description: i18n(
      'Copy everything stored in File Browser or FileBrowser Quantum into a NextExplorer drive named FileBrowser. File Browser is left untouched, so you can uninstall it once you have checked the result.',
    ),
    warning: i18n(
      'Files only. User accounts, passwords, per-user folder restrictions, share links and settings are not imported. Afterwards, create each account again in NextExplorer and give it access to the FileBrowser drive, and re-create any share links.',
    ),
    allowedStatuses: 'any',
    group: null,
    visibility: (await sdk.getStatus(effects, { packageId: source }).const())
      ? 'enabled'
      : 'hidden',
  }),

  async ({ effects }) => {
    if (!(await sdk.getInstalledPackages(effects)).includes(source)) {
      throw new Error(
        i18n('File Browser is not installed, so there is nothing to import.'),
      )
    }

    const { stdout } = await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'nextexplorer' },
      sdk.Mounts.of()
        .mountVolume({
          volumeId: 'data',
          subpath: null,
          mountpoint: volumeRoot,
          readonly: false,
        })
        .mountDependency<typeof filebrowserManifest>({
          dependencyId: source,
          volumeId: 'data',
          subpath: null,
          mountpoint: importMountpoint,
          readonly: true,
        }),
      'import-from-filebrowser',
      (sub) => sub.execFail(['node', '-e', copyScript], { user: 'root' }, null),
    )

    const n: Summary = JSON.parse(stdout.toString().trim().split('\n').pop()!)
    console.info(
      `${i18n('Imported files from File Browser')}: ${JSON.stringify(n)}`,
    )

    if (!n.files && !n.links && !n.skipped) {
      throw new Error(
        i18n("File Browser's storage is empty, so there is nothing to import."),
      )
    }

    const lines = [
      i18n(
        'Imported ${files} files (${size}) into the ${drive} drive. ${skipped} already there were left as they are.',
        {
          files: String(n.files),
          size: formatBytes(n.bytes),
          drive: importDrive,
          skipped: String(n.skipped),
        },
      ),
    ]
    if (n.files && n.cloned === n.files) {
      lines.push(
        i18n(
          'The copies share storage with the originals, so no extra space was used.',
        ),
      )
    }
    if (n.failed) {
      lines.push(
        i18n('${failed} could not be copied. First error: ${error}', {
          failed: String(n.failed),
          error: n.firstError ?? '',
        }),
      )
    }
    lines.push(
      i18n(
        'Next: create each account again in NextExplorer and give it access to the ${drive} drive, then re-create any share links. Uninstall File Browser only after every other service that reads its files has been switched to NextExplorer.',
        { drive: importDrive },
      ),
    )

    return {
      version: '1',
      title: i18n(n.failed ? 'Import Finished with Errors' : 'Import Finished'),
      message: lines.join('\n\n'),
      result: null,
    }
  },
)
