import useApi from 'src/composables/UseApi'

// Applied vaccine doses (animal_vaccines), nested under an animal. Scoped by
// animalId; the backend enforces org scoping via the parent.
export default function animalVaccinesService(animalId) {
    const { list, post, update, destroy } = useApi(`animals/${animalId}/vaccines`)

    return {
        list,
        post,
        update,
        destroy
    }
}
