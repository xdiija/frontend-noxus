<template>
    <div class="q-pa-md">
        <router-view />
        <ViewHeader
            :title="headerProps.title"
            :btnTo="headerProps.btnTo"
            :btnIcon="headerProps.btnIcon"
            :btnName="canCreate('animal-sizes') ? headerProps.btnName : ''"
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
            <template v-slot:body-cell-actions="props">
                <q-td :props="props" class="q-gutter-sm">
                    <template v-if="canUpdate('animal-sizes')">
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
                </q-td>
            </template>
        </q-table>
    </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import animalSizesService from 'src/services/animalSizesService'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import notifications from '../utils/notifications'
import usePermissions from 'src/composables/usePermissions'

const headerProps = {
    title: 'Portes',
    btnTo: 'animalSizesForm',
    btnIcon: 'add',
    btnName: 'Adicionar'
}

export default defineComponent({
    name: 'AnimalSizesPage',
    components: { ViewHeader },
    setup () {
        const $q = useQuasar()
        const { notifySuccess, notifyError } = notifications()
        const router = useRouter()
        const rows = ref([])
        const filter = ref('')
        const loading = ref(false)
        const { list, destroy } = animalSizesService()
        const { canCreate, canUpdate } = usePermissions()

        const columns = [
            { label: 'ID', field: 'id', name: 'id', sortable: true, align: 'left' },
            { label: 'Nome', field: 'name', name: 'name', sortable: true, align: 'left' },
            { label: 'Ordem', field: 'sort_order', name: 'sort_order', sortable: true, align: 'left' },
            { label: 'Ações', field: 'actions', name: 'actions', align: 'right' }
        ]

        const getAnimalSizes = async () => {
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
            getAnimalSizes()
        })

        const handleEdit = (id) => {
            router.push({ name: 'animalSizesForm', params: { id } })
        }

        const handleDestroy = async (id) => {
            try {
                $q.dialog({
                    title: 'Confirmação',
                    message: 'Deseja mesmo excluir este porte?',
                    cancel: { label: 'Cancelar', color: 'primary', outline: true },
                    ok: { label: 'Confirmar', color: 'primary' },
                    persistent: true
                }).onOk(async () => {
                    await destroy(id)
                    notifySuccess('Porte removido com sucesso!')
                    await getAnimalSizes()
                })
            } catch (error) {
                notifyError('Erro ao excluir porte!')
            }
        }

        return {
            headerProps,
            rows,
            columns,
            filter,
            loading,
            handleEdit,
            handleDestroy,
            canCreate,
            canUpdate
        }
    }
})
</script>
