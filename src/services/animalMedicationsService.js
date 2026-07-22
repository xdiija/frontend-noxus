import useApi from 'src/composables/UseApi'

// Medication courses (animal_medications), nested under an animal — end_date
// null means the course is ongoing. Scoped by animalId; the backend enforces
// org scoping via the parent.
export default function animalMedicationsService(animalId) {
    const { list, post, update, destroy } = useApi(`animals/${animalId}/medications`)

    return {
        list,
        post,
        update,
        destroy
    }
}
