<template>
    <div class="q-pa-md">
        <ViewHeader
            :title="headerProps.title"
            :btnTo="headerProps.btnTo"
            :btnIcon="headerProps.btnIcon"
            :btnName="headerProps.btnName"
        />
        <q-form
            @submit="onSubmit"
            class="row q-col-gutter-sm"
        >
            <q-input
                outlined
                v-model="form.name"
                label="Nome"
                lazy-rules
                class="col-md-6 col-xs-12"
                :rules="[ val => val && val.length > 0 || 'Campo Obrigatório!']"
            />

            <q-input
                outlined
                v-model="form.color"
                label="Cor (Opcional)"
                class="col-md-6 col-xs-12"
                :rules="[ val => !val || /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(val) || 'Use um hexadecimal, ex: #10B981']"
            >
                <template v-slot:append>
                    <q-icon name="colorize" class="cursor-pointer" :style="{ color: form.color || undefined }">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                            <q-color v-model="form.color" format-model="hex" default-view="palette" no-header-tabs />
                        </q-popup-proxy>
                    </q-icon>
                </template>
            </q-input>

            <q-input
                outlined
                v-model.number="form.sort_order"
                label="Ordem de exibição"
                type="number"
                min="0"
                class="col-md-6 col-xs-12"
            />

            <div class="col-md-6 col-xs-12 flex items-center">
                <q-toggle
                    v-model="form.is_default"
                    label="Status padrão (pré-selecionado em novos animais)"
                />
            </div>

            <div class="col-lg-12 col-xs-12">
                <q-btn
                    label="Salvar"
                    type="submit"
                    class="float-right"
                    color="primary"
                    icon="save"
                />
                <q-btn
                    label="Sair"
                    color="primary"
                    class="float-right q-mr-sm"
                    icon="arrow_back"
                    :to="{ name: listRoute }"
                    outline
                />
            </div>
        </q-form>
    </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import animalStatusesService from 'src/services/animalStatusesService'
import { useRouter, useRoute } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import notifications from '../utils/notifications'

const listRoute = 'animalStatuses'

const headerProps = {
    title: '',
    btnIcon: 'format_list_numbered',
    btnName: 'Listar',
    btnTo: listRoute
}

export default defineComponent({
    name: 'AnimalStatusesForm',
    components: { ViewHeader },
    setup () {
        const router = useRouter()
        const route = useRoute()
        const { post, getByID, update } = animalStatusesService()
        const { notifySuccess, notifyError } = notifications()

        const form = ref({
            name: '',
            color: '',
            sort_order: 0,
            is_default: false
        })

        const isEditMode = computed(() => !!route.params.id)
        headerProps.title = isEditMode.value ? 'Editar Status' : 'Cadastrar Status'

        onMounted(async () => {
            if (route.params.id) {
                await getAnimalStatus(route.params.id)
            }
        })

        const onSubmit = async () => {
            form.value.id ? updateAnimalStatus() : newAnimalStatus()
        }

        const getAnimalStatus = async (id) => {
            try {
                const { data } = await getByID(id)
                form.value = { ...data.data }
            } catch (error) {
                notifyError(error.response.data.message)
                router.push({ name: listRoute })
            }
        }

        const makePayload = () => {
            return {
                name: form.value.name,
                color: form.value.color || null,
                sort_order: form.value.sort_order ?? 0,
                is_default: form.value.is_default
            }
        }

        const updateAnimalStatus = async () => {
            try {
                await update(makePayload(), form.value.id)
                notifySuccess('Status atualizado com sucesso!')
                router.push({ name: listRoute })
            } catch (error) {
                handleErrors(error)
            }
        }

        const newAnimalStatus = async () => {
            try {
                await post(makePayload())
                notifySuccess('Status criado com sucesso!')
                router.push({ name: listRoute })
            } catch (error) {
                handleErrors(error)
            }
        }

        const handleErrors = (error) => {
            const errors = error.response?.data?.errors
            if (errors) {
                Object.keys(errors).forEach(key => notifyError(errors[key]))
            } else {
                notifyError(error.response?.data?.message || 'Erro ao salvar status!')
            }
        }

        return {
            form,
            onSubmit,
            headerProps,
            listRoute
        }
    }
})
</script>
