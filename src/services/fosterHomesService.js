import useApi from 'src/composables/UseApi'

// Organization-scoped entity resource (server-paginated). The API also returns
// open_placements_count so lists can show occupancy against capacity.
export default function fosterHomesService() {
    const { list, getByID, post, update, destroy } = useApi('foster-homes')

    // Slim {id, name} animal picker gated by the foster-homes permission, so
    // the placement dialog works without the animals menu grant.
    const listAnimalOptions = (filter = '') => list('/animal-options', { filter })

    return {
        list,
        getByID,
        post,
        update,
        destroy,
        listAnimalOptions
    }
}
