<template>
    <div class="q-pa-md">
        <ViewHeader
            :title="headerProps.title"
            :btnTo="headerProps.btnTo"
            :btnIcon="headerProps.btnIcon"
            :btnName="headerProps.btnName"
        />
        <q-form @submit="onSubmit" class="row q-col-gutter-sm">
            <q-input
                outlined
                v-model="form.description"
                label="Descrição"
                lazy-rules
                class="col-md-6 col-xs-12"
                :rules="[ val => val && val.length > 1 || 'Campo Obrigatório!']"
            />

            <q-select
                outlined
                v-model="form.expense_category_id"
                :options="categoryOptions"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                clearable
                label="Categoria (Opcional)"
                class="col-md-6 col-xs-12"
            />

            <q-input
                outlined
                v-model="maskedAmount"
                label="Valor"
                lazy-rules
                class="col-md-4 col-xs-12"
                :rules="[ val => !!val || 'Campo Obrigatório!']"
            />

            <q-input
                outlined
                v-model="form.expense_date"
                label="Data da despesa"
                mask="##/##/####"
                placeholder="dd/mm/aaaa"
                class="col-md-4 col-xs-12"
                :rules="[ val => !!val || 'Campo Obrigatório!']"
            >
                <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                            <q-date v-model="form.expense_date" mask="DD/MM/YYYY">
                                <div class="row items-center justify-end">
                                    <q-btn v-close-popup label="Fechar" color="primary" flat />
                                </div>
                            </q-date>
                        </q-popup-proxy>
                    </q-icon>
                </template>
            </q-input>

            <div class="col-md-4 col-xs-12 flex items-center self-start" style="height: 56px">
                <q-toggle v-model="form.paid" label="Paga" />
            </div>

            <div class="col-lg-12 col-xs-12 q-mt-md">
                <q-btn label="Salvar" type="submit" class="float-right" color="primary" icon="save" />
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
import expensesService from 'src/services/expensesService'
import expenseCategoriesService from 'src/services/expenseCategoriesService'
import { useRouter, useRoute } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import notifications from '../utils/notifications'
import currency from '../utils/currency'
import dateHelper from '../utils/dateHelper'

const listRoute = 'expenses'

const headerProps = {
    title: '',
    btnIcon: 'format_list_numbered',
    btnName: 'Listar',
    btnTo: listRoute
}

export default defineComponent({
    name: 'ExpensesForm',
    components: { ViewHeader },
    setup () {
        const router = useRouter()
        const route = useRoute()
        const { formatBRL, maskCurrency } = currency()
        const { convertToDbFormat } = dateHelper()
        const { post, getByID, update } = expensesService()
        const { list: listCategories } = expenseCategoriesService()
        const { notifySuccess, notifyError } = notifications()

        const form = ref({
            expense_category_id: null,
            description: '',
            amount: '',
            expense_date: '',
            paid: false
        })

        const categoryOptions = ref([])

        const isEditMode = computed(() => !!route.params.id)
        headerProps.title = isEditMode.value ? 'Editar Despesa' : 'Cadastrar Despesa'

        onMounted(async () => {
            await getCategories()
            if (route.params.id) {
                await getExpense(route.params.id)
            }
        })

        const getCategories = async () => {
            const { data } = await listCategories()
            categoryOptions.value = data.data
        }

        const getExpense = async (id) => {
            try {
                const { data } = await getByID(id)
                const expense = data.data

                form.value = {
                    id: expense.id,
                    expense_category_id: expense.category?.id ?? null,
                    description: expense.description,
                    amount: maskCurrency(expense.amount),
                    expense_date: expense.expense_date ?? '',
                    paid: expense.paid
                }
            } catch (error) {
                notifyError(error.response?.data?.message || 'Erro ao carregar despesa!')
                router.push({ name: listRoute })
            }
        }

        // "R$ 1.234,56" -> 1234.56 (null when empty)
        const amountToDb = (masked) => {
            if (!masked) return null
            const digits = String(masked).replace(/\D/g, '')
            return digits ? Number(digits) / 100 : null
        }

        const makePayload = () => ({
            expense_category_id: form.value.expense_category_id,
            description: form.value.description,
            amount: amountToDb(form.value.amount),
            expense_date: convertToDbFormat(form.value.expense_date),
            paid: form.value.paid
        })

        const onSubmit = async () => {
            form.value.id ? updateExpense() : newExpense()
        }

        const updateExpense = async () => {
            try {
                await update(makePayload(), form.value.id)
                notifySuccess('Despesa atualizada com sucesso!')
                router.push({ name: listRoute })
            } catch (error) {
                handleErrors(error)
            }
        }

        const newExpense = async () => {
            try {
                await post(makePayload())
                notifySuccess('Despesa criada com sucesso!')
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
                notifyError(error.response?.data?.message || 'Erro ao salvar despesa!')
            }
        }

        const maskedAmount = computed({
            get () { return form.value.amount || '' },
            set (value) { form.value.amount = value ? formatBRL(value) : '' }
        })

        return {
            form,
            categoryOptions,
            maskedAmount,
            isEditMode,
            onSubmit,
            headerProps,
            listRoute
        }
    }
})
</script>
