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
                class="col-md-6 col-xs-12"
                :rules="[ val => val && val.length > 2 || 'Campo Obrigatório (mínimo 3 caracteres)!']"
            />
            <q-input
                outlined
                v-model="form.legal_name"
                label="Razão Social (Opcional)"
                class="col-md-6 col-xs-12"
            />
            <q-input
                outlined
                v-model="maskedCnpj"
                label="CNPJ (Opcional)"
                class="col-md-4 col-xs-12"
            />
            <q-input
                outlined
                v-model="form.email"
                label="E-mail (Opcional)"
                type="email"
                lazy-rules
                class="col-md-4 col-xs-12"
                :rules="[ val => !val || val.includes('@') || 'E-mail inválido']"
            />
            <q-input
                outlined
                v-model="maskedPhone"
                label="Telefone (Opcional)"
                class="col-md-4 col-xs-12"
            />
            <q-input
                outlined
                v-model="form.website"
                label="Site (Opcional)"
                class="col-md-6 col-xs-12"
            />
            <q-input
                outlined
                v-model="form.address"
                label="Endereço (Opcional)"
                class="col-md-6 col-xs-12"
            />
            <q-input
                outlined
                v-model="form.city"
                label="Cidade (Opcional)"
                class="col-md-4 col-xs-12"
            />
            <q-input
                outlined
                v-model="form.state"
                label="UF (Opcional)"
                maxlength="2"
                class="col-md-2 col-xs-12"
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
import organizationsService from 'src/services/organizationsService'
import { useRouter, useRoute } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import notifications from '../utils/notifications'
import mask from '../utils/mask'

const listRoute = 'organizations'

const headerProps = {
    title: '',
    btnIcon: 'format_list_numbered',
    btnName: 'Listar',
    btnTo: listRoute
}

export default defineComponent({
    name: 'OrganizationsForm',
    components: { ViewHeader },
    setup () {
        const router = useRouter()
        const route = useRoute()
        const { cnpjMask, phoneMask, unMask } = mask()
        const { post, getByID, update } = organizationsService()
        const { notifySuccess, notifyError } = notifications()

        const form = ref({
            name: '',
            legal_name: '',
            tax_id: '',
            email: '',
            phone: '',
            website: '',
            address: '',
            city: '',
            state: ''
        })

        const isEditMode = computed(() => !!route.params.id)
        headerProps.title = isEditMode.value ? 'Editar Organização' : 'Cadastrar Organização'

        onMounted(async () => {
            if (route.params.id) {
                await getOrganization(route.params.id)
            }
        })

        const getOrganization = async (id) => {
            try {
                const { data } = await getByID(id)
                const organization = data.data

                form.value = {
                    id: organization.id,
                    name: organization.name,
                    legal_name: organization.legal_name ?? '',
                    tax_id: cnpjMask(organization.tax_id),
                    email: organization.email ?? '',
                    phone: phoneMask(organization.phone),
                    website: organization.website ?? '',
                    address: organization.address ?? '',
                    city: organization.city ?? '',
                    state: organization.state ?? ''
                }
            } catch (error) {
                notifyError(error.response?.data?.message || 'Erro ao carregar organização!')
                router.push({ name: listRoute })
            }
        }

        const makePayload = () => ({
            name: form.value.name,
            legal_name: form.value.legal_name || null,
            tax_id: unMask(form.value.tax_id) || null,
            email: form.value.email || null,
            phone: unMask(form.value.phone) || null,
            website: form.value.website || null,
            address: form.value.address || null,
            city: form.value.city || null,
            state: form.value.state || null
        })

        const onSubmit = async () => {
            form.value.id ? updateOrganization() : newOrganization()
        }

        const updateOrganization = async () => {
            try {
                await update(makePayload(), form.value.id)
                notifySuccess('Organização atualizada com sucesso!')
                router.push({ name: listRoute })
            } catch (error) {
                handleErrors(error)
            }
        }

        const newOrganization = async () => {
            try {
                await post(makePayload())
                notifySuccess('Organização criada com sucesso!')
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
                notifyError(error.response?.data?.message || 'Erro ao salvar organização!')
            }
        }

        const maskedCnpj = computed({
            get () { return form.value.tax_id || '' },
            set (value) { form.value.tax_id = value ? cnpjMask(value) : '' }
        })

        const maskedPhone = computed({
            get () { return form.value.phone || '' },
            set (value) { form.value.phone = value ? phoneMask(value) : '' }
        })

        return {
            form,
            maskedCnpj,
            maskedPhone,
            isEditMode,
            onSubmit,
            headerProps,
            listRoute
        }
    }
})
</script>
