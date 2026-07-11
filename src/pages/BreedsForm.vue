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
            <q-select
                outlined
                v-model="form.species_id"
                :options="speciesOptions"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                label="Espécie"
                class="col-md-6 col-xs-12"
                :rules="[ val => !!val || 'Campo Obrigatório!']"
            />

            <q-input
                outlined
                v-model="form.name"
                label="Nome"
                lazy-rules
                class="col-md-6 col-xs-12"
                :rules="[ val => val && val.length > 0 || 'Campo Obrigatório!']"
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
import breedsService from 'src/services/breedsService'
import speciesService from 'src/services/speciesService'
import { useRouter, useRoute } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import notifications from '../utils/notifications'

const listRoute = 'breeds'

const headerProps = {
    title: '',
    btnIcon: 'format_list_numbered',
    btnName: 'Listar',
    btnTo: listRoute
}

export default defineComponent({
    name: 'BreedsForm',
    components: { ViewHeader },
    setup () {
        const router = useRouter()
        const route = useRoute()
        const { post, getByID, update } = breedsService()
        const { list: listSpecies } = speciesService()
        const { notifySuccess, notifyError } = notifications()

        const form = ref({
            species_id: null,
            name: ''
        })
        const speciesOptions = ref([])

        const isEditMode = computed(() => !!route.params.id)
        headerProps.title = isEditMode.value ? 'Editar Raça' : 'Cadastrar Raça'

        onMounted(async () => {
            await getSpecies()
            if (route.params.id) {
                await getBreed(route.params.id)
            }
        })

        const onSubmit = async () => {
            form.value.id ? updateBreed() : newBreed()
        }

        const getSpecies = async () => {
            try {
                const { data } = await listSpecies()
                speciesOptions.value = data.data
            } catch (error) {
                console.error('Erro na requisição:', error)
            }
        }

        const getBreed = async (id) => {
            try {
                const { data } = await getByID(id)
                const breed = data.data
                form.value = {
                    id: breed.id,
                    species_id: breed.species_id,
                    name: breed.name
                }
            } catch (error) {
                notifyError(error.response.data.message)
                router.push({ name: listRoute })
            }
        }

        const makePayload = () => {
            return {
                species_id: form.value.species_id,
                name: form.value.name
            }
        }

        const updateBreed = async () => {
            try {
                await update(makePayload(), form.value.id)
                notifySuccess('Raça atualizada com sucesso!')
                router.push({ name: listRoute })
            } catch (error) {
                handleErrors(error)
            }
        }

        const newBreed = async () => {
            try {
                await post(makePayload())
                notifySuccess('Raça criada com sucesso!')
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
                notifyError(error.response?.data?.message || 'Erro ao salvar raça!')
            }
        }

        return {
            form,
            speciesOptions,
            onSubmit,
            headerProps,
            listRoute
        }
    }
})
</script>
