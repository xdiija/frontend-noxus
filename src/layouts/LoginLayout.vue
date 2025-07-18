<template>
  <q-layout view="lHh Lpr lFf"
    style="background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-primary) 100%); min-height: 100vh;"
    >

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>

export default {
  name: 'MainLayout',

  components: {
  },

  setup () {
    return {}
  }
}
</script>
