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
            <q-tab name="expense" label="Saídas" @click="setTypeToFilter('expense')"/>
            <q-tab name="income" label="Entradas" @click="setTypeToFilter('income')"/>
            <q-tab name="all" label="Todas as Transações" @click="setTypeToFilter('all')" />

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
                label="Tipo de pagamento"
                class="col-md-3 col-xs-12"
                dense
                v-model="filterData.payment_type"
                :options="selectOptions.payment_type"
                option-label="name"
                option-value="id"
                multiple
                emit-value
                map-options
                @update:model-value="(selected) => handleMultiSelection(selected, 'payment_type')"
            />
            <q-select
                v-if="filterData.type != 'all'"
                label="Categoria"
                class="col-md-3 col-xs-12"
                dense
                v-model="filterData.category"
                :options="selectOptions.category"
                option-label="name"
                option-value="id"
                multiple
                emit-value
                map-options
                @update:model-value="(selected) => handleMultiSelection(selected, 'category')"
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
            
            <template v-slot:body-cell-total_amount="props">
                <q-td :props="props" 
                    :class="[
                        'text-weight-bold',
                        props.row.category.type == 'income'
                            ? 'text-positive' : 'text-negative'
                    ]"
                >
                    <q-icon :name="props.row.category.type === 'income' ? 'add' : 'remove'" />
                    {{ props.value }}
                </q-td>
            </template>
             <template v-slot:body-cell-actions="props">
                <q-td :props="props" class="q-gutter-sm">
                    <q-btn
                        icon="edit"
                        color="warning"
                        dense size="sm"
                        @click="handleEdit(props.row.id)"
                    >
                        <q-tooltip class="bg-warning">
                            Editar
                        </q-tooltip>
                    </q-btn>
                    <q-btn
                        icon="delete"
                        color="negative"
                        dense size="sm"
                        @click="handleDestroy(props.row.id)"
                    >
                        <q-tooltip class="bg-negative">Excluir</q-tooltip>
                    </q-btn>
                </q-td>

            </template>
        </q-table>
    </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import transactionsService from 'src/services/transactionsService'
import transactionCategoriesService from 'src/services/transactionCategoriesService'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import notifications from '../utils/notifications'
import currency from '../utils/currency';
import dateHelper from '../utils/dateHelper';

const headerProps = {
    title: 'Transações',
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
        const { formatBRL, usdToCents, formatUSD } = currency()
        const { list: listCategories } = transactionCategoriesService()
        const { convertToDbFormat, convertToBrFormat } = dateHelper()
        const rows = ref([])
        const { list, destroy } = transactionsService()
        const loading = ref(false);
        const pagination = ref({
            page: 1,
            rowsPerPage: 5,
            rowsNumber: 0
        });

        const columns = [
            {
                label: 'ID',
                field: 'id',
                name: 'id',
                sortable: true,
                align: 'left'
            },
            {
                label: 'Lançamento',
                field: 'created_at',
                name: 'created_at',
                sortable: true,
                align: 'left'
            },
            {
                label: 'Categoria',
                field: row => row.category.name,
                name: 'due_date',
                sortable: true,
                align: 'left'
            },
            {
                label: 'Descrição',
                field: 'description',
                name: 'description',
                sortable: true,
                align: 'left'
            },
            {
                label: 'Parcelas',
                field: row => getPaymentsInfo(row.payments).totalAndPaid,
                name: 'payments',
                sortable: true,
                align: 'left'
            },
            {
                label: 'Valor Total',
                field: row => getPaymentsInfo(row.payments).brTotalAmount,
                name: 'total_amount',
                sortable: true,
                align: 'left'
            },
            {
                label: 'Ações',
                field: 'actions',
                name: 'actions',
                align: 'right'
            }
        ]

        const selectOptions = ref({
            payment_type: [
                {id: 'all', name: 'Todos'},
                {id: 'single', name: 'Único'},
                {id: 'installment', name: 'Parcelado'},
                {id: 'recurrent', name: 'Recorrente'}
            ],
            category: []
        });

        const filterData = ref({
            type: 'all',
            payment_type: ['all'],
            refresh: { payment_type: false, category: false },
            category: ['all'],
            dateRange: getCurrentMonthRange()
        })

        onMounted(async () => {
            await fetchCategories()
            getTransactions()
        })

        const onRequest = (params) => {
            const { page, rowsPerPage } = params.pagination;
            pagination.value.page = page;
            pagination.value.rowsPerPage = rowsPerPage;
            getTransactions();
        };

        const fetchCategories = async () => {
            try {
                let categoryType;
                if(filterData.value.type != 'all') categoryType = filterData.value.type; 
                const categoriesResponse = await listCategories('', { type: categoryType })

                selectOptions.value.category = [
                    { id: "all", name: "Todas" }, 
                    ...categoriesResponse.data.data
                ];
            } catch (error) {
                console.log(error);
                
                notifyError('Erro ao carregar categorias ou contas.')
            }
        };

        const getTransactions = async () => {     
            loading.value = true;         
            try {
                const { data } = await list('', getReqParams()) 
                                
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

        const getReqParams = () => {
           
            const queryParams = {
                page: pagination.value.page,
                per_page: pagination.value.rowsPerPage,
            };

            if (filterData.value.type != 'all') queryParams.type = filterData.value.type;
            if (filterData.value.category != 'all') queryParams.category = filterData.value.category;
            if (filterData.value.payment_type != 'all') queryParams.payment_type = filterData.value.payment_type;

            if (typeof filterData.value.dateRange == "string") {
                queryParams.date_from = convertToDbFormat(filterData.value.dateRange);
                queryParams.date_to = convertToDbFormat(filterData.value.dateRange);
            }

            if (typeof filterData.value.dateRange != "string") {
                queryParams.date_from = convertToDbFormat(filterData.value.dateRange.from);
                queryParams.date_to = convertToDbFormat(filterData.value.dateRange.to);
            }

            return queryParams;
        }

        const getPaymentsInfo = (payments) => {
            const paymentsInfo = {
                totalCount: 0, paidCount: 0, totalAmount: 0, totalAndPaid: null, brTotalAmount: null
            };

            payments.forEach(payment => {
                paymentsInfo.totalCount++;
                paymentsInfo.totalAmount = paymentsInfo.totalAmount + usdToCents(payment.amount);                
                if(payment.status == 2) paymentsInfo.paidCount++;
            });

            paymentsInfo.totalAndPaid = `${paymentsInfo.paidCount}/${paymentsInfo.totalCount}`;
            paymentsInfo.brTotalAmount = formatBRL(paymentsInfo.totalAmount);
            
            return paymentsInfo;
        }

        const handleCategoryFilterChange = (selected) => {         
            filterData.value.category = selected;
            getTransactions();
        }
        const handleMultiSelection = (selected, filterKey) => {         
           
            if (selected.length == 0 || selected.at(-1) == "all") {
                filterData.value[filterKey] = ["all"]; 

                if(filterData.value.refresh[filterKey]){
                    filterData.value.refresh[filterKey] = false;
                    getTransactions();
                } 
                
                return;
            }

            filterData.value.refresh[filterKey] = true;
            filterData.value[filterKey] = selected.filter(id => id !== "all");

            if (filterData.value[filterKey].length === selectOptions.value[filterKey].length - 1) {
                filterData.value.refresh[filterKey] = false;
                filterData.value[filterKey] = ["all"];
            }

            getTransactions();
        }

        const setTypeToFilter = (type) => {
            filterData.value.type = type;
            filterData.value.category = ['all']
            fetchCategories();
            getTransactions();
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
            getTransactions();
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
            getTransactions();
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
                    { label: 'Transferência', value: 'Transfer', color: 'secondary' },
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
            filterData,
            selectOptions,
            pagination,
            loading,
            onRequest,
            handleCategoryFilterChange,
            handleMultiSelection,
            dateRangeDisplay,
            setTypeToFilter,
            setDateRangeToFilter,
            handleCalendarDateChange,
            showTransactionTypeDialog
        }
    }
})
</script>
