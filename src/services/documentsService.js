import { api } from 'boot/axios'
import useApi from 'src/composables/UseApi'

// Polymorphic documents (ADR-0005): top-level resource, optionally linked to
// an org record via documentable_type/documentable_id. Upload is multipart
// (like animal images); list/update/destroy ride on the shared useApi verbs.
export default function documentsService() {
    const { list, update, destroy } = useApi('documents')

    const upload = ({ file, type, documentableType, documentableId }) => {
        const formData = new FormData()
        formData.append('file', file)
        if (type) formData.append('type', type)
        if (documentableType && documentableId) {
            formData.append('documentable_type', documentableType)
            formData.append('documentable_id', documentableId)
        }
        return api.post('documents', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    }

    return { list, upload, update, destroy }
}
