import useApi from 'src/composables/UseApi'

export default function rolesService() {
    const { list, getByID, post, update, changeStatus, destroy } = useApi('roles')

    return {
        list,
        getByID,
        post,
        update,
        changeStatus,
        destroy
    }
}
