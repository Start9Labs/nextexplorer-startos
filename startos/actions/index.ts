import { sdk } from '../sdk'
import { importFromFileBrowser } from './importFromFileBrowser'
import { addLocation } from './locations/add'
import { removeLocation } from './locations/remove'
import { renameLocation } from './locations/rename'
import { setAdminPassword } from './setAdminPassword'

export const actions = sdk.Actions.of()
  .addAction(setAdminPassword)
  .addAction(addLocation)
  .addAction(renameLocation)
  .addAction(removeLocation)
  .addAction(importFromFileBrowser)
