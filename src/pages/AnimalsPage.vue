<template>
    <div class="q-pa-md">
        <router-view />
        <ViewHeader
            :title="headerProps.title"
            :btnTo="headerProps.btnTo"
            :btnIcon="headerProps.btnIcon"
            :btnName="canCreate('animals') ? headerProps.btnName : ''"
        />
        <q-tabs
            v-model="speciesTab"
            align="left"
            class="bg-white text-primary q-mb-md"
            inline-label
            @update:model-value="onFilterChange"
        >
            <q-tab name="all" label="Todas" />
            <q-tab
                v-for="option in speciesOptions"
                :key="option.id"
                :name="option.id"
                :label="option.name"
            />
        </q-tabs>

        <q-form class="row q-col-gutter-sm q-mb-md">
            <q-select
                dense
                emit-value
                map-options
                v-model="sexFilter"
                :options="sexFilterOptions"
                label="Sexo"
                class="col-sm-3 col-xs-12"
                @update:model-value="onFilterChange"
            />
            <q-select
                dense
                emit-value
                map-options
                v-model="sizeFilter"
                :options="sizeFilterOptions"
                label="Porte"
                class="col-sm-3 col-xs-12"
                @update:model-value="onFilterChange"
            />
            <q-select
                dense
                emit-value
                map-options
                v-model="statusFilter"
                :options="statusFilterOptions"
                label="Status"
                class="col-sm-3 col-xs-12"
                @update:model-value="onFilterChange"
            />
            <q-input
                dense
                debounce="300"
                v-model="filter"
                placeholder="Busca"
                class="col-md-3 col-xs-12"
            >
                <template v-slot:append>
                    <q-icon name="search" />
                </template>
            </q-input>
        </q-form>

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
            <template v-slot:body-cell-name="props">
                <q-td :props="props">
                    <a class="name-link" @click="openGallery(props.row)">{{ props.value }}</a>
                </q-td>
            </template>
            <template v-slot:body-cell-status="props">
                <q-td :props="props">
                    <q-chip
                        v-if="props.row.status"
                        :style="chipStyle(props.row.status.color)"
                        text-color="white"
                        dense
                    >
                        {{ props.row.status.name }}
                    </q-chip>
                </q-td>
            </template>
            <template v-slot:body-cell-actions="props">
                <q-td :props="props" class="q-gutter-sm">
                    <q-btn
                        v-if="canUpdate('animals')"
                        icon="swap_horiz"
                        color="primary"
                        dense size="sm"
                        @click="handleChangeStatus(props.row)"
                    >
                        <q-tooltip class="bg-accent">Alterar status</q-tooltip>
                    </q-btn>
                    <q-btn
                        v-if="canUpdate('animals')"
                        icon="edit"
                        color="primary"
                        dense size="sm"
                        @click="handleEdit(props.row.id)"
                    >
                        <q-tooltip class="bg-accent">Editar</q-tooltip>
                    </q-btn>
                    <q-btn
                        v-if="canUpdate('animals')"
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
import animalsService from 'src/services/animalsService'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import SelectNotesDialog from 'components/SelectNotesDialog.vue'
import AnimalGalleryDialog from 'components/AnimalGalleryDialog.vue'
import notifications from '../utils/notifications'
import usePermissions from 'src/composables/usePermissions'

const headerProps = {
    title: 'Animais',
    btnTo: 'animalsForm',
    btnIcon: 'add',
    btnName: 'Adicionar'
}

export default defineComponent({
    name: 'AnimalsPage',
    components: { ViewHeader },
    setup () {
        const $q = useQuasar()
        const { notifySuccess, notifyError } = notifications()
        const router = useRouter()
        const rows = ref([])
        const filter = ref('')
        const loading = ref(false)
        const statusOptions = ref([])
        const pagination = ref({
            page: 1,
            rowsPerPage: 10,
            rowsNumber: 0
        })
        const { list, getFormOptions, changeStatus, destroy } = animalsService()
        const { canUpdate, canCreate } = usePermissions()

        // 'all' is the species tab's own sentinel (a q-tab name can't be
        // null); the selects use null directly, resolved by map-options to
        // the "Todos" label.
        const speciesTab = ref('all')
        const statusFilter = ref(null)
        const sexFilter = ref(null)
        const sizeFilter = ref(null)

        const speciesOptions = ref([])
        const statusFilterOptions = ref([{ value: null, label: 'Todos' }])
        const sizeFilterOptions = ref([{ value: null, label: 'Todos' }])
        const sexFilterOptions = [
            { value: null, label: 'Todos' },
            { value: 'M', label: 'Macho' },
            { value: 'F', label: 'Fêmea' }
        ]

        const formatAge = (age) => {
            if (!age) return '—'
            const prefix = age.is_estimated ? '~' : ''
            return `${prefix}${age.years}a ${age.months}m`
        }

        const columns = [
            { label: 'ID', field: 'id', name: 'id', sortable: true, align: 'left' },
            { label: 'Nome', field: 'name', name: 'name', sortable: true, align: 'left' },
            { label: 'Espécie', field: row => row.species?.name, name: 'species', align: 'left' },
            { label: 'Raça', field: row => row.breed?.name || '—', name: 'breed', align: 'left' },
            { label: 'Porte', field: row => row.size?.name, name: 'size', align: 'left' },
            { label: 'Sexo', field: row => row.sex || '—', name: 'sex', align: 'left' },
            { label: 'Idade', field: row => formatAge(row.age), name: 'age', align: 'left' },
            { label: 'Status', field: row => row.status?.name, name: 'status', align: 'left' },
            { label: 'Ações', field: 'actions', name: 'actions', align: 'right' }
        ]

        const chipStyle = (color) => ({ backgroundColor: color || '#6B7280' })

        const onRequest = (params) => {
            const { page, rowsPerPage } = params.pagination
            pagination.value.page = page
            pagination.value.rowsPerPage = rowsPerPage
            getAnimals()
        }

        const getAnimals = async () => {
            loading.value = true
            try {
                const params = {
                    page: pagination.value.page,
                    per_page: pagination.value.rowsPerPage,
                    filter: filter.value,
                    species_id: speciesTab.value === 'all' ? null : speciesTab.value,
                    status_id: statusFilter.value,
                    sex: sexFilter.value,
                    size_id: sizeFilter.value
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

        // Comes from /animals/form-options (animals,view permission), so this
        // page never depends on the species/animal-sizes/animal-statuses
        // lookup grants. Drives the species tabs, the status/size filters and
        // the change-status dialog's status select.
        const getFilterOptions = async () => {
            try {
                const { data } = await getFormOptions()
                speciesOptions.value = data.data.species
                statusFilterOptions.value = [
                    { value: null, label: 'Todos' },
                    ...data.data.statuses.map(s => ({ value: s.id, label: s.name }))
                ]
                sizeFilterOptions.value = [
                    { value: null, label: 'Todos' },
                    ...data.data.sizes.map(s => ({ value: s.id, label: s.name }))
                ]
                statusOptions.value = data.data.statuses.map(s => ({ label: s.name, value: s.id }))
            } catch (error) {
                console.error('Erro ao carregar opções de filtro:', error)
            }
        }

        // The selects live outside the q-table :filter binding, so reset the
        // page and refetch manually when one changes.
        const onFilterChange = () => {
            pagination.value.page = 1
            getAnimals()
        }

        onMounted(() => {
            getFilterOptions()
            getAnimals()
        })

        const handleChangeStatus = (row) => {
            $q.dialog({
                component: SelectNotesDialog,
                componentProps: {
                    title: 'Alterar status',
                    message: `Novo status de ${row.name}:`,
                    selectLabel: 'Status',
                    options: statusOptions.value,
                    initialValue: row.status?.id ?? null,
                    notesLabel: 'Motivo (opcional)'
                }
            }).onOk(async ({ value, notes }) => {
                try {
                    await changeStatus(row.id, { status_id: value, notes })
                    notifySuccess('Status alterado com sucesso!')
                    await getAnimals()
                } catch (error) {
                    notifyError('Erro ao alterar status do animal.')
                }
            })
        }

        const openGallery = (row) => {
            $q.dialog({
                component: AnimalGalleryDialog,
                componentProps: {
                    animalId: row.id,
                    animalName: row.name
                }
            })
        }

        const handleEdit = (id) => {
            router.push({ name: 'animalsForm', params: { id } })
        }

        const handleDestroy = (id) => {
            $q.dialog({
                title: 'Confirmação',
                message: 'Deseja mesmo excluir este animal?',
                cancel: { label: 'Cancelar', color: 'primary', outline: true },
                ok: { label: 'Confirmar', color: 'primary' },
                persistent: true
            }).onOk(async () => {
                try {
                    await destroy(id)
                    notifySuccess(`Animal ${id} removido com sucesso!`)
                    await getAnimals()
                } catch (error) {
                    notifyError('Erro ao excluir animal!')
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
            chipStyle,
            onRequest,
            openGallery,
            handleChangeStatus,
            handleEdit,
            handleDestroy,
            canUpdate,
            canCreate,
            speciesTab,
            speciesOptions,
            statusFilter,
            sexFilter,
            sizeFilter,
            statusFilterOptions,
            sizeFilterOptions,
            sexFilterOptions,
            onFilterChange
        }
    }
})
</script>

<style scoped>
.name-link {
    color: var(--q-primary);
    cursor: pointer;
    text-decoration: none;
}
.name-link:hover {
    text-decoration: underline;
}
</style>
