<template>
    <div class="q-pa-md">
        <ViewHeader
            :title="headerProps.title"
            :btnTo="headerProps.btnTo"
            :btnIcon="headerProps.btnIcon"
            :btnName="headerProps.btnName"
        />
        <q-form @submit="onSubmit" class="row q-col-gutter-sm">
            <q-input
                outlined
                v-model="form.name"
                label="Nome"
                lazy-rules
                class="col-md-4 col-xs-12"
                hint="Ex.: A1, B2, Filhotes-01"
                :rules="[ val => !!val || 'Campo Obrigatório!']"
            />
            <q-input
                outlined
                v-model.number="form.capacity"
                label="Capacidade"
                type="number"
                min="1"
                class="col-md-2 col-xs-12"
                hint="Máximo de animais ao mesmo tempo"
                :rules="[ val => val >= 1 || 'Mínimo 1!']"
            />
            <q-select
                outlined
                v-model="form.status_id"
                :options="statusOptions"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                label="Status"
                class="col-md-3 col-xs-12"
            />
            <q-select
                outlined
                v-model="form.size_id"
                :options="sizeOptions"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                clearable
                label="Porte máximo (Opcional)"
                class="col-md-3 col-xs-12"
            />
            <q-input
                outlined
                v-model="form.notes"
                label="Observações (Opcional)"
                type="textarea"
                autogrow
                class="col-xs-12"
            />

            <!-- Kennel stays — only in edit mode (need a saved kennel id) -->
            <q-card v-if="isEditMode" flat bordered class="col-xs-12 q-mt-sm">
                <q-card-section>
                    <div class="text-subtitle1 q-mb-sm">Alocações</div>

                    <q-markup-table flat dense v-if="stays.length" class="q-mb-md">
                        <thead>
                            <tr>
                                <th class="text-left">Animal</th>
                                <th class="text-left">Entrada</th>
                                <th class="text-left">Saída</th>
                                <th class="text-left">Motivo</th>
                                <th class="text-left">Situação</th>
                                <th class="text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="s in stays" :key="s.id">
                                <td class="text-left">{{ s.animal?.name || '—' }}</td>
                                <td class="text-left">{{ s.entry_date }}</td>
                                <td class="text-left">{{ s.exit_date || '—' }}</td>
                                <td class="text-left">{{ s.reason || '—' }}</td>
                                <td class="text-left">
                                    <q-chip
                                        dense
                                        :color="s.is_open ? 'positive' : 'grey-7'"
                                        text-color="white"
                                    >
                                        {{ s.is_open ? 'Ativa' : 'Encerrada' }}
                                    </q-chip>
                                </td>
                                <td class="text-right q-gutter-sm">
                                    <q-btn
                                        v-if="s.is_open"
                                        icon="swap_horiz"
                                        color="primary"
                                        dense size="sm" flat
                                        @click="transferStayDialog(s)"
                                    >
                                        <q-tooltip class="bg-accent">Transferir de canil</q-tooltip>
                                    </q-btn>
                                    <q-btn
                                        v-if="s.is_open"
                                        icon="logout"
                                        color="primary"
                                        dense size="sm" flat
                                        @click="closeStayDialog(s)"
                                    >
                                        <q-tooltip class="bg-accent">Encerrar alocação</q-tooltip>
                                    </q-btn>
                                    <q-btn
                                        icon="delete"
                                        color="negative"
                                        dense size="sm" flat
                                        @click="removeStay(s.id)"
                                    >
                                        <q-tooltip class="bg-accent">Excluir</q-tooltip>
                                    </q-btn>
                                </td>
                            </tr>
                        </tbody>
                    </q-markup-table>
                    <div v-else class="text-grey q-mb-md">Nenhuma alocação registrada.</div>

                    <div class="row q-col-gutter-sm items-start">
                        <q-select
                            outlined dense
                            v-model="newStay.animal_id"
                            :options="animalOptions"
                            option-value="id"
                            option-label="name"
                            emit-value
                            map-options
                            use-input
                            input-debounce="300"
                            label="Animal"
                            class="col-md-4 col-xs-12"
                            @filter="filterAnimals"
                        />
                        <q-input
                            outlined dense
                            v-model="newStay.entry_date"
                            label="Data de entrada"
                            mask="##/##/####"
                            placeholder="dd/mm/aaaa"
                            class="col-md-3 col-xs-12"
                        >
                            <template v-slot:append>
                                <q-icon name="event" class="cursor-pointer">
                                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                        <q-date v-model="newStay.entry_date" mask="DD/MM/YYYY">
                                            <div class="row items-center justify-end">
                                                <q-btn v-close-popup label="Fechar" color="primary" flat />
                                            </div>
                                        </q-date>
                                    </q-popup-proxy>
                                </q-icon>
                            </template>
                        </q-input>
                        <q-input
                            outlined dense
                            v-model="newStay.reason"
                            label="Motivo (Opcional)"
                            class="col-md-3 col-xs-12"
                        />
                        <div class="col-md-2 col-xs-12">
                            <q-btn
                                label="Alocar"
                                color="primary"
                                icon="add"
                                dense
                                class="q-mt-xs"
                                :loading="savingStay"
                                @click="addStay"
                            />
                        </div>
                    </div>
                </q-card-section>
            </q-card>

            <div class="col-lg-12 col-xs-12 q-mt-md">
                <q-btn label="Salvar" type="submit" class="float-right" color="primary" icon="save" />
                <q-btn
                    label="Sair"
                    color="primary"
                    class="float-right q-mr-sm"
                    icon="arrow_back"
                    :to="{ name: listRoute }"
                    outline
                />
            </div>
        </q-form>
    </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import kennelsService from 'src/services/kennelsService'
import kennelStaysService from 'src/services/kennelStaysService'
import { useQuasar } from 'quasar'
import { useRouter, useRoute } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import ClosePlacementDialog from 'components/ClosePlacementDialog.vue'
import TransferStayDialog from 'components/TransferStayDialog.vue'
import notifications from '../utils/notifications'

const listRoute = 'kennels'

const headerProps = {
    title: '',
    btnIcon: 'format_list_numbered',
    btnName: 'Listar',
    btnTo: listRoute
}

// dd/mm/yyyy -> yyyy-mm-dd
const brDateToDb = (value) => {
    if (!value) return null
    const [d, m, y] = value.split('/')
    return (d && m && y) ? `${y}-${m}-${d}` : null
}

const emptyStay = () => ({
    animal_id: null,
    entry_date: '',
    reason: ''
})

export default defineComponent({
    name: 'KennelsForm',
    components: { ViewHeader },
    setup () {
        const $q = useQuasar()
        const router = useRouter()
        const route = useRoute()
        const { post, getByID, update, list: listKennels, getFormOptions, listAnimalOptions } = kennelsService()
        const { notifySuccess, notifyError } = notifications()

        const form = ref({
            name: '',
            capacity: 1,
            status_id: null,
            size_id: null,
            notes: ''
        })

        const statusOptions = ref([])
        const sizeOptions = ref([])
        const stays = ref([])
        const newStay = ref(emptyStay())
        const savingStay = ref(false)
        const animalOptions = ref([])

        const isEditMode = computed(() => !!route.params.id)
        headerProps.title = isEditMode.value ? 'Editar Canil' : 'Cadastrar Canil'

        onMounted(async () => {
            await loadOptions()
            if (route.params.id) {
                await Promise.all([
                    getKennel(route.params.id),
                    getStays(),
                    loadAnimals('')
                ])
            }
        })

        // Statuses + sizes come from /kennels/form-options (kennels
        // permission), so the form doesn't depend on the lookup menu grants.
        const loadOptions = async () => {
            try {
                const { data } = await getFormOptions()
                statusOptions.value = data.data.statuses
                sizeOptions.value = data.data.sizes
                // Preselect the system default ("Disponível") on create.
                if (!isEditMode.value && form.value.status_id === null) {
                    form.value.status_id = data.data.statuses.find(s => s.is_default)?.id ?? null
                }
            } catch (error) {
                notifyError('Erro ao carregar opções do formulário!')
            }
        }

        const getKennel = async (id) => {
            try {
                const { data } = await getByID(id)
                const kennel = data.data

                form.value = {
                    id: kennel.id,
                    name: kennel.name,
                    capacity: kennel.capacity,
                    status_id: kennel.status?.id ?? null,
                    size_id: kennel.size?.id ?? null,
                    notes: kennel.notes ?? ''
                }
            } catch (error) {
                notifyError(error.response?.data?.message || 'Erro ao carregar canil!')
                router.push({ name: listRoute })
            }
        }

        const getStays = async () => {
            try {
                const { list } = kennelStaysService(route.params.id)
                const { data } = await list()
                stays.value = data.data
            } catch (error) {
                notifyError('Erro ao carregar alocações!')
            }
        }

        // Slim picker from /kennels/animal-options (kennels permission), so
        // the stay dialog doesn't depend on the animals menu grant.
        const loadAnimals = async (val) => {
            const { data } = await listAnimalOptions(val)
            animalOptions.value = data.data
        }

        const filterAnimals = (val, update) => {
            update(async () => {
                try { await loadAnimals(val) } catch (e) { animalOptions.value = [] }
            })
        }

        const makePayload = () => ({
            name: form.value.name,
            capacity: form.value.capacity,
            status_id: form.value.status_id,
            size_id: form.value.size_id || null,
            notes: form.value.notes || null
        })

        const onSubmit = async () => {
            form.value.id ? updateKennel() : newKennel()
        }

        const updateKennel = async () => {
            try {
                await update(makePayload(), form.value.id)
                notifySuccess('Canil atualizado com sucesso!')
                router.push({ name: listRoute })
            } catch (error) {
                handleErrors(error)
            }
        }

        const newKennel = async () => {
            try {
                await post(makePayload())
                notifySuccess('Canil criado com sucesso!')
                router.push({ name: listRoute })
            } catch (error) {
                handleErrors(error)
            }
        }

        const addStay = async () => {
            if (!newStay.value.animal_id || !newStay.value.entry_date) {
                notifyError('Informe o animal e a data de entrada.')
                return
            }
            savingStay.value = true
            try {
                const { post: postStay } = kennelStaysService(route.params.id)
                await postStay({
                    animal_id: newStay.value.animal_id,
                    entry_date: brDateToDb(newStay.value.entry_date),
                    reason: newStay.value.reason || null
                })
                newStay.value = emptyStay()
                notifySuccess('Animal alocado!')
                await getStays()
            } catch (error) {
                handleErrors(error)
            } finally {
                savingStay.value = false
            }
        }

        const closeStayDialog = (stay) => {
            $q.dialog({
                component: ClosePlacementDialog,
                componentProps: {
                    message: `Encerrar a alocação de ${stay.animal?.name || 'animal'}?`
                }
            }).onOk(async (payload) => {
                try {
                    const { closeStay } = kennelStaysService(route.params.id)
                    await closeStay(stay.id, payload)
                    notifySuccess('Alocação encerrada!')
                    await getStays()
                } catch (error) {
                    handleErrors(error)
                }
            })
        }

        const transferStayDialog = async (stay) => {
            let options = []
            try {
                // All kennels except this one; the backend re-validates
                // capacity/maintenance on transfer.
                const { data } = await listKennels('', { per_page: 100 })
                options = data.data.filter(k => k.id !== Number(route.params.id))
            } catch (error) {
                notifyError('Erro ao carregar canis!')
                return
            }

            $q.dialog({
                component: TransferStayDialog,
                componentProps: {
                    message: `Transferir ${stay.animal?.name || 'animal'} para outro canil?`,
                    kennelOptions: options
                }
            }).onOk(async (payload) => {
                try {
                    const { transferStay } = kennelStaysService(route.params.id)
                    await transferStay(stay.id, payload)
                    notifySuccess('Animal transferido!')
                    await getStays()
                } catch (error) {
                    handleErrors(error)
                }
            })
        }

        const removeStay = (stayId) => {
            $q.dialog({
                title: 'Confirmação',
                message: 'Deseja remover esta alocação?',
                cancel: { label: 'Cancelar', color: 'primary', outline: true },
                ok: { label: 'Confirmar', color: 'primary' },
                persistent: true
            }).onOk(async () => {
                try {
                    const { destroy: destroyStay } = kennelStaysService(route.params.id)
                    await destroyStay(stayId)
                    stays.value = stays.value.filter(s => s.id !== stayId)
                    notifySuccess('Alocação removida!')
                } catch (error) {
                    notifyError('Erro ao remover alocação.')
                }
            })
        }

        const handleErrors = (error) => {
            const errors = error.response?.data?.errors
            if (errors) {
                Object.keys(errors).forEach(key => notifyError(errors[key]))
            } else {
                notifyError(error.response?.data?.message || 'Erro ao salvar canil!')
            }
        }

        return {
            form,
            statusOptions,
            sizeOptions,
            stays,
            newStay,
            savingStay,
            animalOptions,
            isEditMode,
            filterAnimals,
            addStay,
            closeStayDialog,
            transferStayDialog,
            removeStay,
            onSubmit,
            headerProps,
            listRoute
        }
    }
})
</script>
