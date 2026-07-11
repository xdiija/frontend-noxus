import useApi from 'src/composables/UseApi'

// Post-adoption follow-ups, nested under an adoption. Scoped by adoptionId, which
// composes the base route; the backend enforces org scoping via the parent.
export default function adoptionFollowUpsService(adoptionId) {
    const { list, post, update, destroy } = useApi(`adoptions/${adoptionId}/follow-ups`)

    return {
        list,
        post,
        update,
        destroy
    }
}
