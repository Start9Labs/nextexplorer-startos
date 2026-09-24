import { rm } from 'node:fs/promises'
import { i18n } from '../../i18n'
import { sdk } from '../../sdk'
import { listLocations, nextcloudHint } from '../../utils'

const { InputSpec, Value, Variants } = sdk

const confirmSpec = (name: string) =>
  InputSpec.of({
    confirm: Value.text({
      name: i18n('Confirm'),
      description: i18n('Type ${name} to delete it and everything in it', {
        name,
      }),
      required: true,
      default: null,
      patterns: [
        {
          regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
          description: i18n('Must match the location name exactly'),
        },
      ],
    }),
  })

export const removeLocation = sdk.Action.withInput(
  'remove-location',

  async () => ({
    name: i18n('Remove Location'),
    description: i18n(
      'Delete one of the locations listed in NextExplorer, along with everything in it.',
    ),
    warning: i18n(
      'This permanently deletes the location and every file in it. It cannot be undone.',
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
              { name: l, spec: confirmSpec(l) },
            ]),
          ),
        ),
      }
    }),
  }),

  async () => null,

  async ({ effects, input }) => {
    const name = input.location.selection
    if (input.location.value.confirm !== name) {
      throw new Error(i18n('Must match the location name exactly'))
    }
    if (!(await listLocations()).includes(name)) {
      throw new Error(i18n('There is no location named ${name}', { name }))
    }
    await rm(sdk.volumes.data.subpath(name), { recursive: true })

    return {
      version: '1',
      title: i18n('Location Removed'),
      message: [
        i18n('${name} and everything in it have been deleted.', { name }),
        await nextcloudHint(effects),
      ]
        .filter(Boolean)
        .join('\n\n'),
      result: null,
    }
  },
)
