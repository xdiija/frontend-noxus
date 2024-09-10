import useApi from 'src/composables/UseApi'

export default function rolesService() {
    const { list, getByID, post, update, remove } = useApi('roles')

    return {
        list,
        getByID,
        post,
        update,
        remove
    }
}
