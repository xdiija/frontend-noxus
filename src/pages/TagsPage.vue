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
            :loading="loading"
            :rows-per-page-options="[10, 20, 50]"
        >
            <template v-slot:top-right>
                <q-input dense debounce="300" v-model="filter" placeholder="Busca">
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </template>
            <template v-slot:body-cell-is_custom="props">
                <q-td :props="props">
                    <q-badge :color="props.row.is_custom ? 'primary' : 'grey-6'">
                        {{ props.row.is_custom ? 'Personalizado' : 'Padrão do sistema' }}
                    </q-badge>
                </q-td>
            </template>
            <template v-slot:body-cell-actions="props">
                <q-td :props="props" class="q-gutter-sm">
                    <template v-if="props.row.is_custom">
                        <q-btn
                            icon="edit"
                            color="primary"
                            dense size="sm"
                            @click="handleEdit(props.row.id)"
                        >
                            <q-tooltip class="bg-accent">Editar</q-tooltip>
                        </q-btn>
                        <q-btn
                            icon="delete"
                            color="primary"
                            dense size="sm"
                            @click="handleDestroy(props.row.id)"
                        >
                            <q-tooltip class="bg-accent">Excluir</q-tooltip>
                        </q-btn>
                    </template>
                    <q-icon v-else name="lock" color="grey-6" size="sm">
                        <q-tooltip class="bg-accent">Somente leitura</q-tooltip>
                    </q-icon>
                </q-td>
            </template>
        </q-table>
    </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import tagsService from 'src/services/tagsService'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import notifications from '../utils/notifications'

const headerProps = {
    title: 'Etiquetas',
    btnTo: 'tagsForm',
    btnIcon: 'add',
    btnName: 'Adicionar'
}

export default defineComponent({
    name: 'TagsPage',
    components: { ViewHeader },
    setup () {
        const $q = useQuasar()
        const { notifySuccess, notifyError } = notifications()
        const router = useRouter()
        const rows = ref([])
        const filter = ref('')
        const loading = ref(false)
        const { list, destroy } = tagsService()

        const columns = [
            { label: 'ID', field: 'id', name: 'id', sortable: true, align: 'left' },
            { label: 'Nome', field: 'name', name: 'name', sortable: true, align: 'left' },
            { label: 'Tipo', field: 'is_custom', name: 'is_custom', sortable: true, align: 'left' },
            { label: 'Ações', field: 'actions', name: 'actions', align: 'right' }
        ]

        const getTags = async () => {
            loading.value = true

            try {
                const { data } = await list()
                rows.value = data.data
            } catch (error) {
                console.error('Erro na requisição:', error)
            } finally {
                loading.value = false
            }
        }

        onMounted(() => {
            getTags()
        })

        const handleEdit = (id) => {
            router.push({ name: 'tagsForm', params: { id } })
        }

        const handleDestroy = async (id) => {
            try {
                $q.dialog({
                    title: 'Confirmação',
                    message: 'Deseja mesmo excluir esta etiqueta?',
                    cancel: { label: 'Cancelar', color: 'primary', outline: true },
                    ok: { label: 'Confirmar', color: 'primary' },
                    persistent: true
                }).onOk(async () => {
                    await destroy(id)
                    notifySuccess('Etiqueta removida com sucesso!')
                    await getTags()
                })
            } catch (error) {
                notifyError('Erro ao excluir etiqueta!')
            }
        }

        return {
            headerProps,
            rows,
            columns,
            filter,
            loading,
            handleEdit,
            handleDestroy
        }
    }
})
</script>
