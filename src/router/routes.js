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
                path: 'roles',
                name: 'roles',
                component: () => import('src/pages/RolesPage.vue')
            },
            {
                path: 'roles-form/:id?',
                name: 'rolesForm',
                component: () => import('src/pages/RolesForm.vue')
            },
            {
                path: 'menus',
                name: 'menus',
                component: () => import('src/pages/MenusPage.vue')
            },
            {
                path: 'menus-form/:id?',
                name: 'menusForm',
                component: () => import('src/pages/MenusForm.vue')
            },
            {
                path: 'accounts',
                name: 'accounts',
                component: () => import('src/pages/AccountsPage.vue')
            },
            {
                path: 'accounts-form/:id?',
                name: 'accountsForm',
                component: () => import('src/pages/AccountsForm.vue')
            },
            {
                path: 'customers',
                name: 'customers',
                component: () => import('src/pages/CustomersPage.vue')
            },
            {
                path: 'customers-form/:id?',
                name: 'customersForm',
                component: () => import('src/pages/CustomersForm.vue')
            },

            {
                path: 'payment-methods',
                name: 'paymentMethods',
                component: () => import('src/pages/PaymentMethodsPage.vue')
            },
            {
                path: 'payment-methods-form/:id?',
                name: 'paymentMethodsForm',
                component: () => import('src/pages/PaymentMethodsForm.vue')
            },
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
