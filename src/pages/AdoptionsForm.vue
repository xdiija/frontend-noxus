<template>
    <div class="q-pa-md">
        <ViewHeader
            :title="headerProps.title"
            :btnTo="headerProps.btnTo"
            :btnIcon="headerProps.btnIcon"
            :btnName="headerProps.btnName"
        />
        <q-form @submit="onSubmit" class="row q-col-gutter-sm">
            <q-select
                outlined
                v-model="form.animal_id"
                :options="animalOptions"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                use-input
                input-debounce="300"
                label="Animal"
                class="col-md-6 col-xs-12"
                :disable="isEditMode"
                :hint="isEditMode ? 'O animal não pode ser alterado após a adoção.' : ''"
                :rules="[ val => !!val || 'Campo Obrigatório!']"
                @filter="filterAnimals"
            />

            <q-select
                outlined
                v-model="form.adopter_id"
                :options="adopterOptions"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                use-input
                input-debounce="300"
                label="Adotante"
                class="col-md-6 col-xs-12"
                :rules="[ val => !!val || 'Campo Obrigatório!']"
                @filter="filterAdopters"
            />

            <q-input
                outlined
                v-model="form.adoption_date"
                label="Data da adoção"
                mask="##/##/####"
                placeholder="dd/mm/aaaa"
                class="col-md-4 col-xs-12"
                :rules="[ val => !!val || 'Campo Obrigatório!']"
            >
                <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                            <q-date v-model="form.adoption_date" mask="DD/MM/YYYY">
                                <div class="row items-center justify-end">
                                    <q-btn v-close-popup label="Fechar" color="primary" flat />
                                </div>
                            </q-date>
                        </q-popup-proxy>
                    </q-icon>
                </template>
            </q-input>

            <q-select
                outlined
                v-model="form.status_id"
                :options="statusOptions"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                clearable
                label="Status"
                class="col-md-4 col-xs-12"
                :disable="isEditMode"
                :hint="isEditMode ? 'Use Devolver/Cancelar na listagem para mudar o status.' : 'Padrão: Pendente'"
            />

            <div class="col-md-4 col-xs-12 flex items-center self-start" style="height: 56px">
                <q-toggle v-model="form.agreement_signed" label="Contrato assinado" />
            </div>

            <q-input
                outlined
                type="textarea"
                v-model="form.notes"
                label="Observações (Opcional)"
                class="col-xs-12"
            />

            <!-- Post-adoption follow-ups — only in edit mode (need a saved adoption id) -->
            <q-card v-if="isEditMode" flat bordered class="col-xs-12 q-mt-sm">
                <q-card-section>
                    <div class="text-subtitle1 q-mb-sm">Acompanhamentos pós-adoção</div>

                    <q-markup-table flat dense v-if="followUps.length" class="q-mb-md">
                        <thead>
                            <tr>
                                <th class="text-left">Data</th>
                                <th class="text-left">Contato</th>
                                <th class="text-left">Status</th>
                                <th class="text-left">Observações</th>
                                <th class="text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="f in followUps" :key="f.id">
                                <td class="text-left">{{ f.follow_up_date }}</td>
                                <td class="text-left">{{ f.contact_method || '—' }}</td>
                                <td class="text-left">
                                    <q-chip
                                        v-if="f.status"
                                        :style="chipStyle(f.status.color)"
                                        text-color="white"
                                        dense
                                    >
                                        {{ f.status.name }}
                                    </q-chip>
                                </td>
                                <td class="text-left">{{ f.notes || '—' }}</td>
                                <td class="text-right">
                                    <q-btn
                                        icon="delete"
                                        color="negative"
                                        dense size="sm" flat
                                        @click="removeFollowUp(f.id)"
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </q-markup-table>
                    <div v-else class="text-grey q-mb-md">Nenhum acompanhamento registrado.</div>

                    <div class="row q-col-gutter-sm items-start">
                        <q-input
                            outlined dense
                            v-model="newFollowUp.follow_up_date"
                            label="Data"
                            mask="##/##/####"
                            placeholder="dd/mm/aaaa"
                            class="col-md-3 col-xs-12"
                        >
                            <template v-slot:append>
                                <q-icon name="event" class="cursor-pointer">
                                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                        <q-date v-model="newFollowUp.follow_up_date" mask="DD/MM/YYYY">
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
                            v-model="newFollowUp.contact_method"
                            label="Contato (Opcional)"
                            class="col-md-3 col-xs-12"
                        />
                        <q-select
                            outlined dense
                            v-model="newFollowUp.status_id"
                            :options="followUpStatusOptions"
                            option-value="id"
                            option-label="name"
                            emit-value
                            map-options
                            label="Status"
                            class="col-md-3 col-xs-12"
                        />
                        <q-input
                            outlined dense
                            v-model="newFollowUp.notes"
                            label="Observações (Opcional)"
                            class="col-md-3 col-xs-12"
                        />
                        <div class="col-xs-12">
                            <q-btn
                                label="Adicionar acompanhamento"
                                color="primary"
                                icon="add"
                                dense
                                :loading="savingFollowUp"
                                @click="addFollowUp"
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
import adoptionsService from 'src/services/adoptionsService'
import adoptersService from 'src/services/adoptersService'
import animalsService from 'src/services/animalsService'
import adoptionStatusesService from 'src/services/adoptionStatusesService'
import adoptionFollowUpStatusesService from 'src/services/adoptionFollowUpStatusesService'
import adoptionFollowUpsService from 'src/services/adoptionFollowUpsService'
import { useQuasar } from 'quasar'
import { useRouter, useRoute } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import notifications from '../utils/notifications'

const listRoute = 'adoptions'

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

const emptyFollowUp = () => ({
    follow_up_date: '',
    contact_method: '',
    status_id: null,
    notes: ''
})

export default defineComponent({
    name: 'AdoptionsForm',
    components: { ViewHeader },
    setup () {
        const $q = useQuasar()
        const router = useRouter()
        const route = useRoute()
        const { post, getByID, update } = adoptionsService()
        const { list: listAdopters } = adoptersService()
        const { list: listAnimals } = animalsService()
        const { list: listStatuses } = adoptionStatusesService()
        const { list: listFollowUpStatuses } = adoptionFollowUpStatusesService()
        const { notifySuccess, notifyError } = notifications()

        const form = ref({
            animal_id: null,
            adopter_id: null,
            adoption_date: '',
            status_id: null,
            agreement_signed: false,
            notes: ''
        })

        const animalOptions = ref([])
        const adopterOptions = ref([])
        const statusOptions = ref([])
        const followUpStatusOptions = ref([])

        const followUps = ref([])
        const newFollowUp = ref(emptyFollowUp())
        const savingFollowUp = ref(false)

        const isEditMode = computed(() => !!route.params.id)
        headerProps.title = isEditMode.value ? 'Editar Adoção' : 'Registrar Adoção'

        const chipStyle = (color) => ({ backgroundColor: color || '#6B7280' })

        onMounted(async () => {
            await Promise.all([getStatuses(), loadAnimals(''), loadAdopters('')])
            if (route.params.id) {
                await getFollowUpStatuses()
                await getAdoption(route.params.id)
            }
        })

        const getStatuses = async () => {
            const { data } = await listStatuses()
            statusOptions.value = data.data
        }

        const getFollowUpStatuses = async () => {
            const { data } = await listFollowUpStatuses()
            followUpStatusOptions.value = data.data
        }

        const loadAnimals = async (val) => {
            const { data } = await listAnimals('', { filter: val, per_page: 20 })
            animalOptions.value = data.data
        }

        const loadAdopters = async (val) => {
            const { data } = await listAdopters('', { filter: val, per_page: 20 })
            adopterOptions.value = data.data
        }

        const filterAnimals = (val, update) => {
            update(async () => {
                try { await loadAnimals(val) } catch (e) { animalOptions.value = [] }
            })
        }

        const filterAdopters = (val, update) => {
            update(async () => {
                try { await loadAdopters(val) } catch (e) { adopterOptions.value = [] }
            })
        }

        const getAdoption = async (id) => {
            try {
                const { data } = await getByID(id)
                const adoption = data.data

                // Seed the selects with the linked rows so their names render.
                if (adoption.animal) animalOptions.value = [adoption.animal, ...animalOptions.value]
                if (adoption.adopter) adopterOptions.value = [adoption.adopter, ...adopterOptions.value]

                form.value = {
                    id: adoption.id,
                    animal_id: adoption.animal?.id ?? null,
                    adopter_id: adoption.adopter?.id ?? null,
                    adoption_date: adoption.adoption_date ?? '',
                    status_id: adoption.status?.id ?? null,
                    agreement_signed: adoption.agreement_signed,
                    notes: adoption.notes ?? ''
                }
                followUps.value = adoption.follow_ups || []
            } catch (error) {
                notifyError(error.response?.data?.message || 'Erro ao carregar adoção!')
                router.push({ name: listRoute })
            }
        }

        const makePayload = () => ({
            animal_id: form.value.animal_id,
            adopter_id: form.value.adopter_id,
            adoption_date: brDateToDb(form.value.adoption_date),
            status_id: form.value.status_id || null,
            agreement_signed: form.value.agreement_signed,
            notes: form.value.notes || null
        })

        const onSubmit = async () => {
            form.value.id ? updateAdoption() : newAdoption()
        }

        const updateAdoption = async () => {
            try {
                await update(makePayload(), form.value.id)
                notifySuccess('Adoção atualizada com sucesso!')
                router.push({ name: listRoute })
            } catch (error) {
                handleErrors(error)
            }
        }

        const newAdoption = async () => {
            try {
                await post(makePayload())
                notifySuccess('Adoção registrada com sucesso!')
                router.push({ name: listRoute })
            } catch (error) {
                handleErrors(error)
            }
        }

        const addFollowUp = async () => {
            if (!newFollowUp.value.follow_up_date || !newFollowUp.value.status_id) {
                notifyError('Informe a data e o status do acompanhamento.')
                return
            }
            savingFollowUp.value = true
            try {
                const { post: postFollowUp } = adoptionFollowUpsService(route.params.id)
                const { data } = await postFollowUp({
                    follow_up_date: brDateToDb(newFollowUp.value.follow_up_date),
                    contact_method: newFollowUp.value.contact_method || null,
                    status_id: newFollowUp.value.status_id,
                    notes: newFollowUp.value.notes || null
                })
                followUps.value.unshift(data.data)
                newFollowUp.value = emptyFollowUp()
                notifySuccess('Acompanhamento adicionado!')
            } catch (error) {
                handleErrors(error)
            } finally {
                savingFollowUp.value = false
            }
        }

        const removeFollowUp = (followUpId) => {
            $q.dialog({
                title: 'Confirmação',
                message: 'Deseja remover este acompanhamento?',
                cancel: { label: 'Cancelar', color: 'primary', outline: true },
                ok: { label: 'Confirmar', color: 'primary' },
                persistent: true
            }).onOk(async () => {
                try {
                    const { destroy: destroyFollowUp } = adoptionFollowUpsService(route.params.id)
                    await destroyFollowUp(followUpId)
                    followUps.value = followUps.value.filter(f => f.id !== followUpId)
                    notifySuccess('Acompanhamento removido!')
                } catch (error) {
                    notifyError('Erro ao remover acompanhamento.')
                }
            })
        }

        const handleErrors = (error) => {
            const errors = error.response?.data?.errors
            if (errors) {
                Object.keys(errors).forEach(key => notifyError(errors[key]))
            } else {
                notifyError(error.response?.data?.message || 'Erro ao salvar adoção!')
            }
        }

        return {
            form,
            animalOptions,
            adopterOptions,
            statusOptions,
            followUpStatusOptions,
            followUps,
            newFollowUp,
            savingFollowUp,
            isEditMode,
            chipStyle,
            filterAnimals,
            filterAdopters,
            addFollowUp,
            removeFollowUp,
            onSubmit,
            headerProps,
            listRoute
        }
    }
})
</script>
