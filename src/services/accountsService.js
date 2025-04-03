import useApi from 'src/composables/UseApi'

export default function incomeService() {

    const { list, getByID, post, update, changeStatus, destroy } = useApi('accounts')

    return {
        list,
        getByID,
        post,
        update,
        changeStatus,
        destroy
    }
}
