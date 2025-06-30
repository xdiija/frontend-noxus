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
                class="col-md-4 col-xs-12"
                :rules="[ val => val && val.length > 0 || 'Campo Obrigatório!']"
            />
            <q-select
                label="Tipo"
                class="col-md-4 col-xs-12"
                outlined
                v-model="form.type"
                :options="transactionTypes"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                :rules="[val => !!val || 'Campo Obrigatório!']"
            />
            <q-select
                label="Status"
                class="col-md-4 col-xs-12"
                outlined
                v-model="form.status"
                :options="activeInactive"
                option-value="value"
                option-label="name"
                emit-value
                map-options
                :rules="[val => !!val || 'Campo Obrigatório!']"
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
import transactionCategoriesService from 'src/services/transactionCategoriesService'
import { useRouter, useRoute } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import notifications from '../utils/notifications'
import { activeInactive } from 'src/constants/statusOptions'

const listRoute = 'transactionCategories'
const viewDescricao = 'Categoria de Transação'

const transactionTypes = [
    { id: 'income', name: 'Receita' },
    { id: 'expense', name: 'Despesa' }
]

const headerProps = {
    title: '',
    btnIcon: 'format_list_numbered',
    btnName: 'Listar',
    btnTo: listRoute
}

export default defineComponent({
    name: 'TransactionCategoriesForm',
    components: { ViewHeader },
    setup () {
        const router = useRouter()
        const route = useRoute()
        const { post, getByID, update } = transactionCategoriesService()
        const { notifySuccess, notifyError } = notifications()

        const form = ref({
            name: '',
            type: '',
            status: ''
        })

        const isEditMode = computed(() => !!route.params.id)
        headerProps.title = isEditMode.value ? `Editar ${viewDescricao}` : `Cadastrar ${viewDescricao}`

        onMounted(async () => {
            if (route.params.id) {
                await getTransactionCategory(route.params.id)
            }
        })

        const onSubmit = async () => {
            form.value.id ? updateTransactionCategory() : newTransactionCategory()
        }

        const getTransactionCategory = async (id) => {
            try {
                const { data } = await getByID(id)                
                form.value = data.data;
            } catch (error) {
                notifyError(error.response.data.message)
                router.push({ name: listRoute })
            }
        }

        const updateTransactionCategory = async () => {
            try {
                await update(makePayload(), form.value.id)
                notifySuccess(`${viewDescricao} atualizado com sucesso!`)
                router.push({ name: listRoute })
            } catch (error) {
                Object.keys(error.response.data.errors).forEach(key => {
                    notifyError(error.response.data.errors[key])
                })
            }
        }

        const newTransactionCategory = async () => {
            try {
                await post(makePayload())
                notifySuccess(`${viewDescricao} criado com sucesso!`)
                router.push({ name: listRoute })
            } catch (error) {
                Object.keys(error.response.data.errors).forEach(key => {
                    notifyError(error.response.data.errors[key])
                })
            }
        }

        const makePayload = () => {
            const payload = {
                name: form.value.name,
                type: form.value.type,
                status: form.value.status.id
            }            
            return payload
        }

        return {
            form,
            onSubmit,
            headerProps,
            activeInactive,
            transactionTypes,
            listRoute
        }
    }
})
</script>
