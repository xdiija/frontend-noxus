import useApi from 'src/composables/UseApi'

export default function usersService () {
    const { list, getByID, post, update, remove } = useApi('users')

    return {
        list,
        getByID,
        post,
        update,
        remove
    }
}
