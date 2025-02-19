<template>
    <div class="q-pa-md">
        <router-view />
        <ViewHeader
            :title="headerProps.title"
            :btnTo="headerProps.btnTo"
            :btnIcon="headerProps.btnIcon"
            :btnName="headerProps.btnName"
        />
        <q-table :rows="rows" :columns="columns" row-key="id">
            <template v-slot:body-cell-actions="props">
                <q-td :props="props" class="q-gutter-sm">
                    <q-btn
                        :icon="props.row.status.name === 'Ativo' ? 'toggle_on' : 'toggle_off'"
                        :color="props.row.status.name === 'Ativo' ? 'positive' : 'negative'"
                        dense size="sm"
                        @click="handleChangeStatusCustomer(props.row.id)">
                        <q-tooltip class="bg-accent">
                            {{ props.row.status.name === 'Ativo' ? 'Inativar' : 'Ativar' }}
                        </q-tooltip>
                    </q-btn>
                    <q-btn
                        icon="edit"
                        color="warning"
                        dense size="sm"
                        @click="handleEditCustomer(props.row.id)"
                    >
                        <q-tooltip class="bg-accent">Editar</q-tooltip>
                    </q-btn>
                    <q-btn
                        icon="delete"
                        color="negative"
                        dense size="sm"
                        @click="handleDestroyCustomer(props.row.id)"
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
import customersService from 'src/services/customersService'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import notifications from '../utils/notifications'

const headerProps = {
    title: 'Clientes',
    btnTo: 'customersForm',
    btnIcon: 'add',
    btnName: 'Adicionar Cliente'
}

export default defineComponent({
    name: 'CustomersPage',
    components: { ViewHeader },
    setup () {
        const $q = useQuasar()
        const { notifySuccess, notifyError } = notifications()
        const router = useRouter()
        const rows = ref([])
        const { list, changeStatus, destroy } = customersService()

        const columns = [
            { label: 'ID', field: 'id', name: 'id', sortable: true, align: 'left' },
            { label: 'Nome', field: 'name', name: 'name', sortable: true, align: 'left' },
            { label: 'Email', field: 'email', name: 'email', sortable: true, align: 'left' },
            { label: 'Fone 1', field: 'phone_1', name: 'phone_1', sortable: true, align: 'left' },
            { label: 'Fone 2', field: 'phone_2', name: 'phone_2', sortable: true, align: 'left' },
            { label: 'Status', field: row => row.status.name, name: 'status', sortable: true, align: 'left' }
        ]

        onMounted(() => {
            getCustomers()
        })

        const getCustomers = async () => {
            try {
                const { data } = await list()
                rows.value = data.data
            } catch (error) {
                console.log(error)
            }
        }

        const handleChangeStatusCustomer = async (id) => {
            try {
                $q.dialog({
                    title: 'Confirmação',
                    message: 'Deseja realmente alterar o status do cliente?',
                    cancel: { label: 'Cancelar', color: 'primary', outline: true },
                    ok: { label: 'Confirmar', color: 'primary' },
                    persistent: true
                }).onOk(async () => {
                    await changeStatus(id)
                    notifySuccess('Status alterado com sucesso!')
                    await getCustomers()
                })
            } catch (error) {
                notifyError('Erro ao alterar status do cliente.')
            }
        }

        const handleEditCustomer = (id) => {
            router.push({ name: 'customersForm', params: { id } })
        }

        const handleDestroyCustomer = async (id) => {
            try {
                $q.dialog({
                    title: 'Confirmação',
                    message: 'Deseja realmente excluir este cliente?',
                    cancel: { label: 'Cancelar', color: 'primary', outline: true },
                    ok: { label: 'Confirmar', color: 'primary' },
                    persistent: true
                }).onOk(async () => {
                    await destroy(id)
                    notifySuccess(`Cliente ${id} removido com sucesso!`)
                    await getCustomers()
                })
            } catch (error) {
                notifyError('Erro ao excluir cliente!')
            }
        }

        return {
            headerProps,
            rows,
            columns,
            handleChangeStatusCustomer,
            handleEditCustomer,
            handleDestroyCustomer
        }
    }
})
</script>
