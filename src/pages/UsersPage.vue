<template>
<div class="q-pa-md">
<router-view />
<ViewHeader
    :title="headerProps.title"
    :btnTo="headerProps.btnTo"
    :icon="headerProps.icon"
    :btIcon="headerProps.btIcon"
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
                    icon="edit"
                    color="warning"
                    dense size="sm"
                    @click="handleEditUser(props.row.id)">
                    <q-tooltip class="bg-accent">Editar</q-tooltip>
                </q-btn>
                <q-btn
                    :icon="props.row.status.name === 'Ativo' ? 'toggle_off' : 'toggle_on'"
                    color="warning"
                    dense size="sm"
                    @click="handleChangeStatus(props.row.id)"
                >
                    <q-tooltip class="bg-accent">
                        {{ props.row.status.name === 'Ativo' ? 'Inativar' : 'Ativar' }}
                    </q-tooltip>
                </q-btn>
            </q-td>

        </template>
  </q-table>
</div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import usersService from 'src/services/usersService'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import notifications from '../utils/notifications'

const headerProps = {
    title: 'Usuários',
    icon: 'manage_accounts',
    btnTo: 'usersForm',
    btnName: 'Adicionar',
    btIcon: 'add'
}

export default defineComponent({
    name: 'UsersPage',
    components: {
        ViewHeader
    },
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
        const { list, changeStatus } = usersService()
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
                label: 'Email',
                field: 'email',
                name: 'email',
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
            getUsers()
        })

        const getUsers = async () => {
            try {
                const { data } = await list()
                rows.value = data.data
                console.log(data) // Usar data.meta para paginação
            } catch (error) {
                console.log(error)
            }
        }

        const handleChangeStatus = async (id) => {
            
            try {             
                $q.dialog({
                    title: 'Confirmação',
                    message: 'Deseja realmente alterar o status do usuário?',
                    cancel: {
                        label: 'Cancelar',
                        color: 'secondary',
                        textColor: 'primary'
                    },
                    ok: {
                        label: 'Confirmar',
                        color: 'primary',
                        textColor: 'secondary'
                    },
                    persistent: true
                }).onOk(async () => {
                    await changeStatus(id)
                    notifySuccess('Status alterado com sucesso!')
                    await getUsers()
                })
            } catch (error) {
                Object.keys(error.response.data.errors).forEach(key => {
                    notifyError(error.response.data.errors[key])
                })
            }
        }

        const handleEditUser = (id) => {
            router.push({ name: 'usersForm', params: { id } })
        }

        return {
            headerProps,
            rows,
            columns,
            handleChangeStatus,
            handleEditUser
        }
    }
})
</script>
