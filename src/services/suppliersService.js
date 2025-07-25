import useApi from 'src/composables/UseApi'

export default function suppliersService() {
    const { list, getByID, post, update, changeStatus, destroy } = useApi('suppliers')

    return {
        list,
        getByID,
        post,
        update,
        changeStatus,
        destroy
    }
}
