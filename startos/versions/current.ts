import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.0.1:1',
  releaseNotes: {
    en_US:
      'Nextcloud and Paperless-ngx can use NextExplorer storage with this version.',
    es_ES:
      'Nextcloud y Paperless-ngx pueden usar el almacenamiento de NextExplorer con esta versión.',
    de_DE:
      'Nextcloud und Paperless-ngx können den Speicher von NextExplorer mit dieser Version nutzen.',
    pl_PL:
      'Nextcloud i Paperless-ngx mogą korzystać z przestrzeni NextExplorer w tej wersji.',
    fr_FR:
      'Nextcloud et Paperless-ngx peuvent utiliser le stockage de NextExplorer avec cette version.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
}).satisfies('3.1.0:3')
