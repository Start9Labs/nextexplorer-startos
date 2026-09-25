import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.1.0:1',
  releaseNotes: {
    en_US:
      'New **Locations** actions add, rename and remove the top-level folders listed under Locations in NextExplorer. Services that depend on NextExplorer, such as Paperless-ngx, can add a location of their own.',
    es_ES:
      'Nuevas acciones de **Ubicaciones** para añadir, renombrar y eliminar las carpetas de primer nivel que aparecen en Ubicaciones en NextExplorer. Los servicios que dependen de NextExplorer, como Paperless-ngx, pueden añadir una ubicación propia.',
    de_DE:
      'Neue Aktionen unter **Standorte** fügen die in NextExplorer unter Standorte aufgeführten Ordner der obersten Ebene hinzu, benennen sie um und entfernen sie. Dienste, die von NextExplorer abhängen, etwa Paperless-ngx, können einen eigenen Standort hinzufügen.',
    pl_PL:
      'Nowe akcje w grupie **Lokalizacje** dodają, zmieniają nazwy i usuwają foldery najwyższego poziomu widoczne w sekcji Lokalizacje w NextExplorer. Usługi zależne od NextExplorer, takie jak Paperless-ngx, mogą dodać własną lokalizację.',
    fr_FR:
      'De nouvelles actions **Emplacements** ajoutent, renomment et suppriment les dossiers de premier niveau affichés sous Emplacements dans NextExplorer. Les services qui dépendent de NextExplorer, comme Paperless-ngx, peuvent ajouter leur propre emplacement.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
