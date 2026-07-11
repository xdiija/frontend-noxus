import { api } from 'boot/axios'
import useApi from 'src/composables/UseApi'

// Organization-scoped entity resource (server-paginated). Beyond CRUD it exposes
// the adopt/return/cancel workflow: returnAdoption / cancelAdoption hit dedicated
// endpoints that also sync the animal's status on the backend.
export default function adoptionsService() {
    const { list, getByID, post, update, destroy } = useApi('adoptions')

    const returnAdoption = (id, reqData) => api.put(`adoptions/${id}/return`, reqData)
    const cancelAdoption = (id, reqData) => api.put(`adoptions/${id}/cancel`, reqData)

    return {
        list,
        getByID,
        post,
        update,
        destroy,
        returnAdoption,
        cancelAdoption
    }
}
