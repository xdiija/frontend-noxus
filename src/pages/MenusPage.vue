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
                        @click="handleEditMenu(props.row.id)"
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
import menusService from 'src/services/menusService'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import notifications from '../utils/notifications'

const headerProps = {
    title: 'Menus',
    btnTo: 'menusForm',
    btnIcon: 'add',
    btnName: 'Adicionar'
}

export default defineComponent({
    name: 'MenusPage',
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
        const { list, changeStatus, destroy } = menusService()
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
                label: 'Rota',
                field: 'route',
                field: row => (row.route && row.route != "") ? row.route : '-',
                name: 'route',
                sortable: true,
                align: 'left'
            },
            {
                label: 'Ícone',
                field: 'icon',
                name: 'icon',
                sortable: true,
                align: 'left'
            },
            {
                label: 'Menu Pai',
                field: row => (row.parent && row.parent.name) ? row.parent.name : '-',
                name: 'parent',
                sortable: true,
                align: 'left'
            },
            {
                label: 'Exclusivo Noxus',
                field: 'exclusive_noxus',
                field: row => row.exclusive_noxus ? 'Sim' : 'Não',
                name: 'parent',
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
            getMenus()
        })

        const getMenus = async () => {
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
                    message: 'Deseja realmente alterar o status do menu?',
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
                    await getMenus()
                })
            } catch (error) {
                Object.keys(error.response.data.errors).forEach(key => {
                    notifyError(error.response.data.errors[key])
                })
            }
        }

        const handleEditMenu = (id) => {
            router.push({ name: 'menusForm', params: { id } })
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
                    await getMenus()
                })
            } catch (error) {
                $q.notify({
                    message: 'Erro ao excluir registro!',
                    icon: 'times',
                    color: 'negative'
                })
            }
        }

        return {
            headerProps,
            rows,
            columns,
            handleChangeStatus,
            handleEditMenu,
            handleDestroy
        }
    }
})
</script>
