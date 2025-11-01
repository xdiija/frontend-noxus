import useApi from 'src/composables/UseApi'

export default function costsCentersService() {
    const { list, getByID, post, update, changeStatus, destroy } = useApi('cost-centers')

    return {
        list,
        getByID,
        post,
        update,
        changeStatus,
        destroy
    }
}
