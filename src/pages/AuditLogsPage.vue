<template>
    <div class="q-pa-md">
        <router-view />
        <ViewHeader :title="headerProps.title" />
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
                <q-select
                    dense
                    outlined
                    clearable
                    emit-value
                    map-options
                    v-model="entityFilter"
                    :options="entityOptions"
                    label="Entidade"
                    class="q-mr-sm"
                    style="min-width: 150px"
                    @update:model-value="onFilterChange"
                />
                <q-select
                    dense
                    outlined
                    clearable
                    emit-value
                    map-options
                    v-model="actionFilter"
                    :options="actionOptions"
                    label="Ação"
                    class="q-mr-sm"
                    style="min-width: 140px"
                    @update:model-value="onFilterChange"
                />
                <q-input dense debounce="300" v-model="filter" placeholder="Busca">
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </template>
            <template v-slot:body-cell-action="props">
                <q-td :props="props">
                    <q-chip
                        :color="actionColor(props.row.action.id)"
                        text-color="white"
                        dense
                    >
                        {{ props.row.action.name }}
                    </q-chip>
                </q-td>
            </template>
        </q-table>
    </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import ViewHeader from 'components/ViewHeader.vue'
import auditLogsService from 'src/services/auditLogsService'

const headerProps = {
    title: 'Auditoria'
}

// Backend stores the model basename; the PT label is presentation-only.
const ENTITY_LABELS = {
    Animal: 'Animal',
    Adopter: 'Adotante',
    Adoption: 'Adoção',
    Volunteer: 'Voluntário',
    FosterHome: 'Lar Temporário',
    Donor: 'Doador',
    Donation: 'Doação',
    Expense: 'Despesa',
    Document: 'Documento'
}

const ACTION_COLORS = {
    created: 'positive',
    updated: 'primary',
    deleted: 'negative'
}

export default defineComponent({
    name: 'AuditLogsPage',
    components: { ViewHeader },
    setup () {
        const { list } = auditLogsService()

        const rows = ref([])
        const filter = ref('')
        const entityFilter = ref(null)
        const actionFilter = ref(null)
        const loading = ref(false)
        const pagination = ref({
            page: 1,
            rowsPerPage: 10,
            rowsNumber: 0
        })

        const entityOptions = Object.entries(ENTITY_LABELS)
            .map(([value, label]) => ({ value, label }))

        const actionOptions = [
            { value: 'created', label: 'Criação' },
            { value: 'updated', label: 'Atualização' },
            { value: 'deleted', label: 'Exclusão' }
        ]

        const columns = [
            { label: 'ID', field: 'id', name: 'id', sortable: true, align: 'left' },
            { label: 'Data', field: 'created_at', name: 'created_at', align: 'left' },
            { label: 'Usuário', field: row => row.user?.name || '—', name: 'user', align: 'left' },
            { label: 'Ação', field: row => row.action?.name, name: 'action', align: 'left' },
            { label: 'Entidade', field: row => ENTITY_LABELS[row.entity] || row.entity, name: 'entity', align: 'left' },
            { label: 'Registro', field: row => row.entity_id ? `#${row.entity_id}` : '—', name: 'entity_id', align: 'left' }
        ]

        const actionColor = (action) => ACTION_COLORS[action] || 'grey'

        const onRequest = (params) => {
            const { page, rowsPerPage } = params.pagination
            pagination.value.page = page
            pagination.value.rowsPerPage = rowsPerPage
            getAuditLogs()
        }

        const getAuditLogs = async () => {
            loading.value = true
            try {
                const params = {
                    page: pagination.value.page,
                    per_page: pagination.value.rowsPerPage,
                    filter: filter.value,
                    entity: entityFilter.value,
                    action: actionFilter.value
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

        // The selects live outside the q-table :filter binding, so reset the
        // page and refetch manually when they change.
        const onFilterChange = () => {
            pagination.value.page = 1
            getAuditLogs()
        }

        onMounted(() => {
            getAuditLogs()
        })

        return {
            headerProps,
            rows,
            columns,
            filter,
            entityFilter,
            actionFilter,
            entityOptions,
            actionOptions,
            actionColor,
            loading,
            pagination,
            onRequest,
            onFilterChange
        }
    }
})
</script>
