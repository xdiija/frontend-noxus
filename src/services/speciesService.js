import useApi from 'src/composables/UseApi'

// Global reference data (read-only). Consumed by the Animal form's species/breed
// cascade — there is no management page.
export default function speciesService() {
    const { list } = useApi('species')

    return {
        list
    }
}
