import { boot } from 'quasar/wrappers'
import axios from 'axios'
import notifications from 'src/utils/notifications'

const api = axios.create({
    baseURL: process.env.API_URL,
    withCredentials: true
})

export default boot(({ app, router }) => {
    // 403 = authenticated but no permission (e.g. hitting a URL directly).
    // Keep the session, warn in yellow, and send the user back to home —
    // do NOT log them out.
    api.interceptors.response.use(
        response => response,
        error => {
            if (error.response && error.response.status === 403) {
                const { notifyError } = notifications()
                notifyError(
                    error.response.data?.error ||
                    'Você não tem permissão para acessar este conteúdo.'
                )

                if (router.currentRoute.value.name !== 'home') {
                    router.push({ name: 'home' })
                }
            }
            return Promise.reject(error)
        }
    )

    app.config.globalProperties.$axios = axios
    app.config.globalProperties.$api = api
})

export { api }
