import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const shape = z.object({
  adminPassword: z.string().optional().catch(undefined),
  // Defaults to a fresh random value each boot, which would sign every user out on restart.
  sessionSecret: z.string().optional().catch(undefined),
})

export const storeJson = FileHelper.json(
  { base: sdk.volumes.config, subpath: 'startos.json' },
  shape,
)
