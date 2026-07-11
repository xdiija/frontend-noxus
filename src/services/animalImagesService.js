import { api } from 'boot/axios'

// Photos are a resource nested under an animal (animals/{id}/images). Upload is
// multipart; auth rides on the shared `api` instance (withCredentials), same as
// every other call. Returns axios promises so callers get { data } as usual.
export default function animalImagesService() {
    const list = (animalId) => api.get(`animals/${animalId}/images`)

    const upload = (animalId, file) => {
        const formData = new FormData()
        formData.append('image', file)
        return api.post(`animals/${animalId}/images`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    }

    const destroy = (animalId, imageId) => api.delete(`animals/${animalId}/images/${imageId}`)

    return { list, upload, destroy }
}
