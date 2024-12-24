<template>
    <div>
        <div v-if="children.length == 0">
            <q-item
                clickable
                v-ripple
                :to="route"
                :inset-level="level"
                exact
                @click="handleClick">
                <q-item-section v-if="icon" avatar>
                    <q-icon :name="icon"/>
                </q-item-section>
                <q-item-section>
                    <q-item-label>{{ title }}</q-item-label>
                    <q-item-label caption>{{ caption }}</q-item-label>
                </q-item-section>
            </q-item>
        </div>
        <div v-else>
            <div v-if="children.length > 0">
                <q-expansion-item
                    expand-separator
                    :icon="icon"
                    :label="title"
                    :caption="caption"
                    :header-inset-level="level"
                    default-closed>
                    <EssentialLink
                        v-for="child in children"
                        :key="child"
                        v-bind="child">
                    </EssentialLink>
                </q-expansion-item>
            </div>
            <div v-else>
                <q-item clickable v-ripple :inset-level="level">
                <q-item-section>{{title}}</q-item-section>
                </q-item>
            </div>
        </div>
    </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'EssentialLink',
    props: {
        title: {
            type: String,
            required: true
        },

        caption: {
            type: String,
            default: ''
        },

        route: {
            type: String,
            default: ''
        },

        icon: {
            type: String,
            default: ''
        },
        level: {
            type: Number,
            default: 0
        },
        children: {
            type: Array,
            default: () => []
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
