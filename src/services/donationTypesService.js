import useApi from 'src/composables/UseApi'

// Read-only lookup: list returns the system defaults + the org's own rows.
// Consumed by the donation form's type select.
export default function donationTypesService() {
    const { list } = useApi('donation-types')

    return { list }
}
