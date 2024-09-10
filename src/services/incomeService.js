import useApi from 'src/composables/UseApi'

export default function incomeService () {
    const { list, getByID, post, update, remove } = useApi('incomes')

    return {
        list,
        getByID,
        post,
        update,
        remove
    }
}
