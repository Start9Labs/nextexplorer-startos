import { readdir } from 'node:fs/promises'
import { T } from '@start9labs/start-sdk'
import { i18n } from './i18n'
import { sdk } from './sdk'

export const uiPort = 3000
export const volumeRoot = '/mnt'
export const configPath = '/config'
export const cachePath = '/cache'

// Each immediate subdirectory of VOLUME_ROOT appears under Locations in the UI.
export const defaultLocation = 'Files'
export const importLocation = 'FileBrowser'
export const usersDir = '_users'
export const importMountpoint = '/import'

export const adminEmail = 'admin@nextexplorer.local'

export const randomPassword = {
  charset: 'a-z,A-Z,1-9',
  len: 22,
}

export const mounts = sdk.Mounts.of()
  .mountVolume({
    volumeId: 'data',
    subpath: null,
    mountpoint: volumeRoot,
    readonly: false,
  })
  .mountVolume({
    volumeId: 'config',
    subpath: null,
    mountpoint: configPath,
    readonly: false,
  })
  .mountVolume({
    volumeId: 'cache',
    subpath: null,
    mountpoint: cachePath,
    readonly: false,
  })

// `personal`, `share` and `volumes` are path prefixes NextExplorer routes before it looks at a location.
const reservedNames = [usersDir, 'personal', 'share', 'volumes']

export const locationNamePattern = {
  regex: '^[^./][^/]*$',
  description: i18n('Cannot start with a dot or contain a slash'),
}

export const listLocations = async () =>
  (await readdir(sdk.volumes.data.path, { withFileTypes: true }))
    .filter(
      (e) => e.isDirectory() && !e.name.startsWith('.') && e.name !== usersDir,
    )
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b))

export const checkNewLocationName = async (raw: string) => {
  const name = raw.trim()
  if (!new RegExp(locationNamePattern.regex).test(name)) {
    throw new Error(locationNamePattern.description)
  }
  if (reservedNames.includes(name.toLowerCase())) {
    throw new Error(i18n('${name} is reserved by NextExplorer', { name }))
  }
  if ((await readdir(sdk.volumes.data.path)).includes(name)) {
    throw new Error(i18n('A location named ${name} already exists', { name }))
  }
  return name
}

export const nextcloudHint = async (effects: T.Effects) =>
  (await sdk.getInstalledPackages(effects)).includes('nextcloud')
    ? i18n('Nextcloud picks up the change the next time it starts.')
    : null
