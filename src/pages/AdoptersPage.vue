<template>
    <div class="q-pa-md">
        <router-view />
        <ViewHeader
            :title="headerProps.title"
            :btnTo="headerProps.btnTo"
            :btnIcon="headerProps.btnIcon"
            :btnName="canCreate('adopters') ? headerProps.btnName : ''"
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
                        v-if="canUpdate('adopters')"
                        icon="edit"
                        color="primary"
                        dense size="sm"
                        @click="handleEdit(props.row.id)"
                    >
                        <q-tooltip class="bg-accent">Editar</q-tooltip>
                    </q-btn>
                    <q-btn
                        v-if="canUpdate('adopters')"
                        icon="delete"
                        color="primary"
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
import adoptersService from 'src/services/adoptersService'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import notifications from '../utils/notifications'
import usePermissions from 'src/composables/usePermissions'
import mask from '../utils/mask'

const headerProps = {
    title: 'Adotantes',
    btnTo: 'adoptersForm',
    btnIcon: 'add',
    btnName: 'Adicionar'
}

export default defineComponent({
    name: 'AdoptersPage',
    components: { ViewHeader },
    setup () {
        const $q = useQuasar()
        const { notifySuccess, notifyError } = notifications()
        const router = useRouter()
        const { cpfMask, phoneMask } = mask()
        const rows = ref([])
        const filter = ref('')
        const loading = ref(false)
        const pagination = ref({
            page: 1,
            rowsPerPage: 10,
            rowsNumber: 0
        })
        const { list, destroy } = adoptersService()
        const { canUpdate, canCreate } = usePermissions()

        const columns = [
            { label: 'ID', field: 'id', name: 'id', sortable: true, align: 'left' },
            { label: 'Nome', field: 'name', name: 'name', sortable: true, align: 'left' },
            { label: 'CPF', field: row => cpfMask(row.cpf) || '—', name: 'cpf', align: 'left' },
            { label: 'Telefone', field: row => phoneMask(row.phone) || '—', name: 'phone', align: 'left' },
            { label: 'Cidade/UF', field: row => [row.city, row.state].filter(Boolean).join('/') || '—', name: 'city', align: 'left' },
            { label: 'Ações', field: 'actions', name: 'actions', align: 'right' }
        ]

        const onRequest = (params) => {
            const { page, rowsPerPage } = params.pagination
            pagination.value.page = page
            pagination.value.rowsPerPage = rowsPerPage
            getAdopters()
        }

        const getAdopters = async () => {
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
            getAdopters()
        })

        const handleEdit = (id) => {
            router.push({ name: 'adoptersForm', params: { id } })
        }

        const handleDestroy = (id) => {
            $q.dialog({
                title: 'Confirmação',
                message: 'Deseja mesmo excluir este adotante?',
                cancel: { label: 'Cancelar', color: 'primary', outline: true },
                ok: { label: 'Confirmar', color: 'primary' },
                persistent: true
            }).onOk(async () => {
                try {
                    await destroy(id)
                    notifySuccess(`Adotante ${id} removido com sucesso!`)
                    await getAdopters()
                } catch (error) {
                    notifyError('Erro ao excluir adotante!')
                }
            })
        }

        return {
            headerProps,
            rows,
            columns,
            filter,
            loading,
            pagination,
            onRequest,
            handleEdit,
            handleDestroy,
            canUpdate,
            canCreate
        }
    }
})
</script>
