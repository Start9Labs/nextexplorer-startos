import { sdk } from './sdk'

export const uiPort = 3000
export const volumeRoot = '/mnt'
export const configPath = '/config'
export const cachePath = '/cache'

// Each immediate subdirectory of VOLUME_ROOT appears as a top-level drive in the UI.
export const defaultLibrary = 'Files'

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
