const routes = [
    {
        path: '/',
        redirect: 'home',
        component: () => import('layouts/MainLayout.vue'),
        meta: { requiresAuth: true },
        children: [
            {
                path: 'home',
                name: 'home',
                props: true,
                component: () => import('src/pages/HomePage.vue')
            },
            {
                path: 'users',
                name: 'users',
                component: () => import('src/pages/UsersPage.vue')
            },
            {
                path: 'users-form/:id?',
                name: 'usersForm',
                component: () => import('src/pages/UsersForm.vue')
            },
            {
                path: 'income',
                name: 'income',
                component: () => import('src/pages/IncomePage.vue')
            },
            {
                path: 'income-form/:id?',
                name: 'incomeForm',
                component: () => import('src/pages/IncomeForm.vue')
            }
        ]
    },
    {
        path: '/login',
        redirect: 'login',
        component: () => import('layouts/LoginLayout.vue'),
        children: [
            {
                path: '/login',
                name: 'login',
                component: () => import('pages/Login.vue')
            },
            {
                path: 'esqueci-minha-senha',
                name: 'esqueciSenha',
                component: () => import('pages/EsqueciSenha.vue')
            }
        ]
    },

    // Always leave this as last one, but you can also remove it.
    {
        path: '/:catchAll(.*)*',
        component: () => import('pages/ErrorNotFound.vue')
    }
]

export default routes
