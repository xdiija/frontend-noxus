import useApi from 'src/composables/UseApi'

// Configurable lookup: list returns system defaults + the org's own rows.
// Writes only ever touch the org's own rows (defaults are read-only).
export default function tagsService() {
    const { list, getByID, post, update, destroy } = useApi('tags')

    return {
        list,
        getByID,
        post,
        update,
        destroy
    }
}
