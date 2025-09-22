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
                v-model="form.nome_fantasia"
                label="Nome Fantasia"
                lazy-rules
                class="col-md-4 col-xs-12"
                :rules="[ val => val && val.length > 0 || 'Campo Obrigatório!']"
            />

            <q-input
                outlined
                v-model="form.razao_social"
                label="Razão Social"
                lazy-rules
                class="col-md-4 col-xs-12"
                :rules="[ val => val && val.length > 0 || 'Campo Obrigatório!']"
            />

            <q-input
                outlined
                v-model="form.inscricao_estadual"
                label="Inscrição Estadual"
                lazy-rules
                class="col-md-4 col-xs-12"
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
                v-model="maskedCnpj"
                label="CNPJ"
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
import suppliersService from 'src/services/suppliersService'
import { useRouter, useRoute } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import notifications from '../utils/notifications'
import { activeInactive } from 'src/constants/statusOptions'
import mask from '../utils/mask';

const listRoute = 'suppliers'

const headerProps = {
    title: '',
    btnIcon: 'format_list_numbered',
    btnName: 'Listar',
    btnTo: listRoute
}

export default defineComponent({
    name: 'SuppliersForm',
    components: { ViewHeader },
    setup () {
        const router = useRouter()
        const route = useRoute()
        const { phoneMask, cnpjMask, unMask } = mask()
        const { post, getByID, update } = suppliersService()
        const { notifySuccess, notifyError } = notifications()

        const form = ref({
            nome_fantasia: '',
            razao_social: '',
            inscricao_estadual: '',
            email: '',
            cnpj: '',
            phone_1: '',
            phone_2: '',
            status: ''
        })

        const isEditMode = computed(() => !!route.params.id)
        headerProps.title = isEditMode.value ? 'Editar Fornecedor' : 'Cadastrar Fornecedor'

        onMounted(async () => {
            if (route.params.id) {
                await getSupplier(route.params.id)
            }
        })

        const onSubmit = async () => {
            form.value.id ? updateSupplier() : newSupplier()
        }

        const getSupplier = async (id) => {
            try {
                const { data } = await getByID(id)
                const supplierData = data.data;

                form.value = {
                    ...supplierData,
                    cnpj: cnpjMask(supplierData.cnpj),
                    phone_1: phoneMask(supplierData.phone_1),
                    phone_2: phoneMask(supplierData.phone_2),
                };

            } catch (error) {
                notifyError(error.response.data.message)
                router.push({ name: listRoute })
            }
        }

        const updateSupplier = async () => {
            try {
                await update(makePayload(), form.value.id)
                notifySuccess('Fornecedor atualizado com sucesso!')
                router.push({ name: listRoute })
            } catch (error) {
                Object.keys(error.response.data.errors).forEach(key => {
                    notifyError(error.response.data.errors[key])
                })
            }
        }

        const newSupplier = async () => {
            try {
                await post(makePayload())
                notifySuccess('Fornecedor criado com sucesso!')
                router.push({ name: listRoute })
            } catch (error) {
                Object.keys(error.response.data.errors).forEach(key => {
                    notifyError(error.response.data.errors[key])
                })
            }
        }

        const makePayload = () => {
            return {
                nome_fantasia: form.value.nome_fantasia,
                razao_social: form.value.razao_social,
                inscricao_estadual: form.value.inscricao_estadual,
                email: form.value.email,
                cnpj: unMask(form.value.cnpj),
                phone_1: unMask(form.value.phone_1),
                phone_2: unMask(form.value.phone_2),
                status: form.value.status.id
            }
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

        const onInputCnpj = (value) => {
            if (!value) {
                form.value.cnpj = null;
                return;
            }
            form.value.cnpj = cnpjMask(value);
        };

        const maskedCnpj = computed({
            get() {
                return form.value.cnpj || '';
            },
            set(value) {
                form.value.cnpj = value;
                onInputCnpj(value);
            }
        });

        return {
            form,
            onSubmit,
            maskedPhone1,
            maskedCnpj,
            maskedPhone2,
            headerProps,
            activeInactive,
            listRoute
        }
    }
})
</script>
