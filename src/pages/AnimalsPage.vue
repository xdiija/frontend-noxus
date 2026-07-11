<template>
    <div class="q-pa-md">
        <router-view />
        <ViewHeader
            :title="headerProps.title"
            :btnTo="headerProps.btnTo"
            :btnIcon="headerProps.btnIcon"
            :btnName="canCreate('animals') ? headerProps.btnName : ''"
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
import animalStatusesService from 'src/services/animalStatusesService'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import SelectNotesDialog from 'components/SelectNotesDialog.vue'
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
        const { list, changeStatus, destroy } = animalsService()
        const { list: listStatuses } = animalStatusesService()
        const { canUpdate, canCreate } = usePermissions()

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

        const getStatuses = async () => {
            try {
                const { data } = await listStatuses()
                statusOptions.value = data.data.map(s => ({ label: s.name, value: s.id }))
            } catch (error) {
                console.error('Erro ao carregar status:', error)
            }
        }

        onMounted(() => {
            getStatuses()
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
            handleChangeStatus,
            handleEdit,
            handleDestroy,
            canUpdate,
            canCreate
        }
    }
})
</script>
