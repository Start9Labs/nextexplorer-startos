import { sdk } from './sdk'

// /cache holds thumbnails and the session store; NextExplorer rebuilds both.
export const { createBackup, restoreInit } = sdk.setupBackups(async () =>
  sdk.Backups.ofVolumes('data', 'config'),
)
