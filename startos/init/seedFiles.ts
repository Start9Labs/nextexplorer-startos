import { utils } from '@start9labs/start-sdk'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'

export const seedFiles = sdk.setupOnInit(async (effects) => {
  await storeJson.merge(effects, {})

  const store = await storeJson.read().once()
  if (!store?.sessionSecret) {
    await storeJson.merge(effects, {
      sessionSecret: utils.getDefaultString({
        charset: 'a-z,A-Z,0-9',
        len: 64,
      }),
    })
  }
})
