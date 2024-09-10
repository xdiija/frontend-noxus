<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
        <q-space />
        <q-toolbar-title>
            Noxus Sistemas
        </q-toolbar-title>
        <q-space />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      bordered
    >
      <q-list>
        <q-item-label
          header
        >
          Menus
        </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
          @link-click="handleLinkClick"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
        <router-view :user="user"/>
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'
import authService from 'src/services/authService'
import { useRouter } from 'vue-router'

const linksList = [
    {
        title: 'Início',
        level: 0,
        caption: '',
        icon: 'home',
        route: '/',
        children: []
    },
    {
        title: 'Administrativo',
        level: 0,
        caption: '',
        icon: 'admin_panel_settings',
        children: [
            {
                title: 'Usuários',
                level: 1,
                caption: '',
                icon: 'manage_accounts',
                route: '/users',
                children: []
            },
            {
                title: 'Perfis',
                level: 1,
                caption: '',
                icon: 'groups',
                route: '/profiles',
                children: []
            }
        ]
    },
    {
        title: 'Logout',
        level: 0,
        caption: '',
        icon: 'exit_to_app',
        route: '/login',
        children: []
    }
]

export default defineComponent({
    name: 'MainLayout',

    components: {
        EssentialLink
    },

    setup () {
        const router = useRouter()
        const leftDrawerOpen = ref(false)
        const { getUser, clearAuth } = authService()
        const handleLinkClick = (route) => {
            if (route === 'login') {
                clearAuth()
                router.push({ name: 'login' })
            }
        }

        return {
            user: getUser(),
            essentialLinks: linksList,
            leftDrawerOpen,
            toggleLeftDrawer () {
                leftDrawerOpen.value = !leftDrawerOpen.value
            },
            handleLinkClick
        }
    }
})
</script>
