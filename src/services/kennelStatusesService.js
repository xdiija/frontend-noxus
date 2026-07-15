import useApi from 'src/composables/UseApi'

// Read-only configurable lookup (system defaults + the org's own rows),
// consumed by the kennel form's status select.
export default function kennelStatusesService() {
    const { list } = useApi('kennel-statuses')

    return { list }
}
