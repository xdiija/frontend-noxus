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
                v-model="form.phone1"
                label="Telefone 1"
                class="col-md-6 col-xs-12"
                :rules="[ val => val && val.length >= 10 || 'Telefone inválido!']"
            />
            <q-input
                outlined
                v-model="form.phone2"
                label="Telefone 2 (Opcional)"
                class="col-md-6 col-xs-12"
            />
            <q-select
                label="Status"
                class="col-md-6 col-xs-12"
                outlined
                v-model="form.status"
                :options="activeInactive"
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
        const { list, post, getById, update } = customersService()
        const { notifySuccess, notifyError } = notifications()

        const form = ref({
            name: null,
            email: null,
            phone1: null,
            phone2: null,
            status: null
        })

        const customers = ref([])

        const isEditMode = computed(() => !!route.params.id)
        headerProps.title = isEditMode.value ? 'Editar Cliente' : 'Cadastrar Cliente'

        onMounted(async () => {
            if (route.params.id) {
                await getCustomer(route.params.id)
            }
            await fetchCustomers()
        })

        const onSubmit = async () => {
            form.value.id ? updateCustomer() : createCustomer()
        }

        const getCustomer = async (id) => {
            try {
                const { data } = await getById(id)
                form.value = data
            } catch (error) {
                notifyError(error.response.data.message)
                router.push({ name: listRoute })
            }
        }

        const updateCustomer = async () => {
            try {
                await update(form.value, form.value.id)
                notifySuccess('Cliente atualizado com sucesso!')
                router.push({ name: listRoute })
            } catch (error) {
                notifyError(error.response.data.message)
            }
        }

        const createCustomer = async () => {
            try {
                await post(form.value)
                notifySuccess('Cliente cadastrado com sucesso!')
                router.push({ name: listRoute })
            } catch (error) {
                notifyError(error.response.data.message)
            }
        }

        const fetchCustomers = async () => {
            try {
                const { data } = await list()
                customers.value = data
            } catch (error) {
                notifyError('Erro ao buscar clientes!')
            }
        }

        return {
            form,
            onSubmit,
            headerProps,
            activeInactive,
            listRoute,
            customers
        }
    }
})
</script>
