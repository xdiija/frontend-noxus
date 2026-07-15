<template>
    <div class="q-pa-md">
        <router-view />
        <ViewHeader
            :title="headerProps.title"
            :btnTo="headerProps.btnTo"
            :btnIcon="headerProps.btnIcon"
            :btnName="canCreate('kennels') ? headerProps.btnName : ''"
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
            <template v-slot:body-cell-status="props">
                <q-td :props="props">
                    <q-chip
                        dense
                        :style="{ backgroundColor: props.row.status?.color || '#9E9E9E' }"
                        text-color="white"
                    >
                        {{ props.row.status?.name || '—' }}
                    </q-chip>
                </q-td>
            </template>
            <template v-slot:body-cell-occupancy="props">
                <q-td :props="props">
                    <q-chip
                        dense
                        :color="occupancyColor(props.row)"
                        text-color="white"
                    >
                        {{ occupancyLabel(props.row) }}
                    </q-chip>
                </q-td>
            </template>
            <template v-slot:body-cell-actions="props">
                <q-td :props="props" class="q-gutter-sm">
                    <q-btn
                        v-if="canUpdate('kennels')"
                        icon="edit"
                        color="primary"
                        dense size="sm"
                        @click="handleEdit(props.row.id)"
                    >
                        <q-tooltip class="bg-accent">Editar</q-tooltip>
                    </q-btn>
                    <q-btn
                        v-if="canUpdate('kennels')"
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
import kennelsService from 'src/services/kennelsService'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import notifications from '../utils/notifications'
import usePermissions from 'src/composables/usePermissions'

const headerProps = {
    title: 'Canis',
    btnTo: 'kennelsForm',
    btnIcon: 'add',
    btnName: 'Adicionar'
}

export default defineComponent({
    name: 'KennelsPage',
    components: { ViewHeader },
    setup () {
        const $q = useQuasar()
        const { notifySuccess, notifyError } = notifications()
        const router = useRouter()
        const rows = ref([])
        const filter = ref('')
        const loading = ref(false)
        const pagination = ref({
            page: 1,
            rowsPerPage: 10,
            rowsNumber: 0
        })
        const { list, destroy } = kennelsService()
        const { canUpdate, canCreate } = usePermissions()

        const columns = [
            { label: 'ID', field: 'id', name: 'id', sortable: true, align: 'left' },
            { label: 'Nome', field: 'name', name: 'name', sortable: true, align: 'left' },
            { label: 'Porte máximo', field: row => row.size?.name || '—', name: 'size', align: 'left' },
            { label: 'Status', field: 'status', name: 'status', align: 'left' },
            { label: 'Ocupação', field: 'occupancy', name: 'occupancy', align: 'left' },
            { label: 'Ações', field: 'actions', name: 'actions', align: 'right' }
        ]

        // Open stays against capacity: "1/2".
        const occupancyLabel = (row) => `${row.open_stays_count ?? 0}/${row.capacity}`

        const occupancyColor = (row) => {
            return (row.open_stays_count ?? 0) >= row.capacity ? 'negative' : 'positive'
        }

        const onRequest = (params) => {
            const { page, rowsPerPage } = params.pagination
            pagination.value.page = page
            pagination.value.rowsPerPage = rowsPerPage
            getKennels()
        }

        const getKennels = async () => {
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
            getKennels()
        })

        const handleEdit = (id) => {
            router.push({ name: 'kennelsForm', params: { id } })
        }

        const handleDestroy = (id) => {
            $q.dialog({
                title: 'Confirmação',
                message: 'Deseja mesmo excluir este canil?',
                cancel: { label: 'Cancelar', color: 'primary', outline: true },
                ok: { label: 'Confirmar', color: 'primary' },
                persistent: true
            }).onOk(async () => {
                try {
                    await destroy(id)
                    notifySuccess(`Canil ${id} removido com sucesso!`)
                    await getKennels()
                } catch (error) {
                    const errors = error.response?.data?.errors
                    if (errors) {
                        Object.keys(errors).forEach(key => notifyError(errors[key]))
                    } else {
                        notifyError('Erro ao excluir canil!')
                    }
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
            occupancyLabel,
            occupancyColor,
            onRequest,
            handleEdit,
            handleDestroy,
            canUpdate,
            canCreate
        }
    }
})
</script>
