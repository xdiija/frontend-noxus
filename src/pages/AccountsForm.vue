<template>
    <div class="q-pa-md">
        <ViewHeader
            :title="headerProps.title"
            :btnTo="headerProps.btnTo"
            :btnIcon="headerProps.btnIcon"
            :btnName="headerProps.btnName"
        />
        <q-form
            @submit="onSubmit"
            class="row q-col-gutter-sm"
        >
            <q-input
                outlined
                v-model="form.name"
                label="Nome"
                lazy-rules
                class="col-md-6 col-xs-12"
                :rules="[ val => val && val.length > 0 || 'Campo Obrigatório!']"
            />
            <q-input
                outlined
                v-model="form.email"
                label="E-mail"
                type="email"
                lazy-rules
                class="col-md-6 col-xs-12"
                :rules="[ val => val && val.includes('@') || 'E-mail inválido']"
            />
            <q-input
                outlined
                v-model="form.phone_1"
                label="Telefone 1"
                class="col-md-6 col-xs-12"
                :rules="[ val => val && val.length >= 10 || 'Telefone inválido!']"
            />
            <q-input
                outlined
                v-model="form.phone_2"
                label="Telefone 2 (Opcional)"
                class="col-md-6 col-xs-12"
            />
            <q-select
                label="Status"
                class="col-md-6 col-xs-12"
                outlined
                v-model="form.status"
                :options="activeInactive"
                option-value="value"
                option-label="name"
                emit-value
                map-options
                :rules="[val => !!val || 'Campo Obrigatório!']"
            />

            <div class="col-lg-12 col-xs-12">
                <q-btn
                    label="Salvar"
                    type="submit"
                    class="float-right"
                    color="primary"
                    icon="save"
                />
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
import customersService from 'src/services/customersService'
import { useRouter, useRoute } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import notifications from '../utils/notifications'
import { activeInactive } from 'src/constants/statusOptions'

const listRoute = 'customers'

const headerProps = {
    title: '',
    btnIcon: 'format_list_numbered',
    btnName: 'Listar',
    btnTo: listRoute
}

export default defineComponent({
    name: 'CustomersForm',
    components: { ViewHeader },
    setup () {
        const router = useRouter()
        const route = useRoute()
        const { post, getByID, update } = customersService()
        const { notifySuccess, notifyError } = notifications()

        const form = ref({
            name: '',
            email: '',
            phone_1: '',
            phone_2: '',
            status: ''
        })

        const customers = ref([])

        const isEditMode = computed(() => !!route.params.id)
        headerProps.title = isEditMode.value ? 'Editar Cliente' : 'Cadastrar Cliente'

        onMounted(async () => {

            if (route.params.id) {
                await getCustomers(route.params.id)
            }
        })

        const getCustomers = async (id) => {
            try {
                const { data } = await getByID(id)
                form.value = data.data

            } catch (error) {

                console.log(error)

                notifyError(error.response.data.message)
                router.push({ name: listRoute })
            }
        }

        const newCustomer = async () => {
            try {
                await post(makePayload())
                notifySuccess('Cliente criado com sucesso!')
                router.push({ name: 'customers' })
            } catch (error) {
                Object.keys(error.response.data.errors).forEach(key => {
                    notifyError(error.response.data.errors[key])
                })
            }
        }

        const updateCustomer = async (customerData) => {
            try {
                await update(makePayload(), form.value.id)
                notifySuccess('Cliente atualizado com sucesso!')
                router.push({ name: 'customers' })
            } catch (error) {
                Object.keys(error.response.data.errors).forEach(key => {
                    notifyError(error.response.data.errors[key])
                })
            }
        }

        const makePayload = () => {
            const payload = {
                name: form.value.name,
                email: form.value.email,
                phone_1: form.value.phone_1,
                phone_2: form.value.phone_1,
                status: form.value.status.id
            }
            return payload
        }

        const convertStatus = (status) => {
            console.log('Valor recebido em status:', status)
            return status.name === 'Ativo' ? 1 : 2
        }

        const onSubmit = async () => {
            const customerData = {
                ...form.value,
                status: convertStatus(form.value.status) // Converte antes de enviar
            }

            console.log('Enviando dados para API:', customerData)

            customerData.id ? updateCustomer(customerData) : newCustomer(customerData)
        }

        return {
            form,
            onSubmit,
            headerProps,
            activeInactive,
            listRoute,
            customers,
            convertStatus
        }
    }
})
</script>
