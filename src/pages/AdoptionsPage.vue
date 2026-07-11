<template>
    <div class="q-pa-md">
        <router-view />
        <ViewHeader
            :title="headerProps.title"
            :btnTo="headerProps.btnTo"
            :btnIcon="headerProps.btnIcon"
            :btnName="canCreate('adoptions') ? headerProps.btnName : ''"
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
                        v-if="canUpdate('adoptions') && isActive(props.row)"
                        icon="undo"
                        color="orange-8"
                        dense size="sm"
                        @click="handleReturn(props.row)"
                    >
                        <q-tooltip class="bg-accent">Registrar devolução</q-tooltip>
                    </q-btn>
                    <q-btn
                        v-if="canUpdate('adoptions') && isActive(props.row)"
                        icon="cancel"
                        color="grey-7"
                        dense size="sm"
                        @click="handleCancel(props.row)"
                    >
                        <q-tooltip class="bg-accent">Cancelar adoção</q-tooltip>
                    </q-btn>
                    <q-btn
                        v-if="canUpdate('adoptions')"
                        icon="edit"
                        color="primary"
                        dense size="sm"
                        @click="handleEdit(props.row.id)"
                    >
                        <q-tooltip class="bg-accent">Editar</q-tooltip>
                    </q-btn>
                    <q-btn
                        v-if="canUpdate('adoptions')"
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
import adoptionsService from 'src/services/adoptionsService'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import SelectNotesDialog from 'components/SelectNotesDialog.vue'
import ReturnAdoptionDialog from 'components/ReturnAdoptionDialog.vue'
import notifications from '../utils/notifications'
import usePermissions from 'src/composables/usePermissions'

const headerProps = {
    title: 'Adoções',
    btnTo: 'adoptionsForm',
    btnIcon: 'add',
    btnName: 'Adicionar'
}

// An adoption is "active" (returnable/cancellable) while pending/completed and
// not yet returned — mirrors the backend "one active adoption" rule (ADR-0002).
const ACTIVE_STATUSES = ['Pendente', 'Concluída']

export default defineComponent({
    name: 'AdoptionsPage',
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
        const { list, destroy, returnAdoption, cancelAdoption } = adoptionsService()
        const { canUpdate, canCreate } = usePermissions()

        const columns = [
            { label: 'ID', field: 'id', name: 'id', sortable: true, align: 'left' },
            { label: 'Animal', field: row => row.animal?.name || '—', name: 'animal', align: 'left' },
            { label: 'Adotante', field: row => row.adopter?.name || '—', name: 'adopter', align: 'left' },
            { label: 'Data', field: 'adoption_date', name: 'adoption_date', align: 'left' },
            { label: 'Contrato', field: row => row.agreement_signed ? 'Sim' : 'Não', name: 'agreement_signed', align: 'left' },
            { label: 'Status', field: row => row.status?.name, name: 'status', align: 'left' },
            { label: 'Ações', field: 'actions', name: 'actions', align: 'right' }
        ]

        const chipStyle = (color) => ({ backgroundColor: color || '#6B7280' })

        const isActive = (row) => !row.return_date && ACTIVE_STATUSES.includes(row.status?.name)

        const onRequest = (params) => {
            const { page, rowsPerPage } = params.pagination
            pagination.value.page = page
            pagination.value.rowsPerPage = rowsPerPage
            getAdoptions()
        }

        const getAdoptions = async () => {
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
            getAdoptions()
        })

        const handleReturn = (row) => {
            $q.dialog({
                component: ReturnAdoptionDialog,
                componentProps: {
                    message: `Devolução de ${row.animal?.name || 'animal'} por ${row.adopter?.name || 'adotante'}:`
                }
            }).onOk(async (payload) => {
                try {
                    await returnAdoption(row.id, payload)
                    notifySuccess('Devolução registrada com sucesso!')
                    await getAdoptions()
                } catch (error) {
                    notifyError('Erro ao registrar devolução.')
                }
            })
        }

        const handleCancel = (row) => {
            $q.dialog({
                component: SelectNotesDialog,
                componentProps: {
                    title: 'Cancelar adoção',
                    message: `Cancelar a adoção de ${row.animal?.name || 'animal'}?`,
                    showSelect: false,
                    notesLabel: 'Observações (opcional)'
                }
            }).onOk(async ({ notes }) => {
                try {
                    await cancelAdoption(row.id, { notes })
                    notifySuccess('Adoção cancelada com sucesso!')
                    await getAdoptions()
                } catch (error) {
                    notifyError('Erro ao cancelar adoção.')
                }
            })
        }

        const handleEdit = (id) => {
            router.push({ name: 'adoptionsForm', params: { id } })
        }

        const handleDestroy = (id) => {
            $q.dialog({
                title: 'Confirmação',
                message: 'Deseja mesmo excluir esta adoção?',
                cancel: { label: 'Cancelar', color: 'primary', outline: true },
                ok: { label: 'Confirmar', color: 'primary' },
                persistent: true
            }).onOk(async () => {
                try {
                    await destroy(id)
                    notifySuccess(`Adoção ${id} removida com sucesso!`)
                    await getAdoptions()
                } catch (error) {
                    notifyError('Erro ao excluir adoção!')
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
            isActive,
            onRequest,
            handleReturn,
            handleCancel,
            handleEdit,
            handleDestroy,
            canUpdate,
            canCreate
        }
    }
})
</script>
