import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { adminEmail, defaultLibrary, mounts, uiPort, volumeRoot } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting NextExplorer'))

  const store = await storeJson.read().const(effects)
  if (!store?.adminPassword || !store.sessionSecret) {
    // Unreachable: seedFiles generates the session secret, and a critical task
    // blocks startup until the password is set. Refuse rather than substitute
    // an empty value -- NextExplorer skips its admin bootstrap below six
    // characters, leaving the setup wizard open to whoever reaches it first.
    throw new Error('Generated secrets are missing from the package store')
  }

  const subcontainer = sdk.SubContainer.of(
    effects,
    { imageId: 'nextexplorer' },
    mounts,
    'nextexplorer-sub',
  )

  return sdk.Daemons.of(effects)
    .addOneshot('prepare-storage', {
      subcontainer,
      exec: {
        // The image's entrypoint chowns /config and /cache but never the storage root.
        command: [
          'sh',
          '-c',
          `mkdir -p ${volumeRoot}/${defaultLibrary} && chown -R 1000:1000 ${volumeRoot}`,
        ],
        user: 'root',
      },
      requires: [],
    })
    .addDaemon('primary', {
      subcontainer,
      exec: {
        command: sdk.useEntrypoint(),
        env: {
          AUTH_ADMIN_EMAIL: adminEmail,
          AUTH_ADMIN_PASSWORD: store.adminPassword,
          SESSION_SECRET: store.sessionSecret,
          TERMINAL_ENABLED: 'false',
        },
      },
      ready: {
        display: i18n('Web Interface'),
        fn: () =>
          sdk.healthCheck.checkWebUrl(
            effects,
            `http://localhost:${uiPort}/healthz`,
            {
              successMessage: i18n('The web interface is ready'),
              errorMessage: i18n('The web interface is not ready'),
            },
          ),
      },
      requires: ['prepare-storage'],
    })
})
