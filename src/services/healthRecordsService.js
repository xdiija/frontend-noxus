import useApi from 'src/composables/UseApi'

// Clinical history entries, nested under an animal. Scoped by animalId, which
// composes the base route; the backend enforces org scoping via the parent.
export default function healthRecordsService(animalId) {
    const { list, post, update, destroy } = useApi(`animals/${animalId}/health-records`)

    return {
        list,
        post,
        update,
        destroy
    }
}
