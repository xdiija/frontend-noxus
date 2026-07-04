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
            <template v-slot:body-cell-color="props">
                <q-td :props="props">
                    <q-badge
                        v-if="props.row.color"
                        :style="{ backgroundColor: props.row.color }"
                        :label="props.row.color"
                    />
                    <span v-else>—</span>
                </q-td>
            </template>
            <template v-slot:body-cell-is_default="props">
                <q-td :props="props">
                    <q-icon
                        :name="props.row.is_default ? 'check_circle' : 'radio_button_unchecked'"
                        :color="props.row.is_default ? 'positive' : 'grey-5'"
                        size="sm"
                    />
                </q-td>
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
import animalStatusesService from 'src/services/animalStatusesService'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import notifications from '../utils/notifications'

const headerProps = {
    title: 'Status dos Animais',
    btnTo: 'animalStatusesForm',
    btnIcon: 'add',
    btnName: 'Adicionar'
}

export default defineComponent({
    name: 'AnimalStatusesPage',
    components: { ViewHeader },
    setup () {
        const $q = useQuasar()
        const { notifySuccess, notifyError } = notifications()
        const router = useRouter()
        const rows = ref([])
        const filter = ref('')
        const loading = ref(false)
        const { list, destroy } = animalStatusesService()

        const columns = [
            { label: 'ID', field: 'id', name: 'id', sortable: true, align: 'left' },
            { label: 'Nome', field: 'name', name: 'name', sortable: true, align: 'left' },
            { label: 'Cor', field: 'color', name: 'color', align: 'left' },
            { label: 'Ordem', field: 'sort_order', name: 'sort_order', sortable: true, align: 'left' },
            { label: 'Padrão', field: 'is_default', name: 'is_default', sortable: true, align: 'left' },
            { label: 'Tipo', field: 'is_custom', name: 'is_custom', sortable: true, align: 'left' },
            { label: 'Ações', field: 'actions', name: 'actions', align: 'right' }
        ]

        const getAnimalStatuses = async () => {
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
            getAnimalStatuses()
        })

        const handleEdit = (id) => {
            router.push({ name: 'animalStatusesForm', params: { id } })
        }

        const handleDestroy = async (id) => {
            try {
                $q.dialog({
                    title: 'Confirmação',
                    message: 'Deseja mesmo excluir este status?',
                    cancel: { label: 'Cancelar', color: 'primary', outline: true },
                    ok: { label: 'Confirmar', color: 'primary' },
                    persistent: true
                }).onOk(async () => {
                    await destroy(id)
                    notifySuccess('Status removido com sucesso!')
                    await getAnimalStatuses()
                })
            } catch (error) {
                notifyError('Erro ao excluir status!')
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
