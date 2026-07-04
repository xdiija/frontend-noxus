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
                v-model.number="form.sort_order"
                label="Ordem de exibição"
                type="number"
                min="0"
                class="col-md-6 col-xs-12"
            />

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
import animalSizesService from 'src/services/animalSizesService'
import { useRouter, useRoute } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import notifications from '../utils/notifications'

const listRoute = 'animalSizes'

const headerProps = {
    title: '',
    btnIcon: 'format_list_numbered',
    btnName: 'Listar',
    btnTo: listRoute
}

export default defineComponent({
    name: 'AnimalSizesForm',
    components: { ViewHeader },
    setup () {
        const router = useRouter()
        const route = useRoute()
        const { post, getByID, update } = animalSizesService()
        const { notifySuccess, notifyError } = notifications()

        const form = ref({
            name: '',
            sort_order: 0
        })

        const isEditMode = computed(() => !!route.params.id)
        headerProps.title = isEditMode.value ? 'Editar Porte' : 'Cadastrar Porte'

        onMounted(async () => {
            if (route.params.id) {
                await getAnimalSize(route.params.id)
            }
        })

        const onSubmit = async () => {
            form.value.id ? updateAnimalSize() : newAnimalSize()
        }

        const getAnimalSize = async (id) => {
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
                sort_order: form.value.sort_order ?? 0
            }
        }

        const updateAnimalSize = async () => {
            try {
                await update(makePayload(), form.value.id)
                notifySuccess('Porte atualizado com sucesso!')
                router.push({ name: listRoute })
            } catch (error) {
                handleErrors(error)
            }
        }

        const newAnimalSize = async () => {
            try {
                await post(makePayload())
                notifySuccess('Porte criado com sucesso!')
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
                notifyError(error.response?.data?.message || 'Erro ao salvar porte!')
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
