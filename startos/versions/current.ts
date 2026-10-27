import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.0.1:0',
  releaseNotes: {
    en_US: `Updated NextExplorer to 4.0.1 with stronger authentication, two-factor authentication, passkeys, API tokens, improved uploads and archive handling, trash, and file versions. Updated the StartOS SDK.

Trash and file versions are enabled by default and retain data in hidden .nextexplorer folders within your storage. Adjust their retention in NextExplorer Settings. Remove Location still deletes a whole location permanently, including its trash and versions.

Upstream migrates the database automatically and moves search and folder-size indexes into the cache. Large indexes can extend the first startup and need temporary free space; missing cache indexes are rebuilt.

Full release notes: https://github.com/nxzai/NextExplorer/releases/tag/v4.0.0 and https://github.com/nxzai/NextExplorer/releases/tag/v4.0.1`,
    es_ES: `NextExplorer se actualizó a 4.0.1 con autenticación reforzada, autenticación de dos factores, claves de acceso, tokens de API, mejoras en las cargas y los archivos comprimidos, papelera y versiones de archivos. Se actualizó el SDK de StartOS.

La papelera y las versiones de archivos están activadas por defecto y conservan datos en carpetas ocultas .nextexplorer dentro del almacenamiento. Ajusta su retención en los ajustes de NextExplorer. Eliminar ubicación sigue borrando toda la ubicación de forma permanente, incluidas su papelera y sus versiones.

La aplicación migra la base de datos automáticamente y mueve los índices de búsqueda y tamaños de carpetas a la caché. Los índices grandes pueden alargar el primer inicio y necesitan espacio libre temporal; los índices de caché ausentes se reconstruyen.

Notas completas: https://github.com/nxzai/NextExplorer/releases/tag/v4.0.0 y https://github.com/nxzai/NextExplorer/releases/tag/v4.0.1`,
    de_DE: `NextExplorer auf 4.0.1 aktualisiert: stärkere Authentifizierung, Zwei-Faktor-Authentifizierung, Passkeys, API-Token, verbesserte Uploads und Archivverarbeitung, Papierkorb und Dateiversionen. Das StartOS-SDK wurde aktualisiert.

Papierkorb und Dateiversionen sind standardmäßig aktiviert und speichern Daten in versteckten .nextexplorer-Ordnern im Datenspeicher. Die Aufbewahrung lässt sich in den NextExplorer-Einstellungen anpassen. „Speicherort entfernen“ löscht weiterhin den gesamten Speicherort endgültig, einschließlich Papierkorb und Versionen.

Die Anwendung migriert die Datenbank automatisch und verschiebt Such- und Ordnergrößenindizes in den Cache. Große Indizes können den ersten Start verlängern und benötigen vorübergehend freien Speicherplatz; fehlende Cache-Indizes werden neu aufgebaut.

Vollständige Versionshinweise: https://github.com/nxzai/NextExplorer/releases/tag/v4.0.0 und https://github.com/nxzai/NextExplorer/releases/tag/v4.0.1`,
    pl_PL: `Zaktualizowano NextExplorer do 4.0.1: mocniejsze uwierzytelnianie, uwierzytelnianie dwuskładnikowe, klucze dostępu, tokeny API, ulepszone przesyłanie i obsługa archiwów, kosz oraz wersje plików. Zaktualizowano SDK StartOS.

Kosz i wersje plików są domyślnie włączone i przechowują dane w ukrytych folderach .nextexplorer w przestrzeni danych. Okres przechowywania można zmienić w ustawieniach NextExplorer. Usunięcie lokalizacji nadal trwale usuwa całą lokalizację wraz z koszem i wersjami.

Aplikacja automatycznie migruje bazę danych i przenosi indeksy wyszukiwania oraz rozmiarów folderów do pamięci podręcznej. Duże indeksy mogą wydłużyć pierwszy rozruch i wymagają tymczasowego wolnego miejsca; brakujące indeksy są odbudowywane.

Pełne informacje o wydaniu: https://github.com/nxzai/NextExplorer/releases/tag/v4.0.0 oraz https://github.com/nxzai/NextExplorer/releases/tag/v4.0.1`,
    fr_FR: `NextExplorer passe à 4.0.1 : authentification renforcée, double authentification, clés d’accès, jetons API, améliorations des téléversements et des archives, corbeille et versions de fichiers. Le SDK StartOS a été mis à jour.

La corbeille et les versions sont activées par défaut et conservent des données dans des dossiers cachés .nextexplorer au sein du stockage. Réglez leur conservation dans les paramètres de NextExplorer. Supprimer un emplacement efface toujours définitivement tout l’emplacement, y compris sa corbeille et ses versions.

L’application migre automatiquement la base de données et déplace les index de recherche et de taille des dossiers vers le cache. Les gros index peuvent prolonger le premier démarrage et nécessitent de l’espace libre temporaire ; les index absents du cache sont reconstruits.

Notes complètes : https://github.com/nxzai/NextExplorer/releases/tag/v4.0.0 et https://github.com/nxzai/NextExplorer/releases/tag/v4.0.1`,
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
