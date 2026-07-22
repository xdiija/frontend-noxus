import useApi from 'src/composables/UseApi'

// Surgeries, nested under an animal. Scoped by animalId; the backend enforces
// org scoping via the parent. A store/update with is_castration = true also
// marks the animal as neutered server-side (health.md invariant).
export default function surgeriesService(animalId) {
    const { list, post, update, destroy } = useApi(`animals/${animalId}/surgeries`)

    return {
        list,
        post,
        update,
        destroy
    }
}
