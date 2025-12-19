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
            row-key="name"
        >
            <template v-slot:body-cell-actions="props">
                <q-td :props="props" class="q-gutter-sm">
                    <q-btn
                        :icon="props.row.status.name === 'Ativo' ? 'toggle_on' : 'toggle_off'"
                        :color="props.row.status.name === 'Ativo' ? 'positive' : 'negative'"
                        dense
                        size="sm"
                        @click="handleChangeStatus(props.row.id)"
                    >
                        <q-tooltip class="bg-accent">
                            {{ props.row.status.name === 'Ativo' ? 'Inativar' : 'Ativar' }}
                        </q-tooltip>
                    </q-btn>

                    <q-btn
                        icon="edit"
                        color="primary"
                        dense
                        size="sm"
                        @click="handleEditBank(props.row.id)"
                    >
                        <q-tooltip class="bg-primary">
                            Editar
                        </q-tooltip>
                    </q-btn>

                    <q-btn
                        icon="delete"
                        color="primary"
                        dense
                        size="sm"
                        @click="handleDestroy(props.row.id)"
                    >
                        <q-tooltip class="bg-primary">
                            Excluir
                        </q-tooltip>
                    </q-btn>
                </q-td>
            </template>
        </q-table>
    </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import banksService from 'src/services/banksService'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import notifications from 'src/utils/notifications'

const headerProps = {
    title: 'Bancos',
    btnTo: 'banksForm',
    btnIcon: 'add',
    btnName: 'Adicionar'
}

export default defineComponent({
    name: 'BanksPage',
    components: { ViewHeader },
    setup () {
        const $q = useQuasar()
        const { notifySuccess, notifyError } = notifications()
        const router = useRouter()
        const rows = ref([])
        const { list, changeStatus, destroy } = banksService()

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
            getBanks()
        })

        const getBanks = async () => {
            try {
                const { data } = await list()
                rows.value = data.data
            } catch (error) {
                console.error(error)
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
                        color: 'primary'
                    },
                    persistent: true
                }).onOk(async () => {
                    await changeStatus(id)
                    notifySuccess('Status alterado com sucesso!')
                    await getBanks()
                })
            } catch (error) {
                Object.keys(error.response.data.errors).forEach(key => {
                    notifyError(error.response.data.errors[key])
                })
            }
        }

        const handleEditBank = (id) => {
            router.push({ name: 'banksForm', params: { id } })
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
                        color: 'primary'
                    },
                    persistent: true
                }).onOk(async () => {
                    await destroy(id)
                    notifySuccess(`Registro ${id} removido!`)
                    await getBanks()
                })
            } catch (error) {
                notifyError('Erro ao excluir registro!')
            }
        }

        return {
            headerProps,
            rows,
            columns,
            handleChangeStatus,
            handleEditBank,
            handleDestroy
        }
    }
})
</script>
