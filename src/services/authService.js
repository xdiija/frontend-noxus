import { ref, computed } from 'vue'
import useApi from 'src/composables/UseApi'

const user = ref(JSON.parse(localStorage.getItem('user')) || null)
const menus = ref(JSON.parse(localStorage.getItem('menus')) || [])
const permissions = ref(JSON.parse(localStorage.getItem('permissions')) || {})

export default function authService(url = '') {
    const { post } = useApi(`auth/${url}`)
    const meApi = useApi('auth/me')
    const refreshApi = useApi('auth/refresh')

    function setUser(userValue) {
        localStorage.setItem('user', JSON.stringify(userValue))
        user.value = userValue
    }

    function setMenus(menusValue) {
        localStorage.setItem('menus', JSON.stringify(menusValue))
        menus.value = menusValue
    }

    function getUser() {
        return user.value
    }

    function getMenus() {
        return menus.value
    }

    function setPermissions(permissionsValue) {
        const value = permissionsValue || {}
        localStorage.setItem('permissions', JSON.stringify(value))
        permissions.value = value
    }

    function getPermissions() {
        return permissions.value
    }

    const isAuthenticated = computed(() => !!user.value)

    const userName = computed(() => user.value?.name || '')
    const userID = computed(() => user.value?.id || '')

    function clearAuth() {
        localStorage.removeItem('user')
        localStorage.removeItem('menus')
        localStorage.removeItem('permissions')
        user.value = null
        menus.value = []
        permissions.value = {}
    }

    async function verifyToken() {
        try {
            const { data } = await meApi.post()
            setUser(data)
            setPermissions(data.permissions)
            return true
        } catch (error) {
            clearAuth()
            return false
        }
    }

    async function refreshToken() {
        try {
            await refreshApi.post()
        } catch (error) {
            clearAuth()
        }
    }

    return {
        isAuthenticated,
        userName,
        userID,
        user,
        menus,
        permissions,
        post,
        setUser,
        setMenus,
        setPermissions,
        getUser,
        getMenus,
        getPermissions,
        clearAuth,
        verifyToken,
        refreshToken
    }
}
