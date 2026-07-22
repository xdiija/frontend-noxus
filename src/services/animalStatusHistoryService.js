import useApi from 'src/composables/UseApi'

// Append-only status transition log, nested under an animal. Read-only: rows
// are written by animalsService().changeStatus, never through this service.
export default function animalStatusHistoryService(animalId) {
    const { list } = useApi(`animals/${animalId}/status-history`)

    return {
        list
    }
}
