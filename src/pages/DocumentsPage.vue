<template>
    <div class="q-pa-md">
        <router-view />
        <ViewHeader
            :title="headerProps.title"
            :btnIcon="headerProps.btnIcon"
            :btnName="canCreate('documents') ? headerProps.btnName : ''"
            customClick
            @custom-click="openUploadDialog"
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
                <q-select
                    dense
                    outlined
                    clearable
                    emit-value
                    map-options
                    v-model="ownerTypeFilter"
                    :options="ownerTypeOptions"
                    label="Vínculo"
                    class="q-mr-sm"
                    style="min-width: 160px"
                    @update:model-value="onOwnerFilterChange"
                />
                <q-input dense debounce="300" v-model="filter" placeholder="Busca">
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </template>
            <template v-slot:body-cell-documentable="props">
                <q-td :props="props">
                    <template v-if="props.row.documentable">
                        <q-chip dense color="grey-3" text-color="grey-9">
                            {{ ownerTypeLabel(props.row.documentable.type) }}
                        </q-chip>
                        {{ props.row.documentable.name || `#${props.row.documentable.id}` }}
                    </template>
                    <template v-else>
                        Organização
                    </template>
                </q-td>
            </template>
            <template v-slot:body-cell-actions="props">
                <q-td :props="props" class="q-gutter-sm">
                    <q-btn
                        icon="download"
                        color="primary"
                        dense size="sm"
                        @click="handleDownload(props.row)"
                    >
                        <q-tooltip class="bg-accent">Baixar</q-tooltip>
                    </q-btn>
                    <q-btn
                        v-if="canUpdate('documents')"
                        icon="edit"
                        color="primary"
                        dense size="sm"
                        @click="openEditDialog(props.row)"
                    >
                        <q-tooltip class="bg-accent">Editar tipo</q-tooltip>
                    </q-btn>
                    <q-btn
                        v-if="canUpdate('documents')"
                        icon="delete"
                        color="primary"
                        dense size="sm"
                        @click="handleDestroy(props.row)"
                    >
                        <q-tooltip class="bg-accent">Excluir</q-tooltip>
                    </q-btn>
                </q-td>
            </template>
        </q-table>

        <q-dialog v-model="uploadDialog" persistent>
            <q-card style="min-width: 420px; max-width: 90vw;">
                <q-card-section>
                    <div class="text-h6">Adicionar documento</div>
                </q-card-section>
                <q-card-section class="q-gutter-sm">
                    <q-file
                        outlined
                        dense
                        v-model="uploadForm.file"
                        label="Arquivo"
                        accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.odt,.xls,.xlsx"
                    >
                        <template v-slot:prepend>
                            <q-icon name="attach_file" />
                        </template>
                    </q-file>
                    <q-input
                        outlined
                        dense
                        v-model="uploadForm.type"
                        label="Tipo (Opcional)"
                        hint="Ex.: Contrato, RG, Exame…"
                    />
                    <q-select
                        outlined
                        dense
                        clearable
                        emit-value
                        map-options
                        v-model="uploadForm.documentableType"
                        :options="ownerTypeOptions"
                        label="Vincular a (Opcional)"
                        hint="Deixe vazio para um documento da organização."
                        @update:model-value="onOwnerTypeChange"
                    />
                    <q-select
                        v-if="uploadForm.documentableType"
                        outlined
                        dense
                        v-model="uploadForm.documentableId"
                        :options="ownerOptions"
                        option-value="id"
                        option-label="label"
                        emit-value
                        map-options
                        use-input
                        input-debounce="300"
                        label="Registro vinculado"
                        @filter="filterOwners"
                    />
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn flat label="Cancelar" color="primary" v-close-popup />
                    <q-btn
                        label="Enviar"
                        color="primary"
                        icon="upload"
                        :loading="uploading"
                        :disable="!uploadForm.file || (!!uploadForm.documentableType && !uploadForm.documentableId)"
                        @click="handleUpload"
                    />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <q-dialog v-model="editDialog" persistent>
            <q-card style="min-width: 360px;">
                <q-card-section>
                    <div class="text-h6">Editar tipo</div>
                    <div class="text-caption text-grey-8">{{ editForm.name }}</div>
                </q-card-section>
                <q-card-section>
                    <q-input outlined dense v-model="editForm.type" label="Tipo" />
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn flat label="Cancelar" color="primary" v-close-popup />
                    <q-btn label="Salvar" color="primary" icon="save" @click="handleEditType" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import ViewHeader from 'components/ViewHeader.vue'
import documentsService from 'src/services/documentsService'
import animalsService from 'src/services/animalsService'
import adoptersService from 'src/services/adoptersService'
import adoptionsService from 'src/services/adoptionsService'
import volunteersService from 'src/services/volunteersService'
import fosterHomesService from 'src/services/fosterHomesService'
import notifications from '../utils/notifications'
import usePermissions from 'src/composables/usePermissions'

const headerProps = {
    title: 'Documentos',
    btnIcon: 'upload_file',
    btnName: 'Adicionar'
}

// Friendly owner keys accepted by the API (Document::OWNER_TYPES).
const OWNER_TYPES = [
    { value: 'animal', label: 'Animal' },
    { value: 'adopter', label: 'Adotante' },
    { value: 'adoption', label: 'Adoção' },
    { value: 'volunteer', label: 'Voluntário' },
    { value: 'foster_home', label: 'Lar Temporário' }
]

export default defineComponent({
    name: 'DocumentsPage',
    components: { ViewHeader },
    setup () {
        const $q = useQuasar()
        const { notifySuccess, notifyError } = notifications()
        const { canCreate, canUpdate } = usePermissions()
        const { list, upload, update, destroy } = documentsService()

        const rows = ref([])
        const filter = ref('')
        const ownerTypeFilter = ref(null)
        const loading = ref(false)
        const pagination = ref({
            page: 1,
            rowsPerPage: 10,
            rowsNumber: 0
        })

        const uploadDialog = ref(false)
        const uploading = ref(false)
        const uploadForm = ref({ file: null, type: '', documentableType: null, documentableId: null })
        const ownerOptions = ref([])

        const editDialog = ref(false)
        const editForm = ref({ id: null, name: '', type: '' })

        const columns = [
            { label: 'ID', field: 'id', name: 'id', sortable: true, align: 'left' },
            { label: 'Nome', field: 'name', name: 'name', align: 'left' },
            { label: 'Tipo', field: row => row.type || '—', name: 'type', align: 'left' },
            { label: 'Vínculo', field: row => row.documentable, name: 'documentable', align: 'left' },
            { label: 'Enviado em', field: 'created_at', name: 'created_at', align: 'left' },
            { label: 'Ações', field: 'actions', name: 'actions', align: 'right' }
        ]

        const ownerTypeLabel = (value) =>
            OWNER_TYPES.find(t => t.value === value)?.label || value

        const onRequest = (params) => {
            const { page, rowsPerPage } = params.pagination
            pagination.value.page = page
            pagination.value.rowsPerPage = rowsPerPage
            getDocuments()
        }

        const getDocuments = async () => {
            loading.value = true
            try {
                const params = {
                    page: pagination.value.page,
                    per_page: pagination.value.rowsPerPage,
                    filter: filter.value,
                    documentable_type: ownerTypeFilter.value
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
            getDocuments()
        })

        const openUploadDialog = () => {
            uploadForm.value = { file: null, type: '', documentableType: null, documentableId: null }
            ownerOptions.value = []
            uploadDialog.value = true
        }

        const onOwnerTypeChange = () => {
            uploadForm.value.documentableId = null
            ownerOptions.value = []
        }

        // One search function per owner kind, mapped to the option label the
        // select shows. Adoptions have no name: label by id + animal/adopter.
        const ownerSearchers = {
            animal: async (val) => {
                const { data } = await animalsService().list('', { filter: val, per_page: 20 })
                return data.data.map(row => ({ id: row.id, label: row.name }))
            },
            adopter: async (val) => {
                const { data } = await adoptersService().list('', { filter: val, per_page: 20 })
                return data.data.map(row => ({ id: row.id, label: row.name }))
            },
            adoption: async (val) => {
                const { data } = await adoptionsService().list('', { filter: val, per_page: 20 })
                return data.data.map(row => ({
                    id: row.id,
                    label: `#${row.id} — ${row.animal?.name || 'animal'} / ${row.adopter?.name || 'adotante'}`
                }))
            },
            volunteer: async (val) => {
                const { data } = await volunteersService().list('', { filter: val, per_page: 20 })
                return data.data.map(row => ({ id: row.id, label: row.name }))
            },
            foster_home: async (val) => {
                const { data } = await fosterHomesService().list('', { filter: val, per_page: 20 })
                return data.data.map(row => ({ id: row.id, label: row.name }))
            }
        }

        const filterOwners = (val, update) => {
            update(async () => {
                const search = ownerSearchers[uploadForm.value.documentableType]
                if (!search) {
                    ownerOptions.value = []
                    return
                }
                try {
                    ownerOptions.value = await search(val)
                } catch (error) {
                    ownerOptions.value = []
                }
            })
        }

        const handleUpload = async () => {
            uploading.value = true
            try {
                await upload({
                    file: uploadForm.value.file,
                    type: uploadForm.value.type,
                    documentableType: uploadForm.value.documentableType,
                    documentableId: uploadForm.value.documentableId
                })
                notifySuccess('Documento enviado com sucesso!')
                uploadDialog.value = false
                await getDocuments()
            } catch (error) {
                const errors = error.response?.data?.errors
                if (errors) Object.keys(errors).forEach(k => notifyError(errors[k]))
                else notifyError(error.response?.data?.message || 'Erro ao enviar documento!')
            } finally {
                uploading.value = false
            }
        }

        // Presigned URLs expire, so always open the fresh one from the row.
        const handleDownload = (row) => {
            window.open(row.url, '_blank')
        }

        const openEditDialog = (row) => {
            editForm.value = { id: row.id, name: row.name, type: row.type || '' }
            editDialog.value = true
        }

        const handleEditType = async () => {
            try {
                await update({ type: editForm.value.type || null }, editForm.value.id)
                notifySuccess('Documento atualizado com sucesso!')
                editDialog.value = false
                await getDocuments()
            } catch (error) {
                notifyError('Erro ao atualizar documento!')
            }
        }

        const handleDestroy = (row) => {
            $q.dialog({
                title: 'Confirmação',
                message: `Deseja mesmo excluir o documento "${row.name}"? O arquivo será removido definitivamente.`,
                cancel: { label: 'Cancelar', color: 'primary', outline: true },
                ok: { label: 'Confirmar', color: 'primary' },
                persistent: true
            }).onOk(async () => {
                try {
                    await destroy(row.id)
                    notifySuccess('Documento removido com sucesso!')
                    await getDocuments()
                } catch (error) {
                    notifyError('Erro ao excluir documento!')
                }
            })
        }

        // The q-table :filter binding re-fires @request on text changes; the
        // owner-type select is outside the table, so reset + refetch manually.
        const onOwnerFilterChange = () => {
            pagination.value.page = 1
            getDocuments()
        }

        return {
            headerProps,
            rows,
            columns,
            filter,
            ownerTypeFilter,
            ownerTypeOptions: OWNER_TYPES,
            ownerTypeLabel,
            loading,
            pagination,
            onRequest,
            onOwnerFilterChange,
            uploadDialog,
            uploading,
            uploadForm,
            ownerOptions,
            openUploadDialog,
            onOwnerTypeChange,
            filterOwners,
            handleUpload,
            handleDownload,
            editDialog,
            editForm,
            openEditDialog,
            handleEditType,
            handleDestroy,
            canCreate,
            canUpdate
        }
    }
})
</script>
