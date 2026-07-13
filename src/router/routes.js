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
            },
            // Organizations (tenant management) — Noxus-only menu (exclusive_noxus)
            {
                path: 'organizations',
                name: 'organizations',
                component: () => import('src/pages/OrganizationsPage.vue')
            },
            {
                path: 'organizations-form/:id?',
                name: 'organizationsForm',
                meta: { resource: 'organizations' },
                component: () => import('src/pages/OrganizationsForm.vue')
            },
            // Shelter module — animals (Module 2)
            {
                path: 'animals',
                name: 'animals',
                component: () => import('src/pages/AnimalsPage.vue')
            },
            {
                path: 'animals-form/:id?',
                name: 'animalsForm',
                meta: { resource: 'animals' },
                component: () => import('src/pages/AnimalsForm.vue')
            },
            // Shelter module — adoptions (Module 3)
            {
                path: 'adopters',
                name: 'adopters',
                component: () => import('src/pages/AdoptersPage.vue')
            },
            {
                path: 'adopters-form/:id?',
                name: 'adoptersForm',
                meta: { resource: 'adopters' },
                component: () => import('src/pages/AdoptersForm.vue')
            },
            {
                path: 'adoptions',
                name: 'adoptions',
                component: () => import('src/pages/AdoptionsPage.vue')
            },
            {
                path: 'adoptions-form/:id?',
                name: 'adoptionsForm',
                meta: { resource: 'adoptions' },
                component: () => import('src/pages/AdoptionsForm.vue')
            },
            // Shelter module — fostering & volunteers (Module 5)
            {
                path: 'foster-homes',
                name: 'fosterHomes',
                component: () => import('src/pages/FosterHomesPage.vue')
            },
            {
                path: 'foster-homes-form/:id?',
                name: 'fosterHomesForm',
                meta: { resource: 'foster-homes' },
                component: () => import('src/pages/FosterHomesForm.vue')
            },
            {
                path: 'volunteers',
                name: 'volunteers',
                component: () => import('src/pages/VolunteersPage.vue')
            },
            {
                path: 'volunteers-form/:id?',
                name: 'volunteersForm',
                meta: { resource: 'volunteers' },
                component: () => import('src/pages/VolunteersForm.vue')
            },
            // Shelter module — animal reference data (Module 1 lookups)
            {
                path: 'breeds',
                name: 'breeds',
                component: () => import('src/pages/BreedsPage.vue')
            },
            {
                path: 'breeds-form/:id?',
                name: 'breedsForm',
                meta: { resource: 'breeds' },
                component: () => import('src/pages/BreedsForm.vue')
            },
            {
                path: 'animal-sizes',
                name: 'animalSizes',
                component: () => import('src/pages/AnimalSizesPage.vue')
            },
            {
                path: 'animal-sizes-form/:id?',
                name: 'animalSizesForm',
                meta: { resource: 'animal-sizes' },
                component: () => import('src/pages/AnimalSizesForm.vue')
            },
            {
                path: 'animal-statuses',
                name: 'animalStatuses',
                component: () => import('src/pages/AnimalStatusesPage.vue')
            },
            {
                path: 'animal-statuses-form/:id?',
                name: 'animalStatusesForm',
                meta: { resource: 'animal-statuses' },
                component: () => import('src/pages/AnimalStatusesForm.vue')
            },
            {
                path: 'tags',
                name: 'tags',
                component: () => import('src/pages/TagsPage.vue')
            },
            {
                path: 'tags-form/:id?',
                name: 'tagsForm',
                meta: { resource: 'tags' },
                component: () => import('src/pages/TagsForm.vue')
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
