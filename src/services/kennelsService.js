import useApi from 'src/composables/UseApi'

// Organization-scoped entity resource (server-paginated). The API also returns
// open_stays_count so lists can show occupancy against capacity.
export default function kennelsService() {
    const { list, getByID, post, update, destroy } = useApi('kennels')

    // Form lookups ({statuses, sizes}) and a slim {id, name} animal picker,
    // both gated by the kennels permission so the form works without the
    // lookup/animals menu grants.
    const getFormOptions = () => list('/form-options')
    const listAnimalOptions = (filter = '') => list('/animal-options', { filter })

    return {
        list,
        getByID,
        post,
        update,
        destroy,
        getFormOptions,
        listAnimalOptions
    }
}
