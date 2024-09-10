<template>
    <header class="app-header">
        <div>
            <span class="text-h5">
                <q-icon
                    :name="icon"
                    class="header-icon"
                    v-if="icon"
                />
                {{ title }}
            </span>
            <q-btn
                color="primary"
                :icon="btIcon"
                :label="btnName"
                :to="{ name: btnTo }"
            />
        </div>
    </header>
  </template>
<script>
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'ViewHeader',
    props: {
        title: {
            type: String,
            required: true
        },
        btnName: {
            type: String,
            default: ''
        },
        btnTo: {
            type: String,
            default: ''
        },
        icon: {
            type: String,
            default: ''
        },
        btIcon: {
            type: String,
            default: ''
        }
    },
    computed: {
        hasChildren () {
            return this.children.length > 0
        }
    },
    methods: {
        handleClick () {
            this.$emit('link-click', this.route)
        }
    }
})
</script>

  <style scoped>
  .app-header {
    padding-bottom: 15px;
  }
  .app-header div {
    display: flex;
    justify-content: space-between
  }
  </style>
