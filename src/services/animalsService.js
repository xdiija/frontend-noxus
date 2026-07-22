import useApi from 'src/composables/UseApi'

// Organization-scoped entity resource (server-paginated). changeStatus posts a
// new status_id (+ optional notes) — the backend logs it in animal_status_history.
// listStatusOptions reads the status lookup through the animals permission, so
// consumers don't need the animal-statuses grant.
export default function animalsService() {
    const { list, getByID, post, update, changeStatus, destroy } = useApi('animals')

    const listStatusOptions = () => list('/status-options')

    // { species, sizes, statuses, tags } for the Animal form, in one call.
    const getFormOptions = () => list('/form-options')

    return {
        list,
        getByID,
        post,
        update,
        changeStatus,
        destroy,
        listStatusOptions,
        getFormOptions
    }
}
