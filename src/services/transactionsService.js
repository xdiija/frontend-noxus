import useApi from 'src/composables/UseApi'

export default function transactionsService() {
    const { list, getByID, post, update, changeStatus, destroy } = useApi('transactions')

    return {
        list,
        getByID,
        post,
        update,
        changeStatus,
        destroy
    }
}
