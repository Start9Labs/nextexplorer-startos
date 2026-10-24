import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'nextexplorer',
  title: 'NextExplorer',
  license: 'GPL-3.0-only',
  packageRepo: 'https://github.com/Start9Labs/nextexplorer-startos',
  upstreamRepo: 'https://github.com/nxzai/NextExplorer',
  marketingUrl: 'https://explorer.nxz.ai/',
  donationUrl: null,
  description: { short, long },
  // `data` is load-bearing: sibling packages mount it by name.
  volumes: ['data', 'config', 'cache'],
  images: {
    nextexplorer: {
      source: {
        dockerBuild: {
          buildArgs: { IMAGE: 'nxzai/explorer:v3.1.0' },
        },
      },
      arch: ['x86_64', 'aarch64'],
      emulateMissing: false,
    },
  },
})
