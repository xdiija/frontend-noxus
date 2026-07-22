import useApi from 'src/composables/UseApi'

// Global read-only medication catalog (like species) — feeds the course form.
export default function medicationsService() {
    const { list } = useApi('medications')

    return {
        list
    }
}
