import { route } from 'quasar/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import authService from 'src/services/authService' // Adjust this path based on your project structure

export default route(function (/* { store, ssrContext } */) {
    const createHistory = process.env.SERVER
        ? createMemoryHistory
        : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

    const Router = createRouter({
        scrollBehavior: () => ({ left: 0, top: 0 }),
        routes,
        history: createHistory(process.env.VUE_ROUTER_BASE)
    })

    // Add navigation guard to check authentication
    Router.beforeEach(async (to, from, next) => {
        const auth = authService() // Initialize authService

        if (to.matched.some(record => record.meta.requiresAuth)) {
            if (!auth.isAuthenticated.value) {
                next({ name: 'login' }) // Redirect to login page if not authenticated
            } else {
                const tokenValid = await auth.verifyToken()
                if (!tokenValid) {
                    next({ name: 'login' }) // Redirect to login page if token is invalid
                } else {
                    next()
                }
            }
        } else {
            next()
        }
    })

    return Router
})
