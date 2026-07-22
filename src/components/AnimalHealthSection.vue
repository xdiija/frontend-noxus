<template>
    <q-card flat bordered class="col-xs-12 q-mt-sm">
        <q-card-section>
            <div class="text-subtitle1 q-mb-sm">Saúde</div>

            <q-tabs
                v-model="tab"
                dense
                no-caps
                align="left"
                active-color="primary"
                indicator-color="primary"
            >
                <q-tab name="records" icon="medical_information" label="Histórico clínico" />
                <q-tab name="vaccines" icon="vaccines" label="Vacinas" />
                <q-tab name="medications" icon="medication" label="Medicações" />
                <q-tab name="appointments" icon="event_available" label="Consultas" />
                <q-tab name="surgeries" icon="healing" label="Cirurgias" />
            </q-tabs>

            <q-separator />

            <q-tab-panels v-model="tab" animated>
                <!-- Clinical history (health-records) -->
                <q-tab-panel name="records" class="q-px-none">
                    <q-markup-table flat dense v-if="records.length" class="q-mb-md">
                        <thead>
                            <tr>
                                <th class="text-left">Data</th>
                                <th class="text-left">Tipo</th>
                                <th class="text-left">Descrição</th>
                                <th class="text-left">Veterinário</th>
                                <th class="text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="r in records" :key="r.id">
                                <td class="text-left">{{ r.event_date }}</td>
                                <td class="text-left">{{ r.type }}</td>
                                <td class="text-left">{{ r.description || '—' }}</td>
                                <td class="text-left">{{ r.veterinarian || '—' }}</td>
                                <td class="text-right">
                                    <q-btn icon="edit" color="primary" dense size="sm" flat @click="editRecord(r)" />
                                    <q-btn icon="delete" color="negative" dense size="sm" flat @click="removeRecord(r.id)" />
                                </td>
                            </tr>
                        </tbody>
                    </q-markup-table>
                    <div v-else class="text-grey q-mb-md">Nenhum registro clínico.</div>

                    <div class="row q-col-gutter-sm items-start">
                        <q-input
                            outlined dense
                            v-model="recordForm.event_date"
                            label="Data"
                            mask="##/##/####"
                            placeholder="dd/mm/aaaa"
                            class="col-md-2 col-xs-12"
                        >
                            <template v-slot:append>
                                <q-icon name="event" class="cursor-pointer">
                                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                        <q-date v-model="recordForm.event_date" mask="DD/MM/YYYY">
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
                            v-model="recordForm.type"
                            label="Tipo (ex.: exame, vermifugação)"
                            class="col-md-3 col-xs-12"
                        />
                        <q-input
                            outlined dense
                            v-model="recordForm.veterinarian"
                            label="Veterinário (Opcional)"
                            class="col-md-3 col-xs-12"
                        />
                        <q-input
                            outlined dense
                            v-model="recordForm.description"
                            label="Descrição (Opcional)"
                            class="col-md-4 col-xs-12"
                        />
                        <q-input
                            outlined dense
                            v-model="recordForm.notes"
                            label="Observações (Opcional)"
                            class="col-xs-12"
                        />
                        <div class="col-xs-12">
                            <q-btn
                                :label="recordEditingId ? 'Salvar alterações' : 'Adicionar registro'"
                                color="primary"
                                :icon="recordEditingId ? 'save' : 'add'"
                                dense
                                :loading="savingRecord"
                                @click="saveRecord"
                            />
                            <q-btn
                                v-if="recordEditingId"
                                label="Cancelar"
                                color="primary"
                                outline dense
                                class="q-ml-sm"
                                @click="resetRecordForm"
                            />
                        </div>
                    </div>
                </q-tab-panel>

                <!-- Applied vaccine doses -->
                <q-tab-panel name="vaccines" class="q-px-none">
                    <q-markup-table flat dense v-if="vaccineRows.length" class="q-mb-md">
                        <thead>
                            <tr>
                                <th class="text-left">Data</th>
                                <th class="text-left">Vacina</th>
                                <th class="text-left">Dose</th>
                                <th class="text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="v in vaccineRows" :key="v.id">
                                <td class="text-left">{{ v.application_date }}</td>
                                <td class="text-left">{{ v.vaccine?.name || '—' }}</td>
                                <td class="text-left">{{ v.dose || '—' }}</td>
                                <td class="text-right">
                                    <q-btn icon="edit" color="primary" dense size="sm" flat @click="editVaccine(v)" />
                                    <q-btn icon="delete" color="negative" dense size="sm" flat @click="removeVaccine(v.id)" />
                                </td>
                            </tr>
                        </tbody>
                    </q-markup-table>
                    <div v-else class="text-grey q-mb-md">Nenhuma vacina aplicada.</div>

                    <div class="row q-col-gutter-sm items-start">
                        <q-select
                            outlined dense
                            v-model="vaccineForm.vaccine_id"
                            :options="vaccineOptions"
                            option-value="id"
                            option-label="name"
                            emit-value
                            map-options
                            label="Vacina"
                            class="col-md-4 col-xs-12"
                        />
                        <q-input
                            outlined dense
                            v-model="vaccineForm.application_date"
                            label="Data de aplicação"
                            mask="##/##/####"
                            placeholder="dd/mm/aaaa"
                            class="col-md-3 col-xs-12"
                        >
                            <template v-slot:append>
                                <q-icon name="event" class="cursor-pointer">
                                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                        <q-date v-model="vaccineForm.application_date" mask="DD/MM/YYYY">
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
                            v-model="vaccineForm.dose"
                            label="Dose (ex.: 1ª dose, reforço)"
                            class="col-md-3 col-xs-12"
                        />
                        <div class="col-xs-12">
                            <q-btn
                                :label="vaccineEditingId ? 'Salvar alterações' : 'Adicionar vacina'"
                                color="primary"
                                :icon="vaccineEditingId ? 'save' : 'add'"
                                dense
                                :loading="savingVaccine"
                                @click="saveVaccine"
                            />
                            <q-btn
                                v-if="vaccineEditingId"
                                label="Cancelar"
                                color="primary"
                                outline dense
                                class="q-ml-sm"
                                @click="resetVaccineForm"
                            />
                        </div>
                    </div>
                </q-tab-panel>

                <!-- Medication courses -->
                <q-tab-panel name="medications" class="q-px-none">
                    <q-markup-table flat dense v-if="medicationRows.length" class="q-mb-md">
                        <thead>
                            <tr>
                                <th class="text-left">Medicamento</th>
                                <th class="text-left">Dosagem</th>
                                <th class="text-left">Início</th>
                                <th class="text-left">Término</th>
                                <th class="text-left">Veterinário</th>
                                <th class="text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="m in medicationRows" :key="m.id">
                                <td class="text-left">{{ m.medication?.name || '—' }}</td>
                                <td class="text-left">{{ m.dosage || '—' }}</td>
                                <td class="text-left">{{ m.start_date }}</td>
                                <td class="text-left">
                                    <q-chip v-if="!m.end_date" color="teal" text-color="white" dense>Em uso</q-chip>
                                    <template v-else>{{ m.end_date }}</template>
                                </td>
                                <td class="text-left">{{ m.veterinarian || '—' }}</td>
                                <td class="text-right">
                                    <q-btn icon="edit" color="primary" dense size="sm" flat @click="editMedication(m)" />
                                    <q-btn icon="delete" color="negative" dense size="sm" flat @click="removeMedication(m.id)" />
                                </td>
                            </tr>
                        </tbody>
                    </q-markup-table>
                    <div v-else class="text-grey q-mb-md">Nenhuma medicação registrada.</div>

                    <div class="row q-col-gutter-sm items-start">
                        <q-select
                            outlined dense
                            v-model="medicationForm.medication_id"
                            :options="medicationOptions"
                            option-value="id"
                            option-label="name"
                            emit-value
                            map-options
                            label="Medicamento"
                            class="col-md-4 col-xs-12"
                        />
                        <q-input
                            outlined dense
                            v-model="medicationForm.dosage"
                            label="Dosagem (Opcional)"
                            class="col-md-2 col-xs-12"
                        />
                        <q-input
                            outlined dense
                            v-model="medicationForm.start_date"
                            label="Início"
                            mask="##/##/####"
                            placeholder="dd/mm/aaaa"
                            class="col-md-3 col-xs-12"
                        >
                            <template v-slot:append>
                                <q-icon name="event" class="cursor-pointer">
                                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                        <q-date v-model="medicationForm.start_date" mask="DD/MM/YYYY">
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
                            v-model="medicationForm.end_date"
                            label="Término (vazio = em uso)"
                            mask="##/##/####"
                            placeholder="dd/mm/aaaa"
                            class="col-md-3 col-xs-12"
                        >
                            <template v-slot:append>
                                <q-icon name="event" class="cursor-pointer">
                                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                        <q-date v-model="medicationForm.end_date" mask="DD/MM/YYYY">
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
                            v-model="medicationForm.veterinarian"
                            label="Veterinário (Opcional)"
                            class="col-md-4 col-xs-12"
                        />
                        <q-input
                            outlined dense
                            v-model="medicationForm.notes"
                            label="Observações (Opcional)"
                            class="col-md-8 col-xs-12"
                        />
                        <div class="col-xs-12">
                            <q-btn
                                :label="medicationEditingId ? 'Salvar alterações' : 'Adicionar medicação'"
                                color="primary"
                                :icon="medicationEditingId ? 'save' : 'add'"
                                dense
                                :loading="savingMedication"
                                @click="saveMedication"
                            />
                            <q-btn
                                v-if="medicationEditingId"
                                label="Cancelar"
                                color="primary"
                                outline dense
                                class="q-ml-sm"
                                @click="resetMedicationForm"
                            />
                        </div>
                    </div>
                </q-tab-panel>

                <!-- Appointments -->
                <q-tab-panel name="appointments" class="q-px-none">
                    <q-markup-table flat dense v-if="appointmentRows.length" class="q-mb-md">
                        <thead>
                            <tr>
                                <th class="text-left">Data</th>
                                <th class="text-left">Veterinário</th>
                                <th class="text-left">Clínica</th>
                                <th class="text-left">Motivo</th>
                                <th class="text-left">Retorno</th>
                                <th class="text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="a in appointmentRows" :key="a.id">
                                <td class="text-left">{{ trimSeconds(a.appointment_date) }}</td>
                                <td class="text-left">{{ a.veterinarian || '—' }}</td>
                                <td class="text-left">{{ a.clinic || '—' }}</td>
                                <td class="text-left">{{ a.purpose || '—' }}</td>
                                <td class="text-left">{{ a.next_visit || '—' }}</td>
                                <td class="text-right">
                                    <q-btn icon="edit" color="primary" dense size="sm" flat @click="editAppointment(a)" />
                                    <q-btn icon="delete" color="negative" dense size="sm" flat @click="removeAppointment(a.id)" />
                                </td>
                            </tr>
                        </tbody>
                    </q-markup-table>
                    <div v-else class="text-grey q-mb-md">Nenhuma consulta registrada.</div>

                    <div class="row q-col-gutter-sm items-start">
                        <q-input
                            outlined dense
                            v-model="appointmentForm.appointment_date"
                            label="Data da consulta"
                            mask="##/##/#### ##:##"
                            placeholder="dd/mm/aaaa hh:mm"
                            class="col-md-3 col-xs-12"
                        >
                            <template v-slot:prepend>
                                <q-icon name="event" class="cursor-pointer">
                                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                        <q-date v-model="appointmentForm.appointment_date" mask="DD/MM/YYYY HH:mm">
                                            <div class="row items-center justify-end">
                                                <q-btn v-close-popup label="Fechar" color="primary" flat />
                                            </div>
                                        </q-date>
                                    </q-popup-proxy>
                                </q-icon>
                            </template>
                            <template v-slot:append>
                                <q-icon name="access_time" class="cursor-pointer">
                                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                        <q-time v-model="appointmentForm.appointment_date" mask="DD/MM/YYYY HH:mm" format24h>
                                            <div class="row items-center justify-end">
                                                <q-btn v-close-popup label="Fechar" color="primary" flat />
                                            </div>
                                        </q-time>
                                    </q-popup-proxy>
                                </q-icon>
                            </template>
                        </q-input>
                        <q-input
                            outlined dense
                            v-model="appointmentForm.veterinarian"
                            label="Veterinário (Opcional)"
                            class="col-md-3 col-xs-12"
                        />
                        <q-input
                            outlined dense
                            v-model="appointmentForm.clinic"
                            label="Clínica (Opcional)"
                            class="col-md-3 col-xs-12"
                        />
                        <q-input
                            outlined dense
                            v-model="appointmentForm.purpose"
                            label="Motivo (Opcional)"
                            class="col-md-3 col-xs-12"
                        />
                        <q-input
                            outlined dense
                            v-model="appointmentForm.result"
                            label="Resultado (Opcional)"
                            class="col-md-6 col-xs-12"
                        />
                        <q-input
                            outlined dense
                            v-model="appointmentForm.next_visit"
                            label="Retorno sugerido (Opcional)"
                            mask="##/##/####"
                            placeholder="dd/mm/aaaa"
                            class="col-md-3 col-xs-12"
                        >
                            <template v-slot:append>
                                <q-icon name="event" class="cursor-pointer">
                                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                        <q-date v-model="appointmentForm.next_visit" mask="DD/MM/YYYY">
                                            <div class="row items-center justify-end">
                                                <q-btn v-close-popup label="Fechar" color="primary" flat />
                                            </div>
                                        </q-date>
                                    </q-popup-proxy>
                                </q-icon>
                            </template>
                        </q-input>
                        <div class="col-xs-12">
                            <q-btn
                                :label="appointmentEditingId ? 'Salvar alterações' : 'Adicionar consulta'"
                                color="primary"
                                :icon="appointmentEditingId ? 'save' : 'add'"
                                dense
                                :loading="savingAppointment"
                                @click="saveAppointment"
                            />
                            <q-btn
                                v-if="appointmentEditingId"
                                label="Cancelar"
                                color="primary"
                                outline dense
                                class="q-ml-sm"
                                @click="resetAppointmentForm"
                            />
                        </div>
                    </div>
                </q-tab-panel>

                <!-- Surgeries -->
                <q-tab-panel name="surgeries" class="q-px-none">
                    <q-markup-table flat dense v-if="surgeryRows.length" class="q-mb-md">
                        <thead>
                            <tr>
                                <th class="text-left">Data</th>
                                <th class="text-left">Procedimento</th>
                                <th class="text-left">Veterinário</th>
                                <th class="text-left">Clínica</th>
                                <th class="text-left">Custo</th>
                                <th class="text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="s in surgeryRows" :key="s.id">
                                <td class="text-left">{{ s.surgery_date }}</td>
                                <td class="text-left">{{ s.procedure }}</td>
                                <td class="text-left">{{ s.veterinarian || '—' }}</td>
                                <td class="text-left">{{ s.clinic || '—' }}</td>
                                <td class="text-left">{{ s.cost != null ? maskCurrency(s.cost) : '—' }}</td>
                                <td class="text-right">
                                    <q-btn icon="edit" color="primary" dense size="sm" flat @click="editSurgery(s)" />
                                    <q-btn icon="delete" color="negative" dense size="sm" flat @click="removeSurgery(s.id)" />
                                </td>
                            </tr>
                        </tbody>
                    </q-markup-table>
                    <div v-else class="text-grey q-mb-md">Nenhuma cirurgia registrada.</div>

                    <div class="row q-col-gutter-sm items-start">
                        <q-input
                            outlined dense
                            v-model="surgeryForm.surgery_date"
                            label="Data da cirurgia"
                            mask="##/##/####"
                            placeholder="dd/mm/aaaa"
                            class="col-md-3 col-xs-12"
                        >
                            <template v-slot:append>
                                <q-icon name="event" class="cursor-pointer">
                                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                        <q-date v-model="surgeryForm.surgery_date" mask="DD/MM/YYYY">
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
                            v-model="surgeryForm.procedure"
                            label="Procedimento"
                            class="col-md-4 col-xs-12"
                        />
                        <q-input
                            outlined dense
                            v-model="maskedCost"
                            label="Custo (Opcional)"
                            class="col-md-2 col-xs-12"
                        />
                        <q-input
                            outlined dense
                            v-model="surgeryForm.veterinarian"
                            label="Veterinário (Opcional)"
                            class="col-md-3 col-xs-12"
                        />
                        <q-input
                            outlined dense
                            v-model="surgeryForm.clinic"
                            label="Clínica (Opcional)"
                            class="col-md-3 col-xs-12"
                        />
                        <q-input
                            outlined dense
                            v-model="surgeryForm.notes"
                            label="Observações (Opcional)"
                            class="col-md-6 col-xs-12"
                        />
                        <div class="col-md-3 col-xs-12 flex items-center" style="min-height: 40px">
                            <q-toggle v-model="surgeryForm.is_castration" label="É castração" dense>
                                <q-tooltip>Marca o animal como castrado na data da cirurgia.</q-tooltip>
                            </q-toggle>
                        </div>
                        <div class="col-xs-12">
                            <q-btn
                                :label="surgeryEditingId ? 'Salvar alterações' : 'Adicionar cirurgia'"
                                color="primary"
                                :icon="surgeryEditingId ? 'save' : 'add'"
                                dense
                                :loading="savingSurgery"
                                @click="saveSurgery"
                            />
                            <q-btn
                                v-if="surgeryEditingId"
                                label="Cancelar"
                                color="primary"
                                outline dense
                                class="q-ml-sm"
                                @click="resetSurgeryForm"
                            />
                        </div>
                    </div>
                </q-tab-panel>
            </q-tab-panels>
        </q-card-section>
    </q-card>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import healthRecordsService from 'src/services/healthRecordsService'
import animalVaccinesService from 'src/services/animalVaccinesService'
import animalMedicationsService from 'src/services/animalMedicationsService'
import appointmentsService from 'src/services/appointmentsService'
import surgeriesService from 'src/services/surgeriesService'
import vaccinesService from 'src/services/vaccinesService'
import medicationsService from 'src/services/medicationsService'
import notifications from '../utils/notifications'
import currency from '../utils/currency'

// dd/mm/yyyy -> yyyy-mm-dd
const brDateToDb = (value) => {
    if (!value) return null
    const [d, m, y] = value.split('/')
    return (d && m && y) ? `${y}-${m}-${d}` : null
}

// dd/mm/yyyy HH:mm[:ss] -> yyyy-mm-dd HH:mm
const brDateTimeToDb = (value) => {
    if (!value) return null
    const [datePart, timePart = '00:00'] = value.split(' ')
    const db = brDateToDb(datePart)
    if (!db) return null
    const [hh = '00', mm = '00'] = timePart.split(':')
    return `${db} ${hh}:${mm}`
}

// dd/mm/yyyy HH:mm:ss -> dd/mm/yyyy HH:mm (picker mask has no seconds)
const trimSeconds = (value) => {
    if (!value) return ''
    const [datePart, timePart = ''] = value.split(' ')
    if (!timePart) return datePart
    const [hh = '00', mm = '00'] = timePart.split(':')
    return `${datePart} ${hh}:${mm}`
}

const emptyRecord = () => ({ event_date: '', type: '', description: '', veterinarian: '', notes: '' })
const emptyVaccine = () => ({ vaccine_id: null, application_date: '', dose: '' })
const emptyMedication = () => ({ medication_id: null, dosage: '', start_date: '', end_date: '', veterinarian: '', notes: '' })
const emptyAppointment = () => ({ appointment_date: '', veterinarian: '', clinic: '', purpose: '', result: '', next_visit: '' })
const emptySurgery = () => ({ surgery_date: '', procedure: '', veterinarian: '', clinic: '', cost: '', notes: '', is_castration: false })

export default defineComponent({
    name: 'AnimalHealthSection',
    props: {
        animalId: {
            type: [String, Number],
            required: true
        }
    },
    // Fired after saving a surgery flagged as castration, with the surgery date
    // (dd/mm/yyyy) — the parent form syncs its neutered fields.
    emits: ['castration'],
    setup (props, { emit }) {
        const $q = useQuasar()
        const { notifySuccess, notifyError } = notifications()
        const { formatBRL, maskCurrency } = currency()

        const recordsApi = healthRecordsService(props.animalId)
        const vaccinesApi = animalVaccinesService(props.animalId)
        const medicationsApi = animalMedicationsService(props.animalId)
        const appointmentsApi = appointmentsService(props.animalId)
        const surgeriesApi = surgeriesService(props.animalId)
        const { list: listVaccineCatalog } = vaccinesService()
        const { list: listMedicationCatalog } = medicationsService()

        const tab = ref('records')

        const records = ref([])
        const vaccineRows = ref([])
        const medicationRows = ref([])
        const appointmentRows = ref([])
        const surgeryRows = ref([])

        const vaccineOptions = ref([])
        const medicationOptions = ref([])

        const recordForm = ref(emptyRecord())
        const vaccineForm = ref(emptyVaccine())
        const medicationForm = ref(emptyMedication())
        const appointmentForm = ref(emptyAppointment())
        const surgeryForm = ref(emptySurgery())

        const recordEditingId = ref(null)
        const vaccineEditingId = ref(null)
        const medicationEditingId = ref(null)
        const appointmentEditingId = ref(null)
        const surgeryEditingId = ref(null)

        const savingRecord = ref(false)
        const savingVaccine = ref(false)
        const savingMedication = ref(false)
        const savingAppointment = ref(false)
        const savingSurgery = ref(false)

        const maskedCost = computed({
            get () { return surgeryForm.value.cost || '' },
            set (value) { surgeryForm.value.cost = value ? formatBRL(value) : '' }
        })

        // "R$ 1.234,56" -> 1234.56 (null when empty)
        const costToDb = (masked) => {
            if (!masked) return null
            const digits = String(masked).replace(/\D/g, '')
            return digits ? Number(digits) / 100 : null
        }

        onMounted(async () => {
            try {
                const [rec, vac, med, app, sur, vacCat, medCat] = await Promise.all([
                    recordsApi.list(),
                    vaccinesApi.list(),
                    medicationsApi.list(),
                    appointmentsApi.list(),
                    surgeriesApi.list(),
                    listVaccineCatalog(),
                    listMedicationCatalog()
                ])
                records.value = rec.data.data
                vaccineRows.value = vac.data.data
                medicationRows.value = med.data.data
                appointmentRows.value = app.data.data
                surgeryRows.value = sur.data.data
                vaccineOptions.value = vacCat.data.data
                medicationOptions.value = medCat.data.data
            } catch (error) {
                notifyError('Erro ao carregar os dados de saúde.')
            }
        })

        const handleErrors = (error) => {
            const errors = error.response?.data?.errors
            if (errors) {
                Object.keys(errors).forEach(key => notifyError(errors[key]))
            } else {
                notifyError(error.response?.data?.message || 'Erro ao salvar!')
            }
        }

        const confirmRemove = (message, onConfirm) => {
            $q.dialog({
                title: 'Confirmação',
                message,
                cancel: { label: 'Cancelar', color: 'primary', outline: true },
                ok: { label: 'Confirmar', color: 'primary' },
                persistent: true
            }).onOk(onConfirm)
        }

        // Upsert helper: replace the edited row or prepend the new one.
        const applySaved = (rows, editingId, saved) => {
            if (editingId) {
                const idx = rows.value.findIndex(r => r.id === editingId)
                if (idx !== -1) rows.value[idx] = saved
            } else {
                rows.value.unshift(saved)
            }
        }

        // --- Clinical history -------------------------------------------------
        const resetRecordForm = () => {
            recordForm.value = emptyRecord()
            recordEditingId.value = null
        }

        const editRecord = (row) => {
            recordEditingId.value = row.id
            recordForm.value = {
                event_date: row.event_date ?? '',
                type: row.type ?? '',
                description: row.description ?? '',
                veterinarian: row.veterinarian ?? '',
                notes: row.notes ?? ''
            }
        }

        const saveRecord = async () => {
            if (!recordForm.value.event_date || !recordForm.value.type) {
                notifyError('Informe a data e o tipo do registro.')
                return
            }
            savingRecord.value = true
            try {
                const payload = {
                    type: recordForm.value.type,
                    description: recordForm.value.description || null,
                    event_date: brDateToDb(recordForm.value.event_date),
                    veterinarian: recordForm.value.veterinarian || null,
                    notes: recordForm.value.notes || null
                }
                const { data } = recordEditingId.value
                    ? await recordsApi.update(payload, recordEditingId.value)
                    : await recordsApi.post(payload)
                applySaved(records, recordEditingId.value, data.data)
                resetRecordForm()
                notifySuccess('Registro clínico salvo!')
            } catch (error) {
                handleErrors(error)
            } finally {
                savingRecord.value = false
            }
        }

        const removeRecord = (id) => {
            confirmRemove('Deseja remover este registro clínico?', async () => {
                try {
                    await recordsApi.destroy(id)
                    records.value = records.value.filter(r => r.id !== id)
                    if (recordEditingId.value === id) resetRecordForm()
                    notifySuccess('Registro removido!')
                } catch (error) {
                    notifyError('Erro ao remover registro.')
                }
            })
        }

        // --- Vaccines ---------------------------------------------------------
        const resetVaccineForm = () => {
            vaccineForm.value = emptyVaccine()
            vaccineEditingId.value = null
        }

        const editVaccine = (row) => {
            vaccineEditingId.value = row.id
            vaccineForm.value = {
                vaccine_id: row.vaccine?.id ?? null,
                application_date: row.application_date ?? '',
                dose: row.dose ?? ''
            }
        }

        const saveVaccine = async () => {
            if (!vaccineForm.value.vaccine_id || !vaccineForm.value.application_date) {
                notifyError('Informe a vacina e a data de aplicação.')
                return
            }
            savingVaccine.value = true
            try {
                const payload = {
                    vaccine_id: vaccineForm.value.vaccine_id,
                    application_date: brDateToDb(vaccineForm.value.application_date),
                    dose: vaccineForm.value.dose || null
                }
                const { data } = vaccineEditingId.value
                    ? await vaccinesApi.update(payload, vaccineEditingId.value)
                    : await vaccinesApi.post(payload)
                applySaved(vaccineRows, vaccineEditingId.value, data.data)
                resetVaccineForm()
                notifySuccess('Vacina salva!')
            } catch (error) {
                handleErrors(error)
            } finally {
                savingVaccine.value = false
            }
        }

        const removeVaccine = (id) => {
            confirmRemove('Deseja remover esta vacina?', async () => {
                try {
                    await vaccinesApi.destroy(id)
                    vaccineRows.value = vaccineRows.value.filter(v => v.id !== id)
                    if (vaccineEditingId.value === id) resetVaccineForm()
                    notifySuccess('Vacina removida!')
                } catch (error) {
                    notifyError('Erro ao remover vacina.')
                }
            })
        }

        // --- Medications --------------------------------------------------------
        const resetMedicationForm = () => {
            medicationForm.value = emptyMedication()
            medicationEditingId.value = null
        }

        const editMedication = (row) => {
            medicationEditingId.value = row.id
            medicationForm.value = {
                medication_id: row.medication?.id ?? null,
                dosage: row.dosage ?? '',
                start_date: row.start_date ?? '',
                end_date: row.end_date ?? '',
                veterinarian: row.veterinarian ?? '',
                notes: row.notes ?? ''
            }
        }

        const saveMedication = async () => {
            if (!medicationForm.value.medication_id || !medicationForm.value.start_date) {
                notifyError('Informe o medicamento e a data de início.')
                return
            }
            savingMedication.value = true
            try {
                const payload = {
                    medication_id: medicationForm.value.medication_id,
                    dosage: medicationForm.value.dosage || null,
                    start_date: brDateToDb(medicationForm.value.start_date),
                    end_date: brDateToDb(medicationForm.value.end_date),
                    veterinarian: medicationForm.value.veterinarian || null,
                    notes: medicationForm.value.notes || null
                }
                const { data } = medicationEditingId.value
                    ? await medicationsApi.update(payload, medicationEditingId.value)
                    : await medicationsApi.post(payload)
                applySaved(medicationRows, medicationEditingId.value, data.data)
                resetMedicationForm()
                notifySuccess('Medicação salva!')
            } catch (error) {
                handleErrors(error)
            } finally {
                savingMedication.value = false
            }
        }

        const removeMedication = (id) => {
            confirmRemove('Deseja remover esta medicação?', async () => {
                try {
                    await medicationsApi.destroy(id)
                    medicationRows.value = medicationRows.value.filter(m => m.id !== id)
                    if (medicationEditingId.value === id) resetMedicationForm()
                    notifySuccess('Medicação removida!')
                } catch (error) {
                    notifyError('Erro ao remover medicação.')
                }
            })
        }

        // --- Appointments -------------------------------------------------------
        const resetAppointmentForm = () => {
            appointmentForm.value = emptyAppointment()
            appointmentEditingId.value = null
        }

        const editAppointment = (row) => {
            appointmentEditingId.value = row.id
            appointmentForm.value = {
                appointment_date: trimSeconds(row.appointment_date),
                veterinarian: row.veterinarian ?? '',
                clinic: row.clinic ?? '',
                purpose: row.purpose ?? '',
                result: row.result ?? '',
                next_visit: row.next_visit ?? ''
            }
        }

        const saveAppointment = async () => {
            if (!appointmentForm.value.appointment_date) {
                notifyError('Informe a data da consulta.')
                return
            }
            savingAppointment.value = true
            try {
                const payload = {
                    appointment_date: brDateTimeToDb(appointmentForm.value.appointment_date),
                    veterinarian: appointmentForm.value.veterinarian || null,
                    clinic: appointmentForm.value.clinic || null,
                    purpose: appointmentForm.value.purpose || null,
                    result: appointmentForm.value.result || null,
                    next_visit: brDateToDb(appointmentForm.value.next_visit)
                }
                const { data } = appointmentEditingId.value
                    ? await appointmentsApi.update(payload, appointmentEditingId.value)
                    : await appointmentsApi.post(payload)
                applySaved(appointmentRows, appointmentEditingId.value, data.data)
                resetAppointmentForm()
                notifySuccess('Consulta salva!')
            } catch (error) {
                handleErrors(error)
            } finally {
                savingAppointment.value = false
            }
        }

        const removeAppointment = (id) => {
            confirmRemove('Deseja remover esta consulta?', async () => {
                try {
                    await appointmentsApi.destroy(id)
                    appointmentRows.value = appointmentRows.value.filter(a => a.id !== id)
                    if (appointmentEditingId.value === id) resetAppointmentForm()
                    notifySuccess('Consulta removida!')
                } catch (error) {
                    notifyError('Erro ao remover consulta.')
                }
            })
        }

        // --- Surgeries ----------------------------------------------------------
        const resetSurgeryForm = () => {
            surgeryForm.value = emptySurgery()
            surgeryEditingId.value = null
        }

        const editSurgery = (row) => {
            surgeryEditingId.value = row.id
            surgeryForm.value = {
                surgery_date: row.surgery_date ?? '',
                procedure: row.procedure ?? '',
                veterinarian: row.veterinarian ?? '',
                clinic: row.clinic ?? '',
                cost: row.cost != null ? maskCurrency(row.cost) : '',
                notes: row.notes ?? '',
                is_castration: false
            }
        }

        const saveSurgery = async () => {
            if (!surgeryForm.value.surgery_date || !surgeryForm.value.procedure) {
                notifyError('Informe a data e o procedimento da cirurgia.')
                return
            }
            savingSurgery.value = true
            try {
                const isCastration = surgeryForm.value.is_castration
                const surgeryDate = surgeryForm.value.surgery_date
                const payload = {
                    surgery_date: brDateToDb(surgeryDate),
                    procedure: surgeryForm.value.procedure,
                    veterinarian: surgeryForm.value.veterinarian || null,
                    clinic: surgeryForm.value.clinic || null,
                    cost: costToDb(surgeryForm.value.cost),
                    notes: surgeryForm.value.notes || null,
                    is_castration: isCastration
                }
                const { data } = surgeryEditingId.value
                    ? await surgeriesApi.update(payload, surgeryEditingId.value)
                    : await surgeriesApi.post(payload)
                applySaved(surgeryRows, surgeryEditingId.value, data.data)
                resetSurgeryForm()
                notifySuccess('Cirurgia salva!')
                if (isCastration) emit('castration', surgeryDate)
            } catch (error) {
                handleErrors(error)
            } finally {
                savingSurgery.value = false
            }
        }

        const removeSurgery = (id) => {
            confirmRemove('Deseja remover esta cirurgia?', async () => {
                try {
                    await surgeriesApi.destroy(id)
                    surgeryRows.value = surgeryRows.value.filter(s => s.id !== id)
                    if (surgeryEditingId.value === id) resetSurgeryForm()
                    notifySuccess('Cirurgia removida!')
                } catch (error) {
                    notifyError('Erro ao remover cirurgia.')
                }
            })
        }

        return {
            tab,
            trimSeconds,
            maskCurrency,
            maskedCost,
            records,
            recordForm,
            recordEditingId,
            savingRecord,
            editRecord,
            saveRecord,
            removeRecord,
            resetRecordForm,
            vaccineRows,
            vaccineOptions,
            vaccineForm,
            vaccineEditingId,
            savingVaccine,
            editVaccine,
            saveVaccine,
            removeVaccine,
            resetVaccineForm,
            medicationRows,
            medicationOptions,
            medicationForm,
            medicationEditingId,
            savingMedication,
            editMedication,
            saveMedication,
            removeMedication,
            resetMedicationForm,
            appointmentRows,
            appointmentForm,
            appointmentEditingId,
            savingAppointment,
            editAppointment,
            saveAppointment,
            removeAppointment,
            resetAppointmentForm,
            surgeryRows,
            surgeryForm,
            surgeryEditingId,
            savingSurgery,
            editSurgery,
            saveSurgery,
            removeSurgery,
            resetSurgeryForm
        }
    }
})
</script>
