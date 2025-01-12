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
                        @click="handleChangeStatus(props.row.id)"
                    >
                        <q-tooltip class="bg-accent">
                            {{ props.row.status.name === 'Ativo' ? 'Inativar' : 'Ativar' }}
                        </q-tooltip>
                    </q-btn>
                    <q-btn
                        icon="edit"
                        color="warning"
                        dense size="sm"
                        @click="handleEditUser(props.row.id)"
                    >
                        <q-tooltip class="bg-accent">Editar</q-tooltip>
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
import usersService from 'src/services/usersService'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import notifications from '../utils/notifications'

const headerProps = {
    title: 'Usuários',
    btnTo: 'usersForm',
    btnIcon: 'add',
    btnName: 'Adicionar'
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
        const filter = ref('');
        const loading = ref(false);
        const pagination = ref({
            page: 1,
            rowsPerPage: 5,
            rowsNumber: 0
        });
        const { list, changeStatus, destroy } = usersService()
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

        const onRequest = (params) => {
            const { page, rowsPerPage } = params.pagination;
            pagination.value.page = page;
            pagination.value.rowsPerPage = rowsPerPage;
            getUsers();
        };

        const getUsers = async () => {
            loading.value = true;

            
            try {
                const params = {
                    page: pagination.value.page,
                    per_page: pagination.value.rowsPerPage,
                    filter: filter.value
                };

                const { data } = await list("", params);
                
                rows.value = data.data;
                pagination.value.rowsNumber = data.meta.total;
            } catch (error) {
                console.error(error);
                notifyError('Erro ao carregar os usuários.');
            } finally {
                loading.value = false;
            }
        }

        onMounted(() => {
            getUsers()
        })

        const handleChangeStatus = async (id) => {
            
            try {             
                $q.dialog({
                    title: 'Confirmação',
                    message: 'Deseja realmente alterar o status do usuário?',
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
                        color: 'primary'
                    })
                    await getUsers()
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
            filter,
            loading,
            pagination,
            onRequest,
            handleChangeStatus,
            handleEditUser,
            handleDestroy
        }
    }
})
</script>
