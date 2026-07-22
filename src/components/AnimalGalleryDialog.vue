<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide" maximized>
        <q-card class="q-dialog-plugin column no-wrap bg-black text-white">
            <q-bar class="bg-black text-white">
                <div class="text-subtitle1">{{ title }}</div>
                <q-space />
                <q-btn dense flat round icon="close" @click="onDialogCancel" />
            </q-bar>

            <q-card-section v-if="loading" class="col column flex-center">
                <q-spinner color="white" size="48px" />
            </q-card-section>

            <template v-else-if="images.length">
                <q-carousel
                    v-model="slide"
                    animated
                    arrows
                    navigation
                    infinite
                    swipeable
                    class="col bg-black"
                >
                    <q-carousel-slide
                        v-for="img in images"
                        :key="img.id"
                        :name="img.id"
                        class="column no-wrap flex-center q-pa-none"
                    >
                        <q-img :src="img.url" fit="contain" style="height: 100%; width: 100%" />
                    </q-carousel-slide>
                </q-carousel>

                <div v-if="images.length > 1" class="row justify-center q-gutter-xs q-pa-sm bg-black">
                    <q-img
                        v-for="img in images"
                        :key="`thumb-${img.id}`"
                        :src="img.url"
                        width="56px"
                        height="56px"
                        class="rounded-borders cursor-pointer thumb"
                        :class="{ 'thumb-active': img.id === slide }"
                        @click="slide = img.id"
                    />
                </div>
            </template>

            <q-card-section v-else class="col column flex-center text-center text-grey-4">
                <q-icon name="image_not_supported" size="80px" />
                <div class="text-subtitle1 q-mt-md">Nenhuma foto cadastrada</div>
                <div class="text-caption">Este animal ainda não possui fotos cadastradas.</div>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import animalImagesService from 'src/services/animalImagesService'

/**
 * Read-only photo gallery, invoked via the Quasar Dialog plugin. No onOk
 * value — it's a viewer, so the caller doesn't chain .onOk().
 *
 *   $q.dialog({
 *     component: AnimalGalleryDialog,
 *     componentProps: { animalId: row.id, animalName: row.name }
 *   })
 */
export default defineComponent({
    name: 'AnimalGalleryDialog',
    props: {
        animalId: { type: [String, Number], required: true },
        animalName: { type: String, default: '' }
    },
    emits: [...useDialogPluginComponent.emits],
    setup (props) {
        const { dialogRef, onDialogHide, onDialogCancel } = useDialogPluginComponent()
        const { list } = animalImagesService()

        const loading = ref(true)
        const images = ref([])
        const slide = ref(null)

        const title = computed(() => props.animalName ? `Fotos de ${props.animalName}` : 'Fotos')

        onMounted(async () => {
            try {
                const { data } = await list(props.animalId)
                images.value = data.data
                slide.value = images.value[0]?.id ?? null
            } catch (error) {
                images.value = []
            } finally {
                loading.value = false
            }
        })

        return {
            dialogRef,
            onDialogHide,
            onDialogCancel,
            loading,
            images,
            slide,
            title
        }
    }
})
</script>

<style scoped>
.thumb {
    opacity: 0.5;
    border: 2px solid transparent;
}
.thumb-active {
    opacity: 1;
    border-color: white;
}
</style>
