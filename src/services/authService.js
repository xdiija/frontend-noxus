import { ref, computed } from 'vue'
import useApi from 'src/composables/UseApi'

const token = ref(localStorage.getItem('token') || null)
const user = ref(JSON.parse(localStorage.getItem('user')) || null)
const menus = ref(JSON.parse(localStorage.getItem('menus')) || [])

export default function authService(url = '') {
    const { post } = useApi(`auth/${url}`)
    const meApi = useApi('auth/me')

    function setToken(tokenValue) {
        localStorage.setItem('token', tokenValue)
        token.value = tokenValue
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
        token.value = null
        user.value = null
        menus.value = null
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

    return {
        post,
        token,
        user,
        setToken,
        setUser,
        getUser,
        getMenus,
        setMenus,
        isAuthenticated,
        userName,
        userID,
        clearAuth,
        verifyToken
    }
}
