import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.1.0:0',
  releaseNotes: {
    en_US: `Updated NextExplorer to 3.1.0: create and extract archives, search inside office documents and PDFs, subtitles in the media player, and zoom and rotation in image previews.

NextExplorer can now import the files stored in File Browser or FileBrowser Quantum into a drive of its own, with the **Import Files from File Browser** action. Accounts, folder permissions and share links are not imported.

NextExplorer is now published on the Start9 Registry.`,
    es_ES: `Actualiza NextExplorer a 3.1.0: crea y extrae archivos comprimidos, busca dentro de documentos de oficina y PDF, subtítulos en el reproductor multimedia, y zoom y rotación en la vista previa de imágenes.

NextExplorer ahora puede importar los archivos almacenados en File Browser o FileBrowser Quantum a una unidad propia, con la acción **Importar archivos desde File Browser**. Las cuentas, los permisos de carpeta y los enlaces de compartición no se importan.

NextExplorer ahora se publica en el Registro de Start9.`,
    de_DE: `Aktualisiert NextExplorer auf 3.1.0: Archive erstellen und entpacken, Suche in Office-Dokumenten und PDFs, Untertitel im Medienplayer sowie Zoom und Drehung in der Bildvorschau.

NextExplorer kann jetzt die in File Browser oder FileBrowser Quantum gespeicherten Dateien mit der Aktion **Dateien aus File Browser importieren** in ein eigenes Laufwerk übernehmen. Konten, Ordnerberechtigungen und Freigabelinks werden nicht übernommen.

NextExplorer wird jetzt in der Start9-Registry veröffentlicht.`,
    pl_PL: `Aktualizuje NextExplorer do 3.1.0: tworzenie i rozpakowywanie archiwów, wyszukiwanie w dokumentach biurowych i PDF, napisy w odtwarzaczu multimediów oraz powiększanie i obracanie w podglądzie obrazów.

NextExplorer może teraz zaimportować pliki przechowywane w File Browser lub FileBrowser Quantum do własnego dysku za pomocą akcji **Importuj pliki z File Browser**. Konta, uprawnienia do folderów i linki udostępniania nie są importowane.

NextExplorer jest teraz publikowany w rejestrze Start9.`,
    fr_FR: `Met à niveau NextExplorer vers 3.1.0 : création et extraction d'archives, recherche dans les documents bureautiques et les PDF, sous-titres dans le lecteur multimédia, zoom et rotation dans l'aperçu des images.

NextExplorer peut désormais importer les fichiers stockés dans File Browser ou FileBrowser Quantum dans un lecteur qui lui est propre, avec l'action **Importer les fichiers depuis File Browser**. Les comptes, les permissions de dossiers et les liens de partage ne sont pas importés.

NextExplorer est désormais publié sur le registre Start9.`,
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
