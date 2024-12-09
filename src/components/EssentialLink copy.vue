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
  
      <q-drawer v-model="leftDrawerOpen" bordered>
        <q-list>
          <q-item-label header>Menus</q-item-label>
          <EssentialLink
            v-for="link in essentialLinks"
            :key="link.id"
            v-bind="link"
            @link-click="handleLinkClick"
          />
        </q-list>
      </q-drawer>
  
      <q-page-container>
        <router-view :user="user" />
      </q-page-container>
    </q-layout>
  </template>
  
  <script>
  import { defineComponent, ref, onMounted } from 'vue';
  import EssentialLink from 'components/EssentialLink.vue';
  import authService from 'src/services/authService';
  import { useRouter } from 'vue-router';
  
  export default defineComponent({
    name: 'MainLayout',
    components: {
      EssentialLink,
    },
    setup() {
      const router = useRouter();
      const leftDrawerOpen = ref(false);
      const { getUser, getMenus, clearAuth } = authService();
      const user = ref(getUser());
      const essentialLinks = ref([]);
  
      onMounted(() => {
        essentialLinks.value = getMenus();
      });
  
      const handleLinkClick = (route) => {
        if (route === '/login') {
          clearAuth();
          router.push({ name: 'login' });
        }
      };
  
      return {
        user,
        essentialLinks,
        leftDrawerOpen,
        toggleLeftDrawer() {
          leftDrawerOpen.value = !leftDrawerOpen.value;
        },
        handleLinkClick,
      };
    },
  });
  </script>