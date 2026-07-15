<template>
    <div class="q-pa-md">
        <router-view />
        <ViewHeader
            :title="headerProps.title"
            :btnTo="headerProps.btnTo"
            :btnIcon="headerProps.btnIcon"
            :btnName="canCreate('expenses') ? headerProps.btnName : ''"
        />
        <q-table
            :rows="rows"
            :columns="columns"
            row-key="id"
            :filter="filter"
            v-model:pagination="pagination"
            :loading="loading"
            :rows-per-page-options="[5, 10, 20]"
            @request="onRequest"
        >
            <template v-slot:top-right>
                <q-input dense debounce="300" v-model="filter" placeholder="Busca">
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </template>
            <template v-slot:body-cell-paid="props">
                <q-td :props="props">
                    <q-chip
                        :color="props.row.paid ? 'positive' : 'warning'"
                        text-color="white"
                        dense
                    >
                        {{ props.row.paid ? 'Pago' : 'Pendente' }}
                    </q-chip>
                </q-td>
            </template>
            <template v-slot:body-cell-actions="props">
                <q-td :props="props" class="q-gutter-sm">
                    <q-btn
                        v-if="canUpdate('expenses')"
                        :icon="props.row.paid ? 'toggle_on' : 'toggle_off'"
                        :color="props.row.paid ? 'positive' : 'negative'"
                        dense size="sm"
                        @click="handleTogglePaid(props.row)">
                        <q-tooltip class="bg-accent">
                            {{ props.row.paid ? 'Marcar como pendente' : 'Marcar como paga' }}
                        </q-tooltip>
                    </q-btn>
                    <q-btn
                        v-if="canUpdate('expenses')"
                        icon="edit"
                        color="primary"
                        dense size="sm"
                        @click="handleEdit(props.row.id)"
                    >
                        <q-tooltip class="bg-accent">Editar</q-tooltip>
                    </q-btn>
                    <q-btn
                        v-if="canUpdate('expenses')"
                        icon="delete"
                        color="primary"
                        dense size="sm"
                        @click="handleDestroy(props.row.id)"
                    >
                        <q-tooltip class="bg-accent">Excluir</q-tooltip>
                    </q-btn>
                </q-td>
            </template>
        </q-table>
    </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import expensesService from 'src/services/expensesService'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import notifications from '../utils/notifications'
import usePermissions from 'src/composables/usePermissions'
import currency from '../utils/currency'

const headerProps = {
    title: 'Despesas',
    btnTo: 'expensesForm',
    btnIcon: 'add',
    btnName: 'Adicionar'
}

export default defineComponent({
    name: 'ExpensesPage',
    components: { ViewHeader },
    setup () {
        const $q = useQuasar()
        const { notifySuccess, notifyError } = notifications()
        const router = useRouter()
        const { maskCurrency } = currency()
        const rows = ref([])
        const filter = ref('')
        const loading = ref(false)
        const pagination = ref({
            page: 1,
            rowsPerPage: 10,
            rowsNumber: 0
        })
        const { list, togglePaid, destroy } = expensesService()
        const { canUpdate, canCreate } = usePermissions()

        const columns = [
            { label: 'ID', field: 'id', name: 'id', sortable: true, align: 'left' },
            { label: 'Descrição', field: 'description', name: 'description', sortable: true, align: 'left' },
            { label: 'Categoria', field: row => row.category?.name || '—', name: 'category', align: 'left' },
            { label: 'Valor', field: row => maskCurrency(row.amount), name: 'amount', align: 'left' },
            { label: 'Data', field: 'expense_date', name: 'expense_date', align: 'left' },
            { label: 'Situação', field: 'paid', name: 'paid', align: 'left' },
            { label: 'Ações', field: 'actions', name: 'actions', align: 'right' }
        ]

        const onRequest = (params) => {
            const { page, rowsPerPage } = params.pagination
            pagination.value.page = page
            pagination.value.rowsPerPage = rowsPerPage
            getExpenses()
        }

        const getExpenses = async () => {
            loading.value = true
            try {
                const params = {
                    page: pagination.value.page,
                    per_page: pagination.value.rowsPerPage,
                    filter: filter.value
                }
                const { data } = await list('', params)
                rows.value = data.data
                pagination.value.rowsNumber = data.meta.total
            } catch (error) {
                console.error('Erro na requisição:', error)
            } finally {
                loading.value = false
            }
        }

        onMounted(() => {
            getExpenses()
        })

        const handleTogglePaid = (row) => {
            $q.dialog({
                title: 'Confirmação',
                message: row.paid
                    ? 'Deseja marcar esta despesa como pendente?'
                    : 'Deseja marcar esta despesa como paga?',
                cancel: { label: 'Cancelar', color: 'primary', outline: true },
                ok: { label: 'Confirmar', color: 'primary' },
                persistent: true
            }).onOk(async () => {
                try {
                    await togglePaid(row.id)
                    notifySuccess('Situação da despesa alterada com sucesso!')
                    await getExpenses()
                } catch (error) {
                    notifyError('Erro ao alterar a situação da despesa!')
                }
            })
        }

        const handleEdit = (id) => {
            router.push({ name: 'expensesForm', params: { id } })
        }

        const handleDestroy = (id) => {
            $q.dialog({
                title: 'Confirmação',
                message: 'Deseja mesmo excluir esta despesa?',
                cancel: { label: 'Cancelar', color: 'primary', outline: true },
                ok: { label: 'Confirmar', color: 'primary' },
                persistent: true
            }).onOk(async () => {
                try {
                    await destroy(id)
                    notifySuccess(`Despesa ${id} removida com sucesso!`)
                    await getExpenses()
                } catch (error) {
                    notifyError('Erro ao excluir despesa!')
                }
            })
        }

        return {
            headerProps,
            rows,
            columns,
            filter,
            loading,
            pagination,
            onRequest,
            handleTogglePaid,
            handleEdit,
            handleDestroy,
            canUpdate,
            canCreate
        }
    }
})
</script>
