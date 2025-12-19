import useApi from 'src/composables/UseApi'

export default function banksService() {
    const { list, getByID, post, update, changeStatus, destroy } = useApi('banks')

    return {
        list,
        getByID,
        post,
        update,
        changeStatus,
        destroy
    }
}
