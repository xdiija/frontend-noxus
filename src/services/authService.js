import { ref, computed } from 'vue'
import useApi from 'src/composables/UseApi'

const user = ref(JSON.parse(localStorage.getItem('user')) || null)
const menus = ref(JSON.parse(localStorage.getItem('menus')) || [])

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

    const isAuthenticated = computed(() => !!user.value)

    const userName = computed(() => user.value?.name || '')
    const userID = computed(() => user.value?.id || '')

    function clearAuth() {
        localStorage.removeItem('user')
        localStorage.removeItem('menus')
        user.value = null
        menus.value = []
    }

    async function verifyToken() {
        try {
            const { data } = await meApi.post()
            setUser(data)
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
        post,
        setUser,
        setMenus,
        getUser,
        getMenus,
        clearAuth,
        verifyToken,
        refreshToken
    }
}
