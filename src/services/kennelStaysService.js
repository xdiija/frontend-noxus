import { api } from 'boot/axios'
import useApi from 'src/composables/UseApi'

// Kennel stays, nested under a kennel. Scoped by kennelId, which composes the
// base route; the backend enforces org scoping via the parent. closeStay sets
// the exit date; transferStay closes the stay and opens a new one in the
// target kennel in a single transaction.
export default function kennelStaysService(kennelId) {
    const { list, post, update, destroy } = useApi(`kennels/${kennelId}/stays`)

    const closeStay = (id, reqData) => api.put(`kennels/${kennelId}/stays/${id}/close`, reqData)
    const transferStay = (id, reqData) => api.put(`kennels/${kennelId}/stays/${id}/transfer`, reqData)

    return {
        list,
        post,
        update,
        destroy,
        closeStay,
        transferStay
    }
}
