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
                label="Tipo"
                class="col-md-6 col-xs-12"
                outlined
                v-model="form.type"
                :options="accountTypes"
                option-label="name"
                option-value="id"
                emit-value
                map-options
                :rules="[val => !!val || 'Campo Obrigatório!']"
            />
            <q-input
                outlined
                v-model="formattedBalance"
                label="Saldo"
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
                    :to="{ name: 'accounts' }"
                    outline
                />
            </div>
        </q-form>
    </div>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from 'vue'
import accountsService from 'src/services/accountsService'
import { useRouter, useRoute } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import notifications from '../utils/notifications'
import { activeInactive } from 'src/constants/statusOptions';
import { accountTypes } from 'src/constants/accountTypes';
import currency from '../utils/currency';

const headerProps = {
    title: '',
    btnIcon: 'format_list_numbered',
    btnName: 'Listar',
    btnTo: 'accounts'
}

export default defineComponent({
    name: 'AccountsForm',
    components: { ViewHeader },
    props: {
        user: { type: Object, required: true }
    },
    setup () {
        const router = useRouter()
        const route = useRoute()
        const { formatBRL, formatUSD, maskCurrency } = currency()
        const { post, getByID, update } = accountsService()
        const { notifySuccess, notifyError } = notifications()

        const form = ref({
            name: null,
            type: null,
            balance: 0,
            status: null
        })

        const isEditMode = computed(() => !!route.params.id)
        headerProps.title = isEditMode.value ? 'Editar Conta' : 'Cadastrar Conta'

        onMounted(async () => {
            if (route.params.id) {
                await getAccount(route.params.id)
            }
        })

        const onSubmit = async () => {
            form.value.id ? updateAccount() : newAccount()
        }

        const getAccount = async (id) => {
            try {
                const { data } = await getByID(id)
                const accountData = data.data;
                             
                form.value = {
                    ...accountData,
                    balance: maskCurrency(accountData.balance),
                    type: accountData.type,
                };
            } catch (error) {
                notifyError(error.response.data.message)
                router.push({ name: 'accounts' })
            }
        }

        const updateAccount = async () => {
            try {
                await update(makePayload(), form.value.id)
                notifySuccess('Conta atualizada com sucesso!')
                router.push({ name: 'accounts' })
            } catch (error) {
                Object.keys(error.response.data.errors).forEach(key => {
                    notifyError(error.response.data.errors[key])
                })
            }
        }

        const newAccount = async () => {
            try {              
                await post(makePayload())
                notifySuccess('Conta criada com sucesso!')
                router.push({ name: 'accounts' })
            } catch (error) {
                Object.keys(error.response.data.errors).forEach(key => {
                    notifyError(error.response.data.errors[key])
                })
            }
        }

        const makePayload = () => {             
            const payload = {
                name: form.value.name,
                type: form.value.type,
                balance: formatUSD(form.value.balance),
                status: form.value.status.id
            }
            return payload        
        }

        const onInputBalance = (value) => {
            if (!value) {
                form.value.balance = null;
                return;
            }            
            form.value.balance = formatBRL(value)
        };


        const formattedBalance = computed({
            get() {
                return form.value.balance || '';
            },
            set(value) {
                form.value.balance = value;
                onInputBalance(value);
            }
        });

        return {
            onSubmit,
            onReset () {
                form.value = {
                    name: null,
                    type: null,
                    balance: 0,
                    status: null
                }
            },
            form,
            formattedBalance,
            headerProps,
            activeInactive,
            accountTypes
        }
    }
})
</script>
