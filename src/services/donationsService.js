import useApi from 'src/composables/UseApi'

// Organization-scoped entity resource (server-paginated, suppliers pattern).
export default function donationsService() {
    const { list, getByID, post, update, destroy } = useApi('donations')

    return {
        list,
        getByID,
        post,
        update,
        destroy
    }
}
