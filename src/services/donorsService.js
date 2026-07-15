import useApi from 'src/composables/UseApi'

// Organization-scoped entity resource (server-paginated, suppliers pattern).
export default function donorsService() {
    const { list, getByID, post, update, destroy } = useApi('donors')

    return {
        list,
        getByID,
        post,
        update,
        destroy
    }
}
