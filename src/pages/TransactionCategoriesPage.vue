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
            <template v-slot:top-right>
                <q-select
                    outlined
                    v-model="filter.type"
                    :options="filterOptions"
                    option-value="id"
                    option-label="name"
                    map-options
                    emit-value
                    dense
                    @update:model-value="onFilterChange"
                    style="min-width: 150px"
                />
            </template>
            <template v-slot:body-cell-actions="props">
                <q-td :props="props" class="q-gutter-sm">
                    <q-btn
                        :icon="props.row.status.name === 'Ativo' ? 'toggle_on' : 'toggle_off'"
                        :color="props.row.status.name === 'Ativo' ? 'positive' : 'negative'"
                        dense size="sm"
                        @click="handleChangeStatusCategory(props.row.id)">
                        <q-tooltip class="bg-accent">
                            {{ props.row.status.name === 'Ativo' ? 'Inativar' : 'Ativar' }}
                        </q-tooltip>
                    </q-btn>
                    <q-btn
                        icon="edit"
                        color="warning"
                        dense size="sm"
                        @click="handleEditCategory(props.row.id)"
                    >
                        <q-tooltip class="bg-accent">Editar</q-tooltip>
                    </q-btn>
                    <q-btn
                        icon="delete"
                        color="negative"
                        dense size="sm"
                        @click="handleDestroyCategory(props.row.id)"
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
import transactionCategoriesService from 'src/services/transactionCategoriesService'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import notifications from '../utils/notifications'

const headerProps = {
    title: 'Categorias de Transação',
    btnTo: 'transactionCategoriesForm',
    btnIcon: 'add',
    btnName: 'Adicionar'
}

export default defineComponent({
    name: 'TransactionCategoriesPage',
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
        const rows = ref([])
        const { list, changeStatus, destroy } = transactionCategoriesService()
        const filter = ref({
            type: 'all'
        });

        const filterOptions = [
            { id: 'all', name: 'Todos' },
            { id: 'income', name: 'Receitas' },
            { id: 'expense', name: 'Despesas' }
        ];

        const columns = [
            {
                label: 'ID',
                field: 'id',
                name: 'id',
                sortable: true,
                align: 'left'
            },
            {
                label: 'Nome',
                field: 'name',
                name: 'name',
                sortable: true,
                align: 'left'
            },
            {
                label: 'Tipo',
                field: row => row.type == 'expense' ? 'Despesa' : 'Receita',
                name: 'type',
                sortable: true,
                align: 'left'
            },
            {
                label: 'Status',
                field: row => row.status.name,
                name: 'status',
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

        onMounted(() => {
            getTransactionCategories()
        })

        const getTransactionCategories = async () => {
            try {
                const params = { type: filter.value.type };
                const { data } = await list("", params)
                rows.value = data.data
            } catch (error) {
                console.error('Erro na requisição:', error)
            }
        }

        const handleChangeStatusCategory = async (id) => {
            try {
                $q.dialog({
                    title: 'Confirmação',
                    message: 'Deseja realmente alterar o status da categoria?',
                    cancel: {
                        label: 'Cancelar',
                        color: 'primary',
                        outline: true
                    },
                    ok: {
                        label: 'Confirmar',
                        color: 'primary'
                    },
                    persistent: true
                }).onOk(async () => {
                    await changeStatus(id)
                    notifySuccess('Status alterado com sucesso!')
                    await getTransactionCategories()
                })
            } catch (error) {
                notifyError('Erro ao alterar status da categoria.')
            }
        }

        const handleEditCategory = (id) => {
            router.push({ name: 'transactionCategoriesForm', params: { id } })
        }

        const handleDestroyCategory = async (id) => {
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
                    await getTransactionCategories()
                })
            } catch (error) {
                notifyError('Erro ao excluir categoria!')
            }
        }

        const onFilterChange = async () => {
            try {
                getTransactionCategories()
            } catch (error) {
                notifyError('Erro ao filtrar categorias de transação.');
            }
        };

        return {
            filter,
            filterOptions,
            headerProps,
            rows,
            columns,
            onFilterChange,
            handleChangeStatusCategory,
            handleEditCategory,
            handleDestroyCategory
        }
    }
})
</script>
