import { chown, mkdir } from 'node:fs/promises'
import { i18n } from '../../i18n'
import { sdk } from '../../sdk'
import {
  checkNewLocationName,
  locationNamePattern,
  nextcloudHint,
} from '../../utils'

const { InputSpec, Value } = sdk

export const addLocation = sdk.Action.withInput(
  'add-location',

  async () => ({
    name: i18n('Add Location'),
    description: i18n(
      'Create a new location: a top-level folder listed under Locations in NextExplorer.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Locations'),
    visibility: 'enabled',
  }),

  InputSpec.of({
    name: Value.text({
      name: i18n('Name'),
      description: i18n('How the location is listed in NextExplorer'),
      required: true,
      default: null,
      patterns: [locationNamePattern],
    }),
  }),

  async () => null,

  async ({ effects, input }) => {
    const name = await checkNewLocationName(input.name)
    const path = sdk.volumes.data.subpath(name)
    await mkdir(path)
    await chown(path, 1000, 1000)

    return {
      version: '1',
      title: i18n('Location Added'),
      message: [
        i18n(
          '${name} is now listed under Locations. Accounts other than the admin see it only once you add it in their Volumes tab.',
          { name },
        ),
        await nextcloudHint(effects),
      ]
        .filter(Boolean)
        .join('\n\n'),
      result: null,
    }
  },
)
