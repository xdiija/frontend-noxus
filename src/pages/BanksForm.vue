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
                :rules="[ val => val && val.length > 0 || 'Campo Obrigatório!' ]"
            />

            <q-select
                label="Status"
                class="col-md-6 col-xs-12"
                outlined
                v-model="form.status"
                :options="activeInactive"
                option-label="name"
                emit-value
                map-options
                :rules="[ val => !!val || 'Campo Obrigatório!' ]"
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
                    :to="{ name: 'banks' }"
                    outline
                />
            </div>
        </q-form>
    </div>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from 'vue'
import banksService from 'src/services/banksService'
import { useRouter, useRoute } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import notifications from 'src/utils/notifications'
import { activeInactive } from 'src/constants/statusOptions'

const headerProps = {
    title: '',
    btnIcon: 'format_list_numbered',
    btnName: 'Listar',
    btnTo: 'banks'
}

export default defineComponent({
    name: 'BanksForm',
    components: { ViewHeader },
    setup () {
        const router = useRouter()
        const route = useRoute()
        const { post, getByID, update } = banksService()
        const { notifySuccess, notifyError } = notifications()

        const form = ref({
            name: null,
            status: null
        })

        const isEditMode = computed(() => !!route.params.id)
        headerProps.title = isEditMode.value ? 'Editar Banco' : 'Cadastrar Banco'

        onMounted(async () => {
            if (route.params.id) {
                await getBank(route.params.id)
            }
        })

        const onSubmit = async () => {
            form.value.id ? updateBank() : newBank()
        }

        const getBank = async (id) => {
            try {
                const { data } = await getByID(id)
                const bankData = data.data

                form.value = {
                    ...bankData,
                    status: bankData.status
                }
            } catch (error) {
                notifyError(error.response.data.message)
                router.push({ name: 'banks' })
            }
        }

        const updateBank = async () => {
            try {
                await update(makePayload(), form.value.id)
                notifySuccess('Banco atualizado com sucesso!')
                router.push({ name: 'banks' })
            } catch (error) {
                Object.keys(error.response.data.errors).forEach(key => {
                    notifyError(error.response.data.errors[key])
                })
            }
        }

        const newBank = async () => {
            try {
                await post(makePayload())
                notifySuccess('Banco criado com sucesso!')
                router.push({ name: 'banks' })
            } catch (error) {
                Object.keys(error.response.data.errors).forEach(key => {
                    notifyError(error.response.data.errors[key])
                })
            }
        }

        const makePayload = () => ({
            name: form.value.name,
            status: form.value.status.id
        })

        return {
            onSubmit,
            form,
            headerProps,
            activeInactive
        }
    }
})
</script>
