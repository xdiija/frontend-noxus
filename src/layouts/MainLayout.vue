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

export default defineComponent({
    name: 'MainLayout',

    components: {
        EssentialLink
    },

    setup () {
        const router = useRouter()
        const leftDrawerOpen = ref(false)
        const { getUser, getMenus, clearAuth } = authService()
        const handleLinkClick = (route) => {
            if (route === 'login') {
                clearAuth()
                router.push({ name: 'login' })
            }
        }

        const prepareMenus = () => {
			const feMenus = []
			const beMenus = getMenus();
			
			beMenus.forEach(menu => {
				let feMenu = {
					title: menu.name,
					level: 0,
					caption: '',
					icon: menu.icon,
					route: menu.route,
					children: []
				}
				menu.children.forEach(childMenu => {
					let feChildMenu = {
						title: childMenu.name,
						level: 1,
						caption: '',
						icon: childMenu.icon,
						route: childMenu.route,
						children: []
					}
					feMenu.children.push(feChildMenu)
				})
				feMenus.push(feMenu)
			});
			return feMenus
        }

        return {
            user: getUser(),
            essentialLinks: prepareMenus(),
            leftDrawerOpen,
            toggleLeftDrawer () {
                leftDrawerOpen.value = !leftDrawerOpen.value
            },
            handleLinkClick
        }
    }
})
</script>
