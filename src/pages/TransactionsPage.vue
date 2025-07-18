<template>
    <div class="q-pa-md">
        <router-view />
        <ViewHeader
            :title="headerProps.title"
            :btnIcon="headerProps.btnIcon"
            :btnName="headerProps.btnName"
            :customClick="true"
            @custom-click="showTransactionTypeDialog"
        />

        <q-tabs
            v-model="filterData.type"
            align="left"
            class="bg-white text-primary q-mb-md"
            inline-label
        >
            <q-tab name="expense" label="Contas a Pagar" @click="setTypeToFilter('expense')"/>
            <q-tab name="income" label="Contas a Receber" @click="setTypeToFilter('income')"/>
            <q-tab name="all" label="Todos os Lançamentos" @click="setTypeToFilter('all')" />

        </q-tabs>

        <q-form class="row q-col-gutter-sm q-mb-md">
            <q-input
                label="Período"
                class="col-md-3 col-xs-12"
                dense
                :model-value="dateRangeDisplay()"
                readonly
            >
                <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                            <q-date
                                v-model="filterData.dateRange"
                                range
                                mask="DD/MM/YYYY"
                                @update:model-value="handleCalendarDateChange"
                            >
                                <div class="row items-center q-mb-xs">
                                    <q-btn
                                        label="Ontem"
                                        class="col-md-4"
                                        padding="none" size="sm"
                                        color="primary" flat no-caps v-close-popup
                                        @click="setDateRangeToFilter('day', 'last')"
                                    />
                                    <q-btn
                                        label="Hoje"
                                        class="col-md-4"
                                        padding="none" size="sm"
                                        color="primary" flat no-caps v-close-popup
                                        @click="setDateRangeToFilter('day', 'this')"
                                    />
                                     <q-btn
                                        label="Amanhã"
                                        class="col-md-4"
                                        padding="none" size="sm"
                                        color="primary" flat no-caps v-close-popup
                                        @click="setDateRangeToFilter('day', 'next')"
                                    />
                                </div>

                                <div class="row items-center q-mb-xs">
                                    <q-btn
                                        label="Semana passada"
                                        class="col-md-4"
                                        padding="none" size="sm"
                                        color="primary" flat no-caps v-close-popup
                                        @click="setDateRangeToFilter('week', 'last')"
                                    />
                                    <q-btn
                                        label="Semana atual"
                                        class="col-md-4"
                                        padding="none" size="sm"
                                        color="primary" flat no-caps v-close-popup
                                        @click="setDateRangeToFilter('week', 'this')"
                                    />
                                     <q-btn
                                        label="Próxima semana"
                                        class="col-md-4"
                                        padding="none" size="sm"
                                        color="primary" flat no-caps v-close-popup
                                        @click="setDateRangeToFilter('week', 'next')"
                                    />
                                </div>


                                <div class="row items-center q-mb-lg">
                                    <q-btn
                                        label="Mês passado"
                                        class="col-md-4"
                                        padding="none" size="sm"
                                        color="primary" flat no-caps v-close-popup
                                        @click="setDateRangeToFilter('month', 'last')"
                                    />
                                    <q-btn
                                        label="Mês atual"
                                        class="col-md-4"
                                        padding="none" size="sm"
                                        color="primary" flat no-caps v-close-popup
                                        @click="setDateRangeToFilter('month', 'this')"
                                    />
                                     <q-btn
                                        label="Próximo mês"
                                        class="col-md-4"
                                        padding="none" size="sm"
                                        color="primary" flat no-caps v-close-popup
                                        @click="setDateRangeToFilter('month', 'next')"
                                    />
                                </div>                               

                                <div class="row items-center justify-end">
                                    <q-btn padding="xs lg" v-close-popup label="Fechar" color="primary" outline />
                                </div>
                            </q-date>
                        </q-popup-proxy>
                    </q-icon>
                </template>
            </q-input>
            <q-select
                label="Considerar Data"
                class="col-md-3 col-xs-12"
                dense
                v-model="filterData.dateFilterOption"
                :options="selectOptions.dateMode"
                option-label="name"
                option-value="id"
                emit-value
                map-options
                @update:model-value="handleDateOptionChange"
            />
            <q-select
                label="Contas"
                class="col-md-3 col-xs-12"
                dense
                v-model="filterData.account"
                :options="selectOptions.account"
                option-label="name"
                option-value="id"
                multiple
                emit-value
                map-options
                @update:model-value="(selected) => handleMultiSelection(selected, 'account')"
            />
            <q-select
                label="Status"
                class="col-md-3 col-xs-12"
                dense
                v-model="filterData.status"
                :options="selectOptions.status"
                option-label="name"
                option-value="id"
                multiple
                emit-value
                map-options
                @update:model-value="(selected) => handleMultiSelection(selected, 'status')"
            />
        </q-form>

        <q-table
            :rows="rows"
            :columns="columns"
            row-key="id"
            v-model:pagination="pagination"
            :loading="loading"
            :rows-per-page-options="[5, 10, 20]"
            @request="onRequest"
        >
            
            <template v-slot:body-cell-due_date="props">
                <q-td :props="props" 
                      :class="[
                            props.row.status.name == 'Vencido' ? 'text-negative' : 'text-positive',
                            'text-weight-bold'
                        ]">
                    {{ props.value }}
                </q-td>
            </template>
            <template v-slot:body-cell-amount="props">
                <q-td :props="props" 
                    :class="[
                        'text-weight-bold',
                        props.row.transaction.type == 'income'
                            ? 'text-positive' : 'text-negative'
                    ]"
                >
                    <q-icon :name="props.row.transaction.type === 'income' ? 'add' : 'remove'" />
                    {{ props.value }}
                </q-td>
            </template>
            <template v-slot:body-cell-actions="props">
                <q-td :props="props" class="q-gutter-sm">
                    <q-btn
                        :icon="props.row.status.name === 'Pago' ? 'toggle_on' : 'toggle_off'"
                        color="positive"
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
                        <q-tooltip class="bg-warning">Editar</q-tooltip>
                    </q-btn>
                    <q-btn
                        icon="delete"
                        color="negative"
                        dense size="sm"
                        @click="handleDestroyTransaction(props.row.id)"
                    >
                        <q-tooltip class="bg-negative">Excluir</q-tooltip>
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
import accountsService from 'src/services/accountsService'

const headerProps = {
    title: 'Movimentações',
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
        const { convertToDbFormat, convertToBrFormat } = dateHelper()
        const rows = ref([])
        const { list, changeStatus, destroy } = transactionsService()
        const loading = ref(false);
        const pagination = ref({
            page: 1,
            rowsPerPage: 5,
            rowsNumber: 0
        });

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
                field: row => row.payment_date ?? row.status.name,
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

        const selectOptions = ref({
            account: [],
            status: [
                {id: 'all', name: 'Todos'},
                {id: 'overdue', name: 'Vencido'},
                {id: 'pending', name: 'Pendente'},
                {id: 'paid', name: 'Pago'}
            ],
            dateMode: [
                {id: 'due_date', name: 'Data de Vencimento'},
                {id: 'created_at', name: 'Data de Lançamento'}
            ]
        });

        const changeStatusData = ref({
            id: null,
            newStatus: {},
            dialogStatus: null,
            date: null,
            title: null,
            description: null,
            showDatePicker: null,
        })

        const filterData = ref({
            type: 'all',
            refresh: {account: false, status: false},
            account: ["all"],
            status: ['all'],
            dateFilterOption: 'due_date',
            dateRange: getCurrentMonthRange()
        })

        onMounted(() => {
            getPayments()
            getAccounts()
        })

        const onRequest = (params) => {
            const { page, rowsPerPage } = params.pagination;
            pagination.value.page = page;
            pagination.value.rowsPerPage = rowsPerPage;
            getPayments();
        };

        const getPayments = async () => {     
            loading.value = true;         
            try {
                const { data } = await list('/get-payments', getReqParams())     
                rows.value = data.data;
                pagination.value.rowsNumber = data.meta.total;
            } catch (error) {
                Object.keys(error.response.data.errors).forEach(key => {
                    notifyError(error.response.data.errors[key])
                })
            } finally {
                loading.value = false;
            }
        }

        const getAccounts = async () => {
            try {
                const { list: listAccounts } = accountsService();
                const { data } = await listAccounts();
                selectOptions.value.account = [
                    { id: "all", name: "Todas" }, 
                    ...data.data
                ];
                
            } catch (error) {
                notifyError(error.response.data.message);
            }
        }

        const getReqParams = () => {
           
            const queryParams = {
                page: pagination.value.page,
                per_page: pagination.value.rowsPerPage,
            };

            if (filterData.value.type != 'all') queryParams.type = filterData.value.type;
            if (filterData.value.account != 'all') queryParams.account = filterData.value.account;
            if (filterData.value.status != 'all') queryParams.status = filterData.value.status;

            if (typeof filterData.value.dateRange == "string") {
                queryParams.date_from = convertToDbFormat(filterData.value.dateRange);
                queryParams.date_to = convertToDbFormat(filterData.value.dateRange);
            }

            if (typeof filterData.value.dateRange != "string") {
                queryParams.date_from = convertToDbFormat(filterData.value.dateRange.from);
                queryParams.date_to = convertToDbFormat(filterData.value.dateRange.to);
            }

            queryParams.date_filter_option = filterData.value.dateFilterOption;

            return queryParams;
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

        const handleDateOptionChange = (selected) => {         
            filterData.value.dateFilterOption = selected;
            getPayments();
        }
        const handleMultiSelection = (selected, filterKey) => {         
           
            if (selected.length == 0 || selected.at(-1) == "all") {
                filterData.value[filterKey] = ["all"]; 

                if(filterData.value.refresh[filterKey]){
                    filterData.value.refresh[filterKey] = false;
                    getPayments();
                } 
                
                return;
            }

            filterData.value.refresh[filterKey] = true;
            filterData.value[filterKey] = selected.filter(id => id !== "all");

            if (filterData.value[filterKey].length === selectOptions.value[filterKey].length - 1) {
                filterData.value.refresh[filterKey] = false;
                filterData.value[filterKey] = ["all"];
            }

            getPayments();
        }
    
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
        const setTypeToFilter = (type) => {
            filterData.value.type = type;
            getPayments();
        }

        function getCurrentMonthRange() {
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            const formatToDb = (date) => date.toISOString().split('T')[0];

            return {
                from: convertToBrFormat(formatToDb(firstDay)),
                to: convertToBrFormat(formatToDb(lastDay))
            };
        }
        
        function dateRangeDisplay() {           
            if(!filterData.value.dateRange) return;

            if (typeof filterData.value.dateRange === "string") {
                return `${filterData.value.dateRange} - ${filterData.value.dateRange}`;
            }

            const { from, to } = filterData.value.dateRange
            return from && to ? `${from} - ${to}` : ''
        }
        const setDateRangeToFilter = (range, position) => {
            switch (range) {
                case 'day':
                    handleDailyRange(position);
                    break;
                case 'week':
                    handleWeeklyRange(position);
                    break;
                case 'month':
                    handleMonthlyRange(position);
                    break;
                default:
                    return false
            }
            getPayments();
        }
        const handleDailyRange = (position) => {
            const today = new Date();
            const offsetMap = { last: -1, this: 0, next: 1 };
            const offset = offsetMap[position] ?? 0;
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + offset);
            const isoDate = targetDate.toISOString().split('T')[0];
            filterData.value.dateRange = convertToBrFormat(isoDate);
        };
        const handleWeeklyRange = (position) => {
            const today = new Date();
            const dayOfWeek = today.getDay() || 7;
            const startOffsetMap = { last: -dayOfWeek - 6, this: -dayOfWeek + 1, next: -dayOfWeek + 8};
            const startOffset = startOffsetMap[position] ?? -dayOfWeek + 1;
            const start = new Date(today);
            start.setDate(today.getDate() + startOffset);
            const end = new Date(start);
            end.setDate(start.getDate() + 6);

            const toDbFormat = (date) => date.toISOString().split('T')[0];
            const toBrFormat = (date) => convertToBrFormat(toDbFormat(date));

            filterData.value.dateRange = {
                from: toBrFormat(start),
                to: toBrFormat(end)
            };
        };
        const handleMonthlyRange = (position) => {
            const today = new Date();
            const monthOffsetMap = { last: -1, this: 0, next: 1};
            const offset = monthOffsetMap[position] ?? 0;
            const start = new Date(today.getFullYear(), today.getMonth() + offset, 1);
            const end = new Date(today.getFullYear(), today.getMonth() + offset + 1, 0);

            const toDbFormat = (date) => date.toISOString().split('T')[0];
            const toBrFormat = (date) => convertToBrFormat(toDbFormat(date));

            filterData.value.dateRange = {
                from: toBrFormat(start),
                to: toBrFormat(end)
            };
        };
        const handleCalendarDateChange = (newRange) => {
            if(newRange == null) return;            
            getPayments();
        };

        const showTransactionTypeDialog = () => {
            $q.dialog({
                title: 'Tipo de Movimentação',
                message: 'Selecione o tipo que deseja adicionar:',
                size: 'small',
                options: {
                type: 'radio',
                model: 'Income',
                inline: true,
                items: [
                    { label: 'Receita', value: 'Income', color: 'positive' },
                    { label: 'Despesa', value: 'Expense', color: 'negative' },
                    { label: 'Transferência', value: 'Transferency', color: 'secondary' },
                ]
                },
                cancel: {
                        label: 'Cancelar',
                        color: 'primary',
                        outline: true 
                    },
                    ok: {
                        label: 'Confirmar',
                        color: 'primary',
                    },
                persistent: true
            }).onOk(type => {
                router.push({
                    name: `transactionsForm${type}`
                })
            })
        }

        return {
            headerProps,
            rows,
            columns,
            changeStatusData,
            filterData,
            selectOptions,
            pagination,
            loading,
            onRequest,
            handleDateOptionChange,
            handleMultiSelection,
            dateRangeDisplay,
            setTypeToFilter,
            setDateRangeToFilter,
            handleChangeStatusTransaction,
            handleEditTransaction,
            handleDestroyTransaction,
            confirmChangeStatus,
            handleCalendarDateChange,
            showTransactionTypeDialog
        }
    }
})
</script>
