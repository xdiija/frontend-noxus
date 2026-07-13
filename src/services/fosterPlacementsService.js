import { api } from 'boot/axios'
import useApi from 'src/composables/UseApi'

// Foster stays (placements), nested under a foster home. Scoped by fosterHomeId,
// which composes the base route; the backend enforces org scoping via the parent.
// closePlacement hits the dedicated close endpoint, which sets the exit date and
// syncs the animal's status on the backend.
export default function fosterPlacementsService(fosterHomeId) {
    const { list, post, update, destroy } = useApi(`foster-homes/${fosterHomeId}/placements`)

    const closePlacement = (id, reqData) => api.put(`foster-homes/${fosterHomeId}/placements/${id}/close`, reqData)

    return {
        list,
        post,
        update,
        destroy,
        closePlacement
    }
}
