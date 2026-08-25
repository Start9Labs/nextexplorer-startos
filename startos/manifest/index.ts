import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

const dockerImage = 'nxzai/explorer'
const dockerVersion = 'v2.2.7'

export const manifest = setupManifest({
  id: 'nextexplorer',
  title: 'NextExplorer',
  license: 'GPL-3.0-only',
  packageRepo: 'https://github.com/Start9-Community/nextexplorer-startos',
  upstreamRepo: 'https://github.com/nxzai/NextExplorer',
  marketingUrl: 'https://nxzai.github.io/NextExplorer/',
  donationUrl: null,
  description: { short, long },
  volumes: ['data', 'config', 'cache'],
  images: {
    nextexplorer: {
      source: {
        dockerTag: `${dockerImage}:${dockerVersion}`,
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {},
})
