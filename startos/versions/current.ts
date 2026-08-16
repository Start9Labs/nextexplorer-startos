import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.2.7:0',
  releaseNotes: {
    en_US: 'Initial release of NextExplorer for StartOS.',
    es_ES: 'Versión inicial de NextExplorer para StartOS.',
    de_DE: 'Erstveröffentlichung von NextExplorer für StartOS.',
    pl_PL: 'Pierwsze wydanie NextExplorer dla StartOS.',
    fr_FR: 'Version initiale de NextExplorer pour StartOS.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
