<template>
    <div class="q-pa-md">
        <router-view />
        <ViewHeader
            :title="headerProps.title"
            :btnTo="headerProps.btnTo"
            :btnIcon="headerProps.btnIcon"
            :btnName="headerProps.btnName"
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
            <template v-slot:body-cell-actions="props">
                <q-td :props="props" class="q-gutter-sm">
                    <q-btn
                        :icon="props.row.status.name === 'Ativo' ? 'toggle_on' : 'toggle_off'"
                        :color="props.row.status.name === 'Ativo' ? 'positive' : 'negative'"
                        dense size="sm"
                        @click="handleChangeStatusSupplier(props.row.id)">
                        <q-tooltip class="bg-accent">
                            {{ props.row.status.name === 'Ativo' ? 'Inativar' : 'Ativar' }}
                        </q-tooltip>
                    </q-btn>
                    <q-btn
                        icon="edit"
                        color="warning"
                        dense size="sm"
                        @click="handleEditSupplier(props.row.id)"
                    >
                        <q-tooltip class="bg-accent">Editar</q-tooltip>
                    </q-btn>
                    <q-btn
                        icon="delete"
                        color="negative"
                        dense size="sm"
                        @click="handleDestroySupplier(props.row.id)"
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
import suppliersService from 'src/services/suppliersService'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import notifications from '../utils/notifications'
import mask from '../utils/mask';

const headerProps = {
    title: 'Fornecedores',
    btnTo: 'suppliersForm',
    btnIcon: 'add',
    btnName: 'Adicionar'
}

export default defineComponent({
    name: 'SuppliersPage',
    components: { ViewHeader },
    setup () {
        const $q = useQuasar()
        const { notifySuccess, notifyError } = notifications()
        const { phoneMask, cnpjMask } = mask()
        const router = useRouter()
        const rows = ref([])
        const filter = ref('')
        const loading = ref(false)
        const pagination = ref({
            page: 1,
            rowsPerPage: 5,
            rowsNumber: 0
        })
        const { list, changeStatus, destroy } = suppliersService()

        const columns = [
            {
                label: 'ID',
                field: 'id',
                name: 'id',
                sortable: true,
                align: 'left'
            },
            {
                label: 'Nome Fantasia',
                field: 'nome_fantasia',
                name: 'nome_fantasia',
                sortable: true,
                align: 'left'
            },
            {
                label: 'Razão Social',
                field: 'razao_social',
                name: 'razao_social',
                sortable: true,
                align: 'left'
            },
            {
                label: 'Email',
                field: 'email',
                name: 'email',
                sortable: true,
                align: 'left'
            },
            {
                label: 'CNPJ',
                field: row => cnpjMask(row.cnpj),
                name: 'cnpj',
                sortable: true,
                align: 'left'
            },
            {
                label: 'Telefone 1',
                field: row => phoneMask(row.phone_1),
                name: 'phone_1',
                sortable: true,
                align: 'left'
            },
            {
                label: 'Telefone 2',
                field: row => phoneMask(row.phone_2),
                name: 'phone_2',
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

        const onRequest = (params) => {
            const { page, rowsPerPage } = params.pagination
            pagination.value.page = page
            pagination.value.rowsPerPage = rowsPerPage
            getSuppliers()
        }

        const getSuppliers = async () => {
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
            getSuppliers()
        })

        const handleChangeStatusSupplier = async (id) => {
            try {
                $q.dialog({
                    title: 'Confirmação',
                    message: 'Deseja realmente alterar o status do cliente?',
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
                    await getSuppliers()
                })
            } catch (error) {
                notifyError('Erro ao alterar status do cliente.')
            }
        }

        const handleEditSupplier = (id) => {
            router.push({ name: 'suppliersForm', params: { id } })
        }

        const handleDestroySupplier = async (id) => {
            try {
                $q.dialog({
                    title: 'Confirmação',
                    message: 'Deseja mesmo excluir este cliente? Não prefere inativá-lo?',
                    cancel: { label: 'Cancelar', color: 'primary', outline: true },
                    ok: { label: 'Confirmar', color: 'primary' },
                    persistent: true
                }).onOk(async () => {
                    await destroy(id)
                    notifySuccess(`Cliente ${id} removido com sucesso!`)
                    await getSuppliers()
                })
            } catch (error) {
                notifyError('Erro ao excluir cliente!')
            }
        }

        return {
            headerProps,
            rows,
            columns,
            filter,
            loading,
            pagination,
            onRequest,
            handleChangeStatusSupplier,
            handleEditSupplier,
            handleDestroySupplier
        }
    }
})
</script>
