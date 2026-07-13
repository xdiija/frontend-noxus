import useApi from 'src/composables/UseApi'

// Organization-scoped entity resource (server-paginated), with the
// active/inactive status toggle (suppliers pattern).
export default function volunteersService() {
    const { list, getByID, post, update, changeStatus, destroy } = useApi('volunteers')

    return {
        list,
        getByID,
        post,
        update,
        changeStatus,
        destroy
    }
}
