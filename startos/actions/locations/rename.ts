import { rename } from 'node:fs/promises'
import { i18n } from '../../i18n'
import { sdk } from '../../sdk'
import {
  checkNewLocationName,
  listLocations,
  locationNamePattern,
  nextcloudHint,
} from '../../utils'

const { InputSpec, Value, Variants } = sdk

const newNameSpec = (current: string) =>
  InputSpec.of({
    newName: Value.text({
      name: i18n('New Name'),
      description: null,
      required: true,
      default: current,
      patterns: [locationNamePattern],
    }),
  })

export const renameLocation = sdk.Action.withInput(
  'rename-location',

  async () => ({
    name: i18n('Rename Location'),
    description: i18n('Rename one of the locations listed in NextExplorer.'),
    warning: i18n(
      'Anything that refers to the location by name stops finding it: accounts you gave it to in their Volumes tab, share links to files inside it, and other services pointed at it. Add it to those accounts again and point those services at the new name.',
    ),
    allowedStatuses: 'any',
    group: i18n('Locations'),
    visibility: 'enabled',
  }),

  InputSpec.of({
    location: Value.dynamicUnion(async () => {
      const locations = await listLocations()
      return {
        name: i18n('Location'),
        default: locations[0] ?? '',
        disabled: locations.length ? false : i18n('There are no locations'),
        variants: Variants.of(
          Object.fromEntries(
            (locations.length ? locations : ['']).map((l) => [
              l,
              { name: l, spec: newNameSpec(l) },
            ]),
          ),
        ),
      }
    }),
  }),

  async () => null,

  async ({ effects, input }) => {
    const from = input.location.selection
    if (!(await listLocations()).includes(from)) {
      throw new Error(
        i18n('There is no location named ${name}', { name: from }),
      )
    }
    if (input.location.value.newName.trim() === from) {
      throw new Error(i18n('Enter a name different from the current one'))
    }
    const to = await checkNewLocationName(input.location.value.newName)
    await rename(sdk.volumes.data.subpath(from), sdk.volumes.data.subpath(to))

    return {
      version: '1',
      title: i18n('Location Renamed'),
      message: [
        i18n('${from} is now ${to}.', { from, to }),
        await nextcloudHint(effects),
      ]
        .filter(Boolean)
        .join('\n\n'),
      result: null,
    }
  },
)
