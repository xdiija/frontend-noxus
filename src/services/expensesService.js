import { api } from 'boot/axios'
import useApi from 'src/composables/UseApi'

// Organization-scoped entity resource (server-paginated, suppliers pattern).
// togglePaid hits the resource-specific PUT /expenses/{id}/paid route (the
// generic changeStatus verb is hardcoded to /{id}/status).
export default function expensesService() {
    const { list, getByID, post, update, destroy } = useApi('expenses')

    const togglePaid = async (id) => {
        return await api.put(`expenses/${id}/paid`)
    }

    return {
        list,
        getByID,
        post,
        update,
        togglePaid,
        destroy
    }
}
