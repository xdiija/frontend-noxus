import useApi from 'src/composables/UseApi'

// Vet appointments, nested under an animal. Scoped by animalId; the backend
// enforces org scoping via the parent.
export default function appointmentsService(animalId) {
    const { list, post, update, destroy } = useApi(`animals/${animalId}/appointments`)

    return {
        list,
        post,
        update,
        destroy
    }
}
