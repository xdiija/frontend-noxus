import useApi from 'src/composables/UseApi'

export default function paymentMethodsService() {
    const { list, getByID, post, update, changeStatus, destroy } = useApi('payment-methods')

    return {
        list,
        getByID,
        post,
        update,
        changeStatus,
        destroy
    }
}
