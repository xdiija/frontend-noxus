import useApi from 'src/composables/UseApi'

// Global read-only vaccine catalog (like species) — feeds the applied-dose form.
export default function vaccinesService() {
    const { list } = useApi('vaccines')

    return {
        list
    }
}
