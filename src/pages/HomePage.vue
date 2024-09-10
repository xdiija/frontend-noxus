<template>
  <q-page class="flex flex-center">
    <h4 v-if="user">Olá {{ user.name }}</h4>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'HomePage',
    props: ['user']
})
</script>
