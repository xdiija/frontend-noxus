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
import paymentMethodsService from 'src/services/paymentMethodsService'
import { useRouter, useRoute } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import notifications from '../utils/notifications'
import { activeInactive } from 'src/constants/statusOptions'

const listRoute = 'paymentMethods'
const viewDescricao = 'Método de Pagamento'

const headerProps = {
    title: '',
    btnIcon: 'format_list_numbered',
    btnName: 'Listar',
    btnTo: listRoute
}

export default defineComponent({
    name: 'PaymentMethodsForm',
    components: { ViewHeader },
    setup () {
        const router = useRouter()
        const route = useRoute()
        const { post, getByID, update } = paymentMethodsService()
        const { notifySuccess, notifyError } = notifications()

        const form = ref({
            name: '',
            status: ''
        })

        const isEditMode = computed(() => !!route.params.id)
        headerProps.title = isEditMode.value ? `Editar ${viewDescricao}` : `Cadastrar ${viewDescricao}`

        onMounted(async () => {
            if (route.params.id) {
                await getPaymentMethod(route.params.id)
            }
        })

        const onSubmit = async () => {
            form.value.id ? updatePaymentMethod() : newPaymentMethod()
        }

        const getPaymentMethod = async (id) => {
            try {
                const { data } = await getByID(id)
                form.value = data.data;
            } catch (error) {
                notifyError(error.response.data.message)
                router.push({ name: listRoute })
            }
        }

        const updatePaymentMethod = async () => {
            try {
                await update(makePayload(), form.value.id)
                notifySuccess(`${viewDescricao} atualizado com sucesso!`)
                router.push({ name: listRoute })
            } catch (error) {
                Object.keys(error.response.data.errors).forEach(key => {
                    notifyError(error.response.data.errors[key])
                })
            }
        }

        const newPaymentMethod = async () => {
            try {
                await post(makePayload())
                notifySuccess(`${viewDescricao} criado com sucesso!`)
                router.push({ name: listRoute })
            } catch (error) {
                Object.keys(error.response.data.errors).forEach(key => {
                    notifyError(error.response.data.errors[key])
                })
            }
        }

        const makePayload = () => {
            const payload = {
                name: form.value.name,
                status: form.value.status.id
            }
            return payload
        }

        return {
            form,
            onSubmit,
            headerProps,
            activeInactive,
            listRoute
        }
    }
})
</script>
