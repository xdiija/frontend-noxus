<template>
    <div class="q-pa-md">
        <router-view />
        <ViewHeader
            :title="headerProps.title"
            :btnTo="headerProps.btnTo"
            :btnIcon="headerProps.btnIcon"
            :btnName="headerProps.btnName"
        />
        <q-table :rows="rows" :columns="columns" row-key="name" :rows-per-page-options="[0]">
            <template v-slot:body-cell-due_date="props">
                <q-td :props="props" 
                      :class="[
                            isOverdue(props.row.due_date, props.row.payment_date) ? 'text-negative' : 'text-positive',
                            'text-weight-bold'
                        ]">
                    {{ props.value }}
                </q-td>
            </template>
            <template v-slot:body-cell-amount="props">
                <q-td :props="props" 
                      :class="[
                            props.row.transaction.type === 'income' ? 'text-positive' : 'text-negative',
                            'text-weight-bold'
                        ]">
                    {{ props.value }}
                </q-td>
            </template>
            <template v-slot:body-cell-actions="props">
                <q-td :props="props" class="q-gutter-sm">
                    <q-btn
                        :icon="props.row.status.name === 'Pago' ? 'toggle_on' : 'toggle_off'"
                        :color="props.row.status.name === 'Pago' ? 'positive' : 'negative'"
                        dense size="sm"
                        @click="handleChangeStatusTransaction(props.row.id, props.row.status)">
                        <q-tooltip class="bg-accent">
                            {{ props.row.status.name === 'Pago' ? 'Desmarcar como Pago' : 'Marcar como Pago' }}
                        </q-tooltip>
                    </q-btn>
                    <q-btn
                        icon="edit"
                        color="warning"
                        dense size="sm"
                        @click="handleEditTransaction(props.row.id)"
                    >
                        <q-tooltip class="bg-accent">Editar</q-tooltip>
                    </q-btn>
                    <q-btn
                        icon="delete"
                        color="negative"
                        dense size="sm"
                        @click="handleDestroyTransaction(props.row.id)"
                    >
                        <q-tooltip class="bg-accent">Excluir</q-tooltip>
                    </q-btn>
                </q-td>
            </template>
        </q-table>
        <template>
            <q-dialog v-model="changeStatusData.dialogStatus" persistent>
                <q-card style="min-width: 350px">
                <q-card-section>
                    <div class="text-h6">{{ changeStatusData.title }}</div>
                    <div class="text-subtitle2 q-mt-sm">{{ changeStatusData.description }}</div>
                </q-card-section>

                <q-card-section v-if="changeStatusData.showDatePicker">
                    <q-input
                    v-model="changeStatusData.date"
                    label="Selecione a data"
                    readonly
                    dense
                    filled
                    :rules="[val => !!val || 'A data é obrigatória']"
                    >
                    <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer" />
                    </template>

                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date
                        v-model="changeStatusData.date"
                        mask="DD/MM/YYYY"
                        today-btn
                        >
                        <div class="row items-center justify-end q-gutter-sm">
                            <q-btn v-close-popup label="Fechar" color="primary" outline />
                        </div>
                        </q-date>
                    </q-popup-proxy>
                    </q-input>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="Cancelar" color="primary" v-close-popup />
                    <q-btn
                    flat
                    label="Confirmar"
                    color="primary"
                    :disable="!changeStatusData.date"
                    @click="confirmChangeStatus"
                    />
                </q-card-actions>
                </q-card>
            </q-dialog>
        </template>
    </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import transactionsService from 'src/services/transactionsService'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import notifications from '../utils/notifications'
import currency from '../utils/currency';
import dateHelper from '../utils/dateHelper';

const headerProps = {
    title: 'Movimentações',
    btnTo: 'transactionsForm',
    btnIcon: 'add',
    btnName: 'Adicionar'
}

export default defineComponent({
    name: 'TransactionsPage',
    components: { ViewHeader },
    props: {
        user: {
            type: Object,
            required: true
        }
    },
    setup () {
        const $q = useQuasar()
        const { notifySuccess, notifyError } = notifications()
        const router = useRouter()
        const { formatBRL } = currency()
        const { convertToDbFormat } = dateHelper()
        const rows = ref([])
        const { list, changeStatus, destroy } = transactionsService()

        const columns = [
            {
                label: 'Lançamento',
                field: 'created_at',
                name: 'created_at',
                sortable: true,
                align: 'left'
            },
            {
                label: 'Vencimento',
                field: 'due_date',
                name: 'due_date',
                sortable: true,
                align: 'left'
            },
            {
                label: 'Pagamento',
                field: row => row.payment_date ?? getPaymentStatus(row),
                name: 'payment_date',
                sortable: true,
                align: 'left'
            },
            {
                label: 'Descrição',
                field: row => row.transaction.description,
                name: 'description',
                sortable: true,
                align: 'left'
            },
            {
                label: 'Categoria',
                field: row => row.transaction.category_name,
                name: 'category',
                sortable: true,
                align: 'left'
            },
            {
                label: 'Conta',
                field: row => row.account.name,
                name: 'account',
                sortable: true,
                align: 'left'
            },
            {
                label: 'Valor',
                field: row => formatBRL(row.amount),
                name: 'amount',
                sortable: true,
                align: 'left',
            },
            {
                label: 'Ações',
                field: 'actions',
                name: 'actions',
                align: 'right'
            }
        ]

        onMounted(() => {
            getPayments()
        })

        const changeStatusData = ref({
            id: null,
            newStatus: {},
            dialogStatus: null,
            date: null,
            title: null,
            description: null,
            showDatePicker: null,
        })

        const handleChangeStatusTransaction = (id, status) => {
            changeStatusData.value.id = id
            changeStatusData.value.newStatus = status.id == 1 ? 2 : 1;
            changeStatusData.value.dialogStatus = true
            changeStatusData.value.title = 'Confirmação';
            status.name === 'Pago' ? setPaymentAsPendent() : setPaymentAsPaid();
        }

        const setPaymentAsPaid = () => {
            changeStatusData.value.showDatePicker = true;
            changeStatusData.value.date = null;
            changeStatusData.value.description = 'Deseja marcar este pagamento como pago?';
        }

        const setPaymentAsPendent = () => {
            changeStatusData.value.showDatePicker = false;
            changeStatusData.value.date = true;
            changeStatusData.value.description = 'Deseja marcar este pagamento como pendente?';
        }

        const confirmChangeStatus = async () => {
           
            changeStatusData.value.dialogStatus = false
            const params = { status: changeStatusData.value.newStatus}

            if(changeStatusData.value.newStatus == 2){
                params["payment_date"] = convertToDbFormat(changeStatusData.value.date)
            }           
                        
            try {
                await changeStatus(changeStatusData.value.id, params, '/payments')
                notifySuccess('Status alterado com sucesso!')
                await getPayments()
            } catch (error) {
                Object.keys(error.response.data.errors).forEach(key => {
                    notifyError(error.response.data.errors[key])
                })           
            }
        }

        const getPayments = async () => {
            try {
                const { data } = await list('/get-payments')     
                rows.value = data.data
            } catch (error) {
                console.error('Erro na requisição:', error)
            }
        }

        const isOverdue = (dueDate, paymentDate) => {
            if (paymentDate) return false;
            
            const due = new Date(convertToDbFormat(dueDate));
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            return due < today;
        }

         const getPaymentStatus = (row) => {
            if (isOverdue(row.due_date, row.payment_date)) return 'Vencido';            
            return row.status.name;
        }

        const handleEditTransaction = (id) => {
            router.push({ name: 'transactionCategoriesForm', params: { id } })
        }

        const handleDestroyTransaction = async (id) => {
            try {
                $q.dialog({
                    title: 'Confirmação',
                    message: 'Deseja mesmo excluir esta categoria?',
                    cancel: { label: 'Cancelar', color: 'primary', outline: true },
                    ok: { label: 'Confirmar', color: 'primary' },
                    persistent: true
                }).onOk(async () => {
                    await destroy(id)
                    notifySuccess(`Categoria ${id} removida com sucesso!`)
                    await getPayments()
                })
            } catch (error) {
                notifyError('Erro ao excluir categoria!')
            }
        }

        return {
            headerProps,
            rows,
            columns,
            changeStatusData,
            handleChangeStatusTransaction,
            handleEditTransaction,
            handleDestroyTransaction,
            isOverdue,
            getPaymentStatus,
            confirmChangeStatus
        }
    }
})
</script>
