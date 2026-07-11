import useApi from 'src/composables/UseApi'

// Read-only lookup: list returns the system defaults + the org's own rows.
// Consumed by the adoption form's status select.
export default function adoptionStatusesService() {
    const { list } = useApi('adoption-statuses')

    return { list }
}
