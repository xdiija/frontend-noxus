import useApi from 'src/composables/UseApi'

// Read-only lookup: list returns the system defaults + the org's own rows.
// Consumed by the follow-up form's status select (distinct from adoption status).
export default function adoptionFollowUpStatusesService() {
    const { list } = useApi('adoption-follow-up-statuses')

    return { list }
}
