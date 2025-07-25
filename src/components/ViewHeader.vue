<template>
    <header class="app-header">
        <div>
            <span class="text-h5">
                {{ title }}
            </span>
            <q-btn
                color="primary"
                :icon="btnIcon"
                :label="btnName"
                :to="customClick ? undefined : { name: btnTo }"
                @click="customClick ? $emit('custom-click') : null"
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
        btnIcon: {
            type: String,
            default: ''
        },
        customClick: {
            type: Boolean,
            default: false
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
