<template>
  <div class="fullscreen bg-primary text-white text-center q-pa-md flex flex-center">
    <div>
      <div style="font-size: 30vh">
        <img
          src="../assets/MykeErrorPage.png"
          alt="Error Image"
          style="width: 300px; height: auto; margin-right: 10px;"
        />
      </div>

      <div class="text-h2" style="opacity:.4">
        Ah nãooo! Você acabou se perdendo...
      </div>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="primary"
        unelevated
        to="/"
        label="Voltar ao inicio"
        no-caps
      />
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'ErrorNotFound'
})
</script>
