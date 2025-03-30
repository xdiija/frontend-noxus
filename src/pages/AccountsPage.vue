<template>
    <div class="q-pa-md">
    <router-view />
    <ViewHeader
        :title="headerProps.title"
        :btnTo="headerProps.btnTo"
        :btnIcon="headerProps.btnIcon"
        :btnName="headerProps.btnName"
    />
        <q-table :rows="rows" :columns="columns" row-key="name">
            <template v-slot:body-cell-actions="props">
                <q-td :props="props" class="q-gutter-sm">
                    <q-btn
                        :icon="props.row.status.name === 'Ativo' ? 'toggle_on' : 'toggle_off'"
                        :color="props.row.status.name === 'Ativo' ? 'positive' : 'negative'"
                        dense size="sm"
                        @click="handleChangeStatus(props.row.id)">
                        <q-tooltip class="bg-accent">
                            {{ props.row.status.name === 'Ativo' ? 'Inativar' : 'Ativar' }}
                        </q-tooltip>
                    </q-btn>
                    <q-btn
                        icon="edit"
                        color="warning"
                        dense size="sm"
                        @click="handleEditAccount(props.row.id)"
                    >
                        <q-tooltip class="bg-accent">
                            Editar
                        </q-tooltip>
                    </q-btn>
                    <q-btn
                        icon="delete"
                        color="negative"
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
import accountsService from 'src/services/accountsService'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import notifications from '../utils/notifications'
import currency from '../utils/currency';
import { accountTypes } from 'src/constants/accountTypes';

const headerProps = {
    title: 'Contas',
    btnTo: 'accountsForm',
    btnIcon: 'add',
    btnName: 'Adicionar'
}

export default defineComponent({
    name: 'AccountsPage',
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
        const { formatBRL } = currency()
        const router = useRouter()
        const rows = ref([])
        const { list, changeStatus, destroy } = accountsService()
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
                field: row => getAccountTypeName(row.type),
                name: 'type',
                sortable: true,
                align: 'left'
            },
            {
                label: 'Saldo',
                field: row => formatBRL(row.balance),
                name: 'balance',
                sortable: true,
                align: 'left'
            },
            {
                label: 'Status',
                field: row => row.status.name,
                name: 'email',
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
            getAccounts()
        })

        const getAccounts = async () => {
            try {
                const { data } = await list()
                rows.value = data.data
            } catch (error) {
                console.log(error)
            }
        }

        const handleChangeStatus = async (id) => {
            
            try {             
                $q.dialog({
                    title: 'Confirmação',
                    message: 'Deseja realmente alterar o status?',
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
                }).onOk(async () => {
                    await changeStatus(id)
                    notifySuccess('Status alterado com sucesso!')
                    await getAccounts()
                })
            } catch (error) {
                Object.keys(error.response.data.errors).forEach(key => {
                    notifyError(error.response.data.errors[key])
                })
            }
        }

        const handleEditAccount = (id) => {
            router.push({ name: 'accountsForm', params: { id } })
        }

        const handleDestroy = async (id) => {
            try {
                $q.dialog({
                    title: 'Confirmação',
                    message: 'Deseja realmente excluir o registro?',
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
                }).onOk(async () => {
                    await destroy(id)
                    $q.notify({
                        message: `Registro ${id} removido!`,
                        icon: 'check',
                        color: 'positive'
                    })
                    await getAccounts()
                })
            } catch (error) {
                $q.notify({
                    message: 'Erro ao excluir registro!',
                    icon: 'times',
                    color: 'negative'
                })
            }
        }

        const getAccountTypeName = (type) => {
            const accountType = accountTypes.find((item) => item.id === type);
            return accountType.name;
        };

        return {
            headerProps,
            rows,
            columns,
            handleChangeStatus,
            handleEditAccount,
            handleDestroy,
            getAccountTypeName
        }
    }
})
</script>
