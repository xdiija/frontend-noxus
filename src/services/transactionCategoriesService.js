import useApi from 'src/composables/UseApi'

export default function transactionCategoriesService() {
    const { list, getByID, post, update, changeStatus, destroy } = useApi('transaction-categories')

    return {
        list,
        getByID,
        post,
        update,
        changeStatus,
        destroy
    }
}
