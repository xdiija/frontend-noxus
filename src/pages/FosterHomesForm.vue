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
                v-model="form.responsible_name"
                label="Responsável"
                lazy-rules
                class="col-md-6 col-xs-12"
                :rules="[ val => val && val.length > 1 || 'Campo Obrigatório!']"
            />
            <q-input
                outlined
                v-model="maskedPhone"
                label="Telefone (Opcional)"
                class="col-md-3 col-xs-12"
            />
            <q-input
                outlined
                v-model.number="form.capacity"
                label="Capacidade (Opcional)"
                type="number"
                min="1"
                class="col-md-3 col-xs-12"
                hint="Máximo de animais acolhidos ao mesmo tempo"
            />
            <q-input
                outlined
                v-model="form.address"
                label="Endereço (Opcional)"
                class="col-xs-12"
            />

            <!-- Foster stays — only in edit mode (need a saved foster home id) -->
            <q-card v-if="isEditMode" flat bordered class="col-xs-12 q-mt-sm">
                <q-card-section>
                    <div class="text-subtitle1 q-mb-sm">Estadias</div>

                    <q-markup-table flat dense v-if="placements.length" class="q-mb-md">
                        <thead>
                            <tr>
                                <th class="text-left">Animal</th>
                                <th class="text-left">Entrada</th>
                                <th class="text-left">Saída</th>
                                <th class="text-left">Situação</th>
                                <th class="text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="p in placements" :key="p.id">
                                <td class="text-left">{{ p.animal?.name || '—' }}</td>
                                <td class="text-left">{{ p.entry_date }}</td>
                                <td class="text-left">{{ p.exit_date || '—' }}</td>
                                <td class="text-left">
                                    <q-chip
                                        dense
                                        :color="p.is_open ? 'positive' : 'grey-7'"
                                        text-color="white"
                                    >
                                        {{ p.is_open ? 'Ativa' : 'Encerrada' }}
                                    </q-chip>
                                </td>
                                <td class="text-right q-gutter-sm">
                                    <q-btn
                                        v-if="p.is_open"
                                        icon="logout"
                                        color="primary"
                                        dense size="sm" flat
                                        @click="closeStay(p)"
                                    >
                                        <q-tooltip class="bg-accent">Encerrar estadia</q-tooltip>
                                    </q-btn>
                                    <q-btn
                                        icon="delete"
                                        color="negative"
                                        dense size="sm" flat
                                        @click="removeStay(p.id)"
                                    >
                                        <q-tooltip class="bg-accent">Excluir</q-tooltip>
                                    </q-btn>
                                </td>
                            </tr>
                        </tbody>
                    </q-markup-table>
                    <div v-else class="text-grey q-mb-md">Nenhuma estadia registrada.</div>

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
                            class="col-md-5 col-xs-12"
                            @filter="filterAnimals"
                        />
                        <q-input
                            outlined dense
                            v-model="newStay.entry_date"
                            label="Data de entrada"
                            mask="##/##/####"
                            placeholder="dd/mm/aaaa"
                            class="col-md-4 col-xs-12"
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
                        <div class="col-md-3 col-xs-12">
                            <q-btn
                                label="Acolher animal"
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
import fosterHomesService from 'src/services/fosterHomesService'
import fosterPlacementsService from 'src/services/fosterPlacementsService'
import { useQuasar } from 'quasar'
import { useRouter, useRoute } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import ClosePlacementDialog from 'components/ClosePlacementDialog.vue'
import notifications from '../utils/notifications'
import mask from '../utils/mask'

const listRoute = 'fosterHomes'

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
    entry_date: ''
})

export default defineComponent({
    name: 'FosterHomesForm',
    components: { ViewHeader },
    setup () {
        const $q = useQuasar()
        const router = useRouter()
        const route = useRoute()
        const { phoneMask, unMask } = mask()
        const { post, getByID, update, listAnimalOptions } = fosterHomesService()
        const { notifySuccess, notifyError } = notifications()

        const form = ref({
            responsible_name: '',
            phone: '',
            address: '',
            capacity: null
        })

        const placements = ref([])
        const newStay = ref(emptyStay())
        const savingStay = ref(false)
        const animalOptions = ref([])

        const isEditMode = computed(() => !!route.params.id)
        headerProps.title = isEditMode.value ? 'Editar Lar Temporário' : 'Cadastrar Lar Temporário'

        onMounted(async () => {
            if (route.params.id) {
                await Promise.all([
                    getFosterHome(route.params.id),
                    getPlacements(),
                    loadAnimals('')
                ])
            }
        })

        const getFosterHome = async (id) => {
            try {
                const { data } = await getByID(id)
                const fosterHome = data.data

                form.value = {
                    id: fosterHome.id,
                    responsible_name: fosterHome.responsible_name,
                    phone: phoneMask(fosterHome.phone),
                    address: fosterHome.address ?? '',
                    capacity: fosterHome.capacity
                }
            } catch (error) {
                notifyError(error.response?.data?.message || 'Erro ao carregar lar temporário!')
                router.push({ name: listRoute })
            }
        }

        const getPlacements = async () => {
            try {
                const { list } = fosterPlacementsService(route.params.id)
                const { data } = await list()
                placements.value = data.data
            } catch (error) {
                notifyError('Erro ao carregar estadias!')
            }
        }

        // Slim picker from /foster-homes/animal-options (foster-homes
        // permission), so the dialog doesn't depend on the animals menu grant.
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
            responsible_name: form.value.responsible_name,
            phone: unMask(form.value.phone) || null,
            address: form.value.address || null,
            capacity: form.value.capacity || null
        })

        const onSubmit = async () => {
            form.value.id ? updateFosterHome() : newFosterHome()
        }

        const updateFosterHome = async () => {
            try {
                await update(makePayload(), form.value.id)
                notifySuccess('Lar temporário atualizado com sucesso!')
                router.push({ name: listRoute })
            } catch (error) {
                handleErrors(error)
            }
        }

        const newFosterHome = async () => {
            try {
                await post(makePayload())
                notifySuccess('Lar temporário criado com sucesso!')
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
                const { post: postStay } = fosterPlacementsService(route.params.id)
                await postStay({
                    animal_id: newStay.value.animal_id,
                    entry_date: brDateToDb(newStay.value.entry_date)
                })
                newStay.value = emptyStay()
                notifySuccess('Animal acolhido!')
                await getPlacements()
            } catch (error) {
                handleErrors(error)
            } finally {
                savingStay.value = false
            }
        }

        const closeStay = (placement) => {
            $q.dialog({
                component: ClosePlacementDialog,
                componentProps: {
                    message: `Encerrar a estadia de ${placement.animal?.name || 'animal'}?`
                }
            }).onOk(async (payload) => {
                try {
                    const { closePlacement } = fosterPlacementsService(route.params.id)
                    await closePlacement(placement.id, payload)
                    notifySuccess('Estadia encerrada!')
                    await getPlacements()
                } catch (error) {
                    handleErrors(error)
                }
            })
        }

        const removeStay = (placementId) => {
            $q.dialog({
                title: 'Confirmação',
                message: 'Deseja remover esta estadia?',
                cancel: { label: 'Cancelar', color: 'primary', outline: true },
                ok: { label: 'Confirmar', color: 'primary' },
                persistent: true
            }).onOk(async () => {
                try {
                    const { destroy: destroyStay } = fosterPlacementsService(route.params.id)
                    await destroyStay(placementId)
                    placements.value = placements.value.filter(p => p.id !== placementId)
                    notifySuccess('Estadia removida!')
                } catch (error) {
                    notifyError('Erro ao remover estadia.')
                }
            })
        }

        const handleErrors = (error) => {
            const errors = error.response?.data?.errors
            if (errors) {
                Object.keys(errors).forEach(key => notifyError(errors[key]))
            } else {
                notifyError(error.response?.data?.message || 'Erro ao salvar lar temporário!')
            }
        }

        const maskedPhone = computed({
            get () { return form.value.phone || '' },
            set (value) { form.value.phone = value ? phoneMask(value) : '' }
        })

        return {
            form,
            maskedPhone,
            placements,
            newStay,
            savingStay,
            animalOptions,
            isEditMode,
            filterAnimals,
            addStay,
            closeStay,
            removeStay,
            onSubmit,
            headerProps,
            listRoute
        }
    }
})
</script>
