import useApi from 'src/composables/UseApi'

// Tenant management (server-paginated). Noxus-only: the /organizations menu is
// exclusive_noxus and the API blocks every non-Noxus role.
export default function organizationsService() {
    const { list, getByID, post, update, destroy } = useApi('organizations')

    return {
        list,
        getByID,
        post,
        update,
        destroy
    }
}
