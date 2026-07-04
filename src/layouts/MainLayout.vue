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
				>
					<q-tooltip class="bg-primary">Menus</q-tooltip>
                </q-btn>
        		<q-space />
				<q-toolbar-title>
					Noxus Sistemas
				</q-toolbar-title>
        		<q-space />
				<q-btn
					flat
					dense
					round
					icon="account_circle"
					@click="myAccount"
				>
					<q-tooltip class="bg-primary">Minha Conta</q-tooltip>
                </q-btn>

      		</q-toolbar>
    	</q-header>
    	<q-drawer v-model="leftDrawerOpen" bordered >
      		<q-list>
				<q-item-label header >
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
        const leftDrawerOpen = ref(true)
        const { post, getUser, getMenus, clearAuth } = authService('logout')
        const handleLinkClick = async (route) => {
			if (route === '/logout' || route === '/login') {
				try {
					await post()
				} catch (e) {
					console.error('Failed to call backend logout', e)
				}
				clearAuth()
				router.push({ name: 'login' })
			}
        }

    	const prepareMenus = () => {
			const links = [
				newLink({name: "Início", icon: "home", route: "/"}, 0)
			]
			const menus = getMenus();
			
			menus.forEach(menu => {
	
				const link = newLink(menu , 0)

				;(menu.children || []).forEach(childMenu => {
					const childLink = newLink(childMenu , 1)
					link.children.push(childLink)
				})

				// Skip container menus (no route) that ended up with no visible children,
				// otherwise EssentialLink renders a dead clickable item pointing nowhere.
				if (!link.route && link.children.length === 0) {
					return
				}

				links.push(link)
			});

			links.push(shelterMenu())

			links.push(newLink({ name: "Logout", icon: "exit_to_app", route: "/logout" }, 0))

			return links
        }

		// Shelter module (Module 1) reference-data menu. Added statically because
		// roles/permissions for shelter resources are deferred — these pages
		// aren't served through the permission-gated backend menu yet.
		const shelterMenu = () => {
			const group = newLink({ name: "Abrigo", icon: "pets", route: null }, 0)

			group.children.push(newLink({ name: "Portes", icon: "straighten", route: "/animal-sizes" }, 1))
			group.children.push(newLink({ name: "Status dos Animais", icon: "flag", route: "/animal-statuses" }, 1))
			group.children.push(newLink({ name: "Etiquetas", icon: "sell", route: "/tags" }, 1))

			return group
		}

		const newLink = (menu, level) => {
			
			return {
				title: menu.name,
				level: level,
				caption: '',
				icon: menu.icon,
				route: menu.route,
				children: []
			}
		}

        return {
            user: getUser(),
            essentialLinks: prepareMenus(),
            leftDrawerOpen,
            toggleLeftDrawer () {
                leftDrawerOpen.value = !leftDrawerOpen.value
            },
			myAccount () {
				router.push({ name: 'my-account' })
			},
            handleLinkClick,
			newLink
        }
    }
})
</script>
