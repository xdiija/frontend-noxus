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
                v-model="form.amount"
                type="number"
                label="Valor"
                lazy-rules
                class="col-md-6 col-xs-12"
                :rules="[val => val > 0 || 'O valor deve ser maior que zero!']"
            />
            <q-input
                outlined
                v-model="form.due_date"
                type="date"
                label="Data de Vencimento"
                class="col-md-6 col-xs-12"
                :rules="[val => !!val || 'Campo Obrigatório!']"
            />
            <q-input
                outlined
                v-model="form.payment_date"
                type="date"
                label="Data de Pagamento"
                class="col-md-6 col-xs-12"
            />
            <q-input
                outlined
                v-model="form.description"
                label="Descrição"
                lazy-rules
                class="col-md-6 col-xs-12"
                :rules="[val => val && val.length > 0 || 'Campo Obrigatório!']"
            />
            <q-select
                label="Categoria"
                class="col-md-6 col-xs-12"
                outlined
                v-model="form.category_id"
                :options="categories"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                :rules="[val => !!val || 'Campo Obrigatório!']"
            />
            <q-select
                label="Conta"
                class="col-md-6 col-xs-12"
                outlined
                v-model="form.account_id"
                :options="accounts"
                option-value="id"
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
import transactionsService from 'src/services/transactionsService'
import transactionCategoriesService from 'src/services/transactionCategoriesService'
import accountsService from 'src/services/accountsService'
import { useRouter, useRoute } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import notifications from '../utils/notifications'

const listRoute = 'transactions'
const viewDescricao = 'Transação'

const headerProps = {
    title: '',
    btnIcon: 'format_list_numbered',
    btnName: 'Listar',
    btnTo: listRoute
}

export default defineComponent({
    name: 'TransactionsForm',
    components: { ViewHeader },
    setup () {
        const router = useRouter()
        const route = useRoute()
        const { post, getByID, update } = transactionsService()
        const { list: listCategories } = transactionCategoriesService()
        const { list: listAccounts } = accountsService()
        const { notifySuccess, notifyError } = notifications()

        const form = ref({
            amount: 0,
            due_date: '',
            payment_date: '',
            description: '',
            category_id: null,
            account_id: null
        })

        const categories = ref([])
        const accounts = ref([])

        const isEditMode = computed(() => !!route.params.id)
        headerProps.title = isEditMode.value ? `Editar ${viewDescricao}` : `Cadastrar ${viewDescricao}`

        onMounted(async () => {
            await fetchCategoriesAndAccounts()
            if (route.params.id) {
                await getTransaction(route.params.id)
            }
        })

        const fetchCategoriesAndAccounts = async () => {
            try {
                const categoriesResponse = await listCategories()
                categories.value = categoriesResponse.data.data

                const accountsResponse = await listAccounts()
                accounts.value = accountsResponse.data.data
            } catch (error) {
                notifyError('Erro ao carregar categorias ou contas.')
            }
        }

        const onSubmit = async () => {
            form.value.id ? updateTransaction() : newTransaction()
        }

        const getTransaction = async (id) => {
            try {
                const { data } = await getByID(id)
                form.value = data.data
            } catch (error) {
                notifyError(error.response.data.message)
                router.push({ name: listRoute })
            }
        }

        const updateTransaction = async () => {
            try {
                await update(makePayload(), form.value.id)
                notifySuccess(`${viewDescricao} atualizada com sucesso!`)
                router.push({ name: listRoute })
            } catch (error) {
                Object.keys(error.response.data.errors).forEach(key => {
                    notifyError(error.response.data.errors[key])
                })
            }
        }

        const newTransaction = async () => {
            try {
                await post(makePayload())
                notifySuccess(`${viewDescricao} criada com sucesso!`)
                router.push({ name: listRoute })
            } catch (error) {
                Object.keys(error.response.data.errors).forEach(key => {
                    notifyError(error.response.data.errors[key])
                })
            }
        }

        const makePayload = () => {
            return {
                amount: form.value.amount,
                due_date: form.value.due_date,
                payment_date: form.value.payment_date,
                description: form.value.description,
                category_id: form.value.category_id,
                account_id: form.value.account_id
            }
        }

        return {
            form,
            onSubmit,
            headerProps,
            listRoute,
            categories,
            accounts
        }
    }
})
</script>
