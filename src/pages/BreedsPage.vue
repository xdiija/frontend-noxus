<template>
    <div class="q-pa-md">
        <router-view />
        <ViewHeader
            :title="headerProps.title"
            :btnTo="headerProps.btnTo"
            :btnIcon="headerProps.btnIcon"
            :btnName="canCreate('breeds') ? headerProps.btnName : ''"
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
                <q-select
                    dense
                    outlined
                    class="q-mr-sm"
                    style="min-width: 180px"
                    v-model="speciesFilter"
                    :options="speciesOptions"
                    option-value="id"
                    option-label="name"
                    emit-value
                    map-options
                    clearable
                    label="Espécie"
                    @update:model-value="getBreeds"
                />
                <q-input dense debounce="300" v-model="filter" placeholder="Busca">
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </template>
            <template v-slot:body-cell-actions="props">
                <q-td :props="props" class="q-gutter-sm">
                    <template v-if="canUpdate('breeds')">
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
import breedsService from 'src/services/breedsService'
import speciesService from 'src/services/speciesService'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import notifications from '../utils/notifications'
import usePermissions from 'src/composables/usePermissions'

const headerProps = {
    title: 'Raças',
    btnTo: 'breedsForm',
    btnIcon: 'add',
    btnName: 'Adicionar'
}

export default defineComponent({
    name: 'BreedsPage',
    components: { ViewHeader },
    setup () {
        const $q = useQuasar()
        const { notifySuccess, notifyError } = notifications()
        const router = useRouter()
        const rows = ref([])
        const filter = ref('')
        const loading = ref(false)
        const speciesOptions = ref([])
        const speciesFilter = ref(null)
        const { list, destroy } = breedsService()
        const { list: listSpecies } = speciesService()
        const { canCreate, canUpdate } = usePermissions()

        const columns = [
            { label: 'ID', field: 'id', name: 'id', sortable: true, align: 'left' },
            { label: 'Nome', field: 'name', name: 'name', sortable: true, align: 'left' },
            { label: 'Espécie', field: row => row.species?.name, name: 'species', sortable: true, align: 'left' },
            { label: 'Ações', field: 'actions', name: 'actions', align: 'right' }
        ]

        const getBreeds = async () => {
            loading.value = true

            try {
                const { data } = await list('', { species_id: speciesFilter.value })
                rows.value = data.data
            } catch (error) {
                console.error('Erro na requisição:', error)
            } finally {
                loading.value = false
            }
        }

        const getSpecies = async () => {
            try {
                const { data } = await listSpecies()
                speciesOptions.value = data.data
            } catch (error) {
                console.error('Erro na requisição:', error)
            }
        }

        onMounted(() => {
            getSpecies()
            getBreeds()
        })

        const handleEdit = (id) => {
            router.push({ name: 'breedsForm', params: { id } })
        }

        const handleDestroy = async (id) => {
            try {
                $q.dialog({
                    title: 'Confirmação',
                    message: 'Deseja mesmo excluir esta raça?',
                    cancel: { label: 'Cancelar', color: 'primary', outline: true },
                    ok: { label: 'Confirmar', color: 'primary' },
                    persistent: true
                }).onOk(async () => {
                    await destroy(id)
                    notifySuccess('Raça removida com sucesso!')
                    await getBreeds()
                })
            } catch (error) {
                notifyError('Erro ao excluir raça!')
            }
        }

        return {
            headerProps,
            rows,
            columns,
            filter,
            loading,
            speciesOptions,
            speciesFilter,
            getBreeds,
            handleEdit,
            handleDestroy,
            canCreate,
            canUpdate
        }
    }
})
</script>
