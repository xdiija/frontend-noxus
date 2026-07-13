import useApi from 'src/composables/UseApi'

// Organization-scoped entity resource (server-paginated). The API also returns
// open_placements_count so lists can show occupancy against capacity.
export default function fosterHomesService() {
    const { list, getByID, post, update, destroy } = useApi('foster-homes')

    return {
        list,
        getByID,
        post,
        update,
        destroy
    }
}
