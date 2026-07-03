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
                path: 'my-account',
                name: 'my-account',
                component: () => import('src/pages/MyAccount.vue')
            },
            {
                path: 'users',
                name: 'users',
                component: () => import('src/pages/UsersPage.vue')
            },
            {
                path: 'users-form/:id?',
                name: 'usersForm',
                meta: { resource: 'users' },
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
                meta: { resource: 'roles' },
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
                meta: { resource: 'menus' },
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
                meta: { resource: 'accounts' },
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
                meta: { resource: 'customers' },
                component: () => import('src/pages/CustomersForm.vue')
            },
            {
                path: 'suppliers',
                name: 'suppliers',
                component: () => import('src/pages/SuppliersPage.vue')
            },
            {
                path: 'suppliers-form/:id?',
                name: 'suppliersForm',
                meta: { resource: 'suppliers' },
                component: () => import('src/pages/SuppliersForm.vue')
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
