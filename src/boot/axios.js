import { boot } from 'quasar/wrappers'
import axios from 'axios'
import authService from 'src/services/authService'

const api = axios.create({
    baseURL: process.env.API_URL,
    withCredentials: true,
})

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 403) {
            const auth = authService()
            auth.clearAuth()
        }
        return Promise.reject(error)
    }
)

export default boot(({ app }) => {
    app.config.globalProperties.$axios = axios
    app.config.globalProperties.$api = api
})

export { api }