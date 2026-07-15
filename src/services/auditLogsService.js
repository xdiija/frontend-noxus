import useApi from 'src/composables/UseApi'

// Audit trail is read-only: rows are written by the backend on every
// create/update/delete, the UI only lists them.
export default function auditLogsService() {
    const { list } = useApi('audit-logs')
    return { list }
}
