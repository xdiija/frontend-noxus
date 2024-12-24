import useApi from 'src/composables/UseApi'

export default function menusService() {
    const { list, getByID, post, update, changeStatus } = useApi('menus')

    return {
        list,
        getByID,
        post,
        update,
        changeStatus
    }
}
