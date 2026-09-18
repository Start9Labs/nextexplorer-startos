import { setupManifest } from '@start9labs/start-sdk'
import { filebrowserDescription, long, short } from './i18n'

const dockerImage = 'nxzai/explorer'
const dockerVersion = 'v3.1.0'

export const manifest = setupManifest({
  id: 'nextexplorer',
  title: 'NextExplorer',
  license: 'GPL-3.0-only',
  packageRepo: 'https://github.com/Start9Labs/nextexplorer-startos',
  upstreamRepo: 'https://github.com/nxzai/NextExplorer',
  marketingUrl: 'https://nxzai.github.io/NextExplorer/',
  donationUrl: null,
  description: { short, long },
  // `data` is load-bearing: sibling packages mount it by name.
  volumes: ['data', 'config', 'cache'],
  images: {
    nextexplorer: {
      source: {
        dockerTag: `${dockerImage}:${dockerVersion}`,
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {
    filebrowser: {
      description: filebrowserDescription,
      optional: true,
      metadata: {
        title: 'File Browser',
        icon: 'https://raw.githubusercontent.com/Start9Labs/filebrowser-quantum-startos/e936a6c85a97b930b43cad5e9c0dd4898a2df567/icon.svg',
      },
    },
  },
})
