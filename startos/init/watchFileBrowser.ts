import { importFromFileBrowser } from '../actions/importFromFileBrowser'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const watchFileBrowser = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return
  if (!(await sdk.getInstalledPackages(effects)).includes('filebrowser')) return

  await sdk.action.createOwnTask(effects, importFromFileBrowser, 'important', {
    reason: i18n(
      'File Browser is installed on this server. NextExplorer can import its files into a location of its own. Only the files come across: accounts, passwords, folder permissions and share links do not, and you will re-create those in NextExplorer.',
    ),
  })
})
