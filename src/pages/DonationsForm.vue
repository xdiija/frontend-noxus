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
                v-model="form.donor_id"
                :options="donorOptions"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                use-input
                clearable
                input-debounce="300"
                label="Doador (Opcional)"
                hint="Deixe vazio para doação avulsa ou anônima."
                class="col-md-6 col-xs-12"
                @filter="filterDonors"
            />

            <q-select
                outlined
                v-model="form.donation_type_id"
                :options="typeOptions"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                label="Tipo da doação"
                class="col-md-6 col-xs-12"
                :rules="[ val => !!val || 'Campo Obrigatório!']"
            />

            <template v-if="!form.donor_id">
                <q-input
                    outlined
                    v-model="form.donor_name"
                    label="Nome do doador avulso (Opcional)"
                    class="col-md-6 col-xs-12"
                />
                <q-input
                    outlined
                    v-model="maskedDonorPhone"
                    label="Telefone do doador (Opcional)"
                    class="col-md-3 col-xs-12"
                />
                <q-input
                    outlined
                    v-model="form.donor_email"
                    label="E-mail do doador (Opcional)"
                    type="email"
                    lazy-rules
                    class="col-md-3 col-xs-12"
                    :rules="[ val => !val || val.includes('@') || 'E-mail inválido']"
                />
            </template>

            <q-input
                outlined
                v-model="maskedAmount"
                label="Valor (Opcional)"
                hint="Deixe vazio para doação em itens sem valor monetário."
                class="col-md-6 col-xs-12"
            />

            <q-input
                outlined
                v-model="form.donation_date"
                label="Data da doação"
                mask="##/##/####"
                placeholder="dd/mm/aaaa"
                class="col-md-6 col-xs-12"
                :rules="[ val => !!val || 'Campo Obrigatório!']"
            >
                <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                            <q-date v-model="form.donation_date" mask="DD/MM/YYYY">
                                <div class="row items-center justify-end">
                                    <q-btn v-close-popup label="Fechar" color="primary" flat />
                                </div>
                            </q-date>
                        </q-popup-proxy>
                    </q-icon>
                </template>
            </q-input>

            <q-input
                outlined
                type="textarea"
                v-model="form.notes"
                label="Observações (Opcional)"
                class="col-xs-12"
            />

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
import donationsService from 'src/services/donationsService'
import donationTypesService from 'src/services/donationTypesService'
import { useRouter, useRoute } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import notifications from '../utils/notifications'
import mask from '../utils/mask'
import currency from '../utils/currency'
import dateHelper from '../utils/dateHelper'

const listRoute = 'donations'

const headerProps = {
    title: '',
    btnIcon: 'format_list_numbered',
    btnName: 'Listar',
    btnTo: listRoute
}

export default defineComponent({
    name: 'DonationsForm',
    components: { ViewHeader },
    setup () {
        const router = useRouter()
        const route = useRoute()
        const { phoneMask, unMask } = mask()
        const { formatBRL, maskCurrency } = currency()
        const { convertToDbFormat } = dateHelper()
        const { post, getByID, update, listDonorOptions } = donationsService()
        const { list: listTypes } = donationTypesService()
        const { notifySuccess, notifyError } = notifications()

        const form = ref({
            donor_id: null,
            donor_name: '',
            donor_email: '',
            donor_phone: '',
            donation_type_id: null,
            amount: '',
            donation_date: '',
            notes: ''
        })

        const donorOptions = ref([])
        const typeOptions = ref([])

        const isEditMode = computed(() => !!route.params.id)
        headerProps.title = isEditMode.value ? 'Editar Doação' : 'Registrar Doação'

        onMounted(async () => {
            await Promise.all([getTypes(), loadDonors('')])
            if (route.params.id) {
                await getDonation(route.params.id)
            }
        })

        const getTypes = async () => {
            const { data } = await listTypes()
            typeOptions.value = data.data
        }

        // Slim picker from /donations/donor-options (donations permission),
        // so the form doesn't depend on the donors menu grant.
        const loadDonors = async (val) => {
            const { data } = await listDonorOptions(val)
            donorOptions.value = data.data
        }

        const filterDonors = (val, update) => {
            update(async () => {
                try { await loadDonors(val) } catch (e) { donorOptions.value = [] }
            })
        }

        const getDonation = async (id) => {
            try {
                const { data } = await getByID(id)
                const donation = data.data

                // Seed the select with the linked donor so its name renders.
                if (donation.donor) donorOptions.value = [donation.donor, ...donorOptions.value]

                form.value = {
                    id: donation.id,
                    donor_id: donation.donor?.id ?? null,
                    donor_name: donation.donor_name ?? '',
                    donor_email: donation.donor_email ?? '',
                    donor_phone: phoneMask(donation.donor_phone),
                    donation_type_id: donation.donation_type?.id ?? null,
                    amount: donation.amount !== null ? maskCurrency(donation.amount) : '',
                    donation_date: donation.donation_date ?? '',
                    notes: donation.notes ?? ''
                }
            } catch (error) {
                notifyError(error.response?.data?.message || 'Erro ao carregar doação!')
                router.push({ name: listRoute })
            }
        }

        // "R$ 1.234,56" -> 1234.56 (null when empty)
        const amountToDb = (masked) => {
            if (!masked) return null
            const digits = String(masked).replace(/\D/g, '')
            return digits ? Number(digits) / 100 : null
        }

        const makePayload = () => ({
            donor_id: form.value.donor_id,
            donor_name: form.value.donor_id ? null : (form.value.donor_name || null),
            donor_email: form.value.donor_id ? null : (form.value.donor_email || null),
            donor_phone: form.value.donor_id ? null : (unMask(form.value.donor_phone) || null),
            donation_type_id: form.value.donation_type_id,
            amount: amountToDb(form.value.amount),
            donation_date: convertToDbFormat(form.value.donation_date),
            notes: form.value.notes || null
        })

        const onSubmit = async () => {
            form.value.id ? updateDonation() : newDonation()
        }

        const updateDonation = async () => {
            try {
                await update(makePayload(), form.value.id)
                notifySuccess('Doação atualizada com sucesso!')
                router.push({ name: listRoute })
            } catch (error) {
                handleErrors(error)
            }
        }

        const newDonation = async () => {
            try {
                await post(makePayload())
                notifySuccess('Doação registrada com sucesso!')
                router.push({ name: listRoute })
            } catch (error) {
                handleErrors(error)
            }
        }

        const handleErrors = (error) => {
            const errors = error.response?.data?.errors
            if (errors) {
                Object.keys(errors).forEach(key => notifyError(errors[key]))
            } else {
                notifyError(error.response?.data?.message || 'Erro ao salvar doação!')
            }
        }

        const maskedAmount = computed({
            get () { return form.value.amount || '' },
            set (value) { form.value.amount = value ? formatBRL(value) : '' }
        })

        const maskedDonorPhone = computed({
            get () { return form.value.donor_phone || '' },
            set (value) { form.value.donor_phone = value ? phoneMask(value) : '' }
        })

        return {
            form,
            donorOptions,
            typeOptions,
            maskedAmount,
            maskedDonorPhone,
            filterDonors,
            isEditMode,
            onSubmit,
            headerProps,
            listRoute
        }
    }
})
</script>
