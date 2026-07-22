import useApi from 'src/composables/UseApi'

// Organization-scoped entity resource (server-paginated, suppliers pattern).
export default function donationsService() {
    const { list, getByID, post, update, destroy } = useApi('donations')

    // Slim {id, name} donor picker gated by the donations permission, so the
    // form works without the donors menu grant.
    const listDonorOptions = (filter = '') => list('/donor-options', { filter })

    return {
        list,
        getByID,
        post,
        update,
        destroy,
        listDonorOptions
    }
}
