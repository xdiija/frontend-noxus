import authService from 'src/services/authService'

/**
 * Per-resource permission checks for the current user.
 * `resource` is the menu route without its leading slash (e.g. 'users').
 * Backed by the permissions map returned on login / auth/me.
 */
export default function usePermissions() {
    const { getPermissions } = authService()

    const can = (resource, action) => !!getPermissions()?.[resource]?.[action]

    const canView = (resource) => can(resource, 'view')
    const canCreate = (resource) => can(resource, 'create')
    const canUpdate = (resource) => can(resource, 'update')

    return { can, canView, canCreate, canUpdate }
}
