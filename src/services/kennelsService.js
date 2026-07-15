import useApi from 'src/composables/UseApi'

// Organization-scoped entity resource (server-paginated). The API also returns
// open_stays_count so lists can show occupancy against capacity.
export default function kennelsService() {
    const { list, getByID, post, update, destroy } = useApi('kennels')

    return {
        list,
        getByID,
        post,
        update,
        destroy
    }
}
