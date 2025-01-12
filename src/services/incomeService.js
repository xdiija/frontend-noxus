import useApi from 'src/composables/UseApi'

export default function incomeService() {
    const { list, getByID, post, update, destroy } = useApi('incomes')

    return {
        list,
        getByID,
        post,
        update,
        destroy
    }
}
