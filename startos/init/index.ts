import { sdk } from '../sdk'
import { setDependencies } from '../dependencies'
import { setInterfaces } from '../interfaces'
import { versionGraph } from '../versions'
import { actions } from '../actions'
import { restoreInit } from '../backups'
import { seedFiles } from './seedFiles'
import { watchCredentials } from './watchCredentials'
import { watchFileBrowser } from './watchFileBrowser'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  seedFiles,
  setInterfaces,
  setDependencies,
  actions,
  watchCredentials,
  watchFileBrowser,
)

export const uninit = sdk.setupUninit(versionGraph)
