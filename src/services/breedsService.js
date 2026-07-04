import useApi from 'src/composables/UseApi'

// Global reference data (read-only). Pass { species_id } to list() to narrow the
// breeds to a single species for the Animal form's cascade.
export default function breedsService() {
    const { list } = useApi('breeds')

    return {
        list
    }
}
