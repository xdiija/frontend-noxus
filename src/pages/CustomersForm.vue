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
                class="col-md-4 col-xs-12"
                :rules="[ val => val && val.length > 0 || 'Campo Obrigatório!']"
            />
            <q-input
                outlined
                v-model="form.email"
                label="E-mail"
                type="email"
                lazy-rules
                class="col-md-4 col-xs-12"
                :rules="[ val => val && val.includes('@') || 'E-mail inválido']"
            />
            <q-input
                outlined
                v-model="maskedCpf"
                label="CPF"
                type="cpf"
                lazy-rules
                class="col-md-4 col-xs-12"
            />
            <q-input
                outlined
                v-model="maskedPhone1"
                label="Telefone 1"
                class="col-md-4 col-xs-12"
                :rules="[ val => val && val.length >= 10 || 'Telefone inválido!']"
            />
            <q-input
                outlined
                v-model="maskedPhone2"
                label="Telefone 2 (Opcional)"
                class="col-md-4 col-xs-12"
            />
            <q-select
                label="Status"
                class="col-md-4 col-xs-12"
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
import mask from '../utils/mask';

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
        const { phoneMask, cpfMask, unMask } = mask()
        const { post, getByID, update } = customersService()
        const { notifySuccess, notifyError } = notifications()

        const form = ref({
            name: '',
            email: '',
            cpf: '',
            phone_1: '',
            phone_2: '',
            status: ''
        })

        const isEditMode = computed(() => !!route.params.id)
        headerProps.title = isEditMode.value ? 'Editar Cliente' : 'Cadastrar Cliente'

        onMounted(async () => {
            if (route.params.id) {
                await getCustomer(route.params.id)
            }
        })

        const onSubmit = async () => {
            form.value.id ? updateCustomer() : newCustomer()
        }

        const getCustomer = async (id) => {
            try {
                const { data } = await getByID(id)
                const customerData = data.data;

                form.value = {
                    ...customerData,
                    cpf: cpfMask(customerData.cpf),
                    phone_1: phoneMask(customerData.phone_1),
                    phone_2: phoneMask(customerData.phone_2),
                };

            } catch (error) {
                notifyError(error.response.data.message)
                router.push({ name: listRoute })
            }
        }

        const updateCustomer = async () => {
            try {
                await update(makePayload(), form.value.id)
                notifySuccess('Cliente atualizado com sucesso!')
                router.push({ name: listRoute })
            } catch (error) {
                Object.keys(error.response.data.errors).forEach(key => {
                    notifyError(error.response.data.errors[key])
                })
            }
        }

        const newCustomer = async () => {
            try {
                await post(makePayload())
                notifySuccess('Cliente criado com sucesso!')
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
                email: form.value.email,
                cpf: unMask(form.value.cpf),
                phone_1: unMask(form.value.phone_1),
                phone_2: unMask(form.value.phone_1),
                status: form.value.status.id
            }
            
            return payload
        }

        const onInputPhone = (field, value) => {
            if (!value) {
                form.value[field] = null;
                return;
            }
            form.value[field] = phoneMask(value);
        };

        const maskedPhone1 = computed({
            get() {
                return form.value.phone_1 || '';
            },
            set(value) {
                form.value.phone_1 = value;
                onInputPhone('phone_1', value);
            }
        });

        const maskedPhone2 = computed({
            get() {
                return form.value.phone_2 || '';
            },
            set(value) {
                form.value.phone_2 = value;
                onInputPhone('phone_2', value);
            }
        });

        const onInputCpf = (value) => {
            if (!value) {
                form.value.cpf = null;
                return;
            }            
            form.value.cpf = cpfMask(value)
        };

        const maskedCpf = computed({
            get() {
                return form.value.cpf || '';
            },
            set(value) {
                form.value.cpf = value;
                onInputCpf(value);
            }
        });

        return {
            form,
            onSubmit,
            maskedPhone1,
            maskedCpf,
            maskedPhone2,
            headerProps,
            activeInactive,
            listRoute
        }
    }
})
</script>
