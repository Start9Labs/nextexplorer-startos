import { sdk } from '../sdk'
import { importFromFileBrowser } from './importFromFileBrowser'
import { setAdminPassword } from './setAdminPassword'

export const actions = sdk.Actions.of()
  .addAction(setAdminPassword)
  .addAction(importFromFileBrowser)
