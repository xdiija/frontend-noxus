import useApi from 'src/composables/UseApi'

// Organization-scoped entity resource (server-paginated). CPF is unique per org.
export default function adoptersService() {
    const { list, getByID, post, update, destroy } = useApi('adopters')

    return {
        list,
        getByID,
        post,
        update,
        destroy
    }
}
