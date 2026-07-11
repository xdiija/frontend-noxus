import useApi from 'src/composables/UseApi'

// Configurable lookup (ADR-0004 amendment): list returns system defaults + the
// org's own rows. Pass { species_id } to list() to narrow by species (used by
// both this page's filter and the Animal form's species→breed cascade). Writes
// only ever touch the org's own rows (defaults are read-only).
export default function breedsService() {
    const { list, getByID, post, update, destroy } = useApi('breeds')

    return {
        list,
        getByID,
        post,
        update,
        destroy
    }
}
