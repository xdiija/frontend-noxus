import { ref, computed } from 'vue'
import useApi from 'src/composables/UseApi'

const token = ref(localStorage.getItem('token') || null)
const tokenRefreshTime = ref(localStorage.getItem('refresh_time') || null)
const user = ref(JSON.parse(localStorage.getItem('user')) || null)
const menus = ref(JSON.parse(localStorage.getItem('menus')) || [])

export default function authService(url = '') {
    const { post } = useApi(`auth/${url}`)
    const meApi = useApi('auth/me')
    const refreshApi = useApi('auth/refresh')

    function setToken(tokenValue, expiresInSeconds) {
        localStorage.setItem('token', tokenValue)
        token.value = tokenValue

        const expiresInMinutes = expiresInSeconds / 60
        const halfExpiresInMinutes = expiresInMinutes / 2
        const refreshTime = new Date()
        refreshTime.setMinutes(refreshTime.getMinutes() + Math.floor(halfExpiresInMinutes))
        localStorage.setItem('refresh_time', refreshTime)
        tokenRefreshTime.value = refreshTime
    }

    function setUser(userValue) {
        localStorage.setItem('user', JSON.stringify(userValue))
        user.value = userValue
    }

    function setMenus(MenusValue) {
        localStorage.setItem('menus', JSON.stringify(MenusValue))
        menus.value = MenusValue
    }

    function getUser() {
        return user.value
    }

    function getMenus() {
        return menus.value
    }

    const isAuthenticated = computed(() => {
        return !!token.value && !!user.value
    })

    const userName = computed(() => {
        return user.value ? `${user.value.name}` : ''
    })

    const userID = computed(() => {
        return user.value ? `${user.value.id}` : ''
    })

    function clearAuth() {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('menus')
        localStorage.removeItem('refresh_time')
        token.value = null
        user.value = null
        menus.value = null
        tokenRefreshTime.value = null
    }

    async function verifyToken() {
        if (!token.value) return false

        try {
            await meApi.post()
            return true
        } catch (error) {
            clearAuth()
            return false
        }
    }

    async function refreshToken() {
        const currentDateTime = new Date()

        if (currentDateTime >= tokenRefreshTime.value) {
            const { data } = await refreshApi.post()
            setToken(data.access_token, data.expires_in)
        }

        return true
    }

    return {
        isAuthenticated,
        userName,
        userID,
        tokenRefreshTime,
        token,
        user,
        post,
        setToken,
        setUser,
        getUser,
        getMenus,
        setMenus,
        clearAuth,
        verifyToken,
        refreshToken
    }
}
