import useApi from 'src/composables/UseApi'

// Organization-scoped entity resource (server-paginated). changeStatus posts a
// new status_id (+ optional notes) — the backend logs it in animal_status_history.
export default function animalsService() {
    const { list, getByID, post, update, changeStatus, destroy } = useApi('animals')

    return {
        list,
        getByID,
        post,
        update,
        changeStatus,
        destroy
    }
}
