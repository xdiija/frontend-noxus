import useApi from 'src/composables/UseApi'

export default function customersService() {
    const { list, getByID, post, update, changeStatus, destroy } = useApi('customers')

    return {
        list,
        getByID,
        post,
        update,
        changeStatus,
        destroy
    }
}
