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
            <q-select
                label="Origem"
                class="col-md-2 col-xs-12"
                outlined
                v-model="form.from_account_id"
                :options="selectOptions.accounts"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                :rules="[val => !!val || 'Campo Obrigatório!']"
            /> 
            <q-select
                label="Destino"
                class="col-md-2 col-xs-12"
                outlined
                v-model="form.to_account_id"
                :options="selectOptions.accounts"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                :rules="[val => !!val || 'Campo Obrigatório!']"
            />    
			<q-input
                v-model="formattedTotalAmount"
				outlined
                label="Valor"
                lazy-rules
                class="col-md-2 col-xs-12"
                :rules="[val => formatUSD(val) > 0 || 'O valor deve ser maior que zero!']"
            />
			<q-input
				outlined
                :model-value="form.transfer_date"
                label="Data"
                class="col-md-2 col-xs-12"
                readonly
            >
                <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                            <q-date
                                v-model="form.start_date"
                                mask="DD/MM/YYYY"
                            >                      
                                <div class="row items-center justify-end">
                                    <q-btn padding="xs lg" v-close-popup label="Fechar" color="primary" outline />
                                </div>
                            </q-date>
                        </q-popup-proxy>
                    </q-icon>
                </template>
            </q-input>
            <q-input
                outlined
                v-model="form.description"
                label="Descrição"
                lazy-rules
                class="col-md-4 col-xs-12"
                :rules="[val => val && val.length > 0 || 'Campo Obrigatório!']"
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
                    :to="{ name: headerProps.btnTo }"
                    outline
                />
            </div>
        </q-form>
    </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import transactionsService from 'src/services/transactionsService'
import accountsService from 'src/services/accountsService'
import { useRouter, useRoute } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import dateHelper from '../utils/dateHelper';
import notifications from '../utils/notifications'
import currency from '../utils/currency';
import { getPreviousRoute } from 'src/router'

const viewDescricao = 'Transferência'

export default defineComponent({
    name: 'TransactionsFormTransfer',
    components: { ViewHeader },
    setup () {
        const router = useRouter()
        const route = useRoute()
        const { post, getByID, update } = transactionsService()
        const { list: listAccounts } = accountsService()
        const { notifySuccess, notifyError } = notifications()
        const { convertToDbFormat, convertToBrFormat } = dateHelper()
        const { formatBRL, formatUSD, maskCurrency, usdToCents } = currency()

        const form = ref({
            type: 'transfer',
            from_account_id: null,
            to_account_id: null,
            description: '',
			transfer_date: getTodaysDate(),
			amount: 'R$ 0,00'
        })

		const isEditMode = computed(() => !!route.params.id)
		const headerProps = ref({
			title: isEditMode.value ? `Editar ${viewDescricao}` : `Cadastrar ${viewDescricao}`,
			btnIcon: 'format_list_numbered',
			btnName: 'Listar',
			btnTo: 'transactions'
		})

        const selectOptions = ref({
            accounts: []
        });

        onMounted(async () => {
            await fetchAccounts()
            if (route.params.id) {
                await getTransaction(route.params.id)
            }

			const prev = getPreviousRoute()			
			if (prev?.name) headerProps.value.btnTo = prev.name;			
        })

        const fetchAccounts = async () => {
            try {
                const accountsResponse = await listAccounts()			
                selectOptions.value.accounts = accountsResponse.data.data
            } catch (error) {
                notifyError('Erro ao carregar categorias ou contas.')
            }
        }

        const onSubmit = async () => {		
            console.log(makePayload());
            
            form.value.id ? updateTransaction() : newTransaction()
        }

		const newTransaction = async () => {
            try {
                await post(makePayload(), '/transfer')
                notifySuccess(`${viewDescricao} criada com sucesso!`)
                router.push({ name: headerProps.value.btnTo })
            } catch (error) {
                Object.keys(error.response.data.errors).forEach(key => {
                    notifyError(error.response.data.errors[key])
                })
            }
        }

        const getTransaction = async (id) => {
            try {
                const { data } = await getByID(id)
                form.value = data.data
            } catch (error) {
                notifyError(error.response.data.message)
                router.push({ name: headerProps.value.btnTo })
            }
        }

        const updateTransaction = async () => {
            try {
                await update(makePayload(), form.value.id)
                notifySuccess(`${viewDescricao} atualizada com sucesso!`)
                router.push({ name: headerProps.value.btnTo })
            } catch (error) {
                Object.keys(error.response.data.errors).forEach(key => {
                    notifyError(error.response.data.errors[key])
                })
            }
        }

        const makePayload = () => {
            return {
                from_account_id: form.value.from_account_id,
                to_account_id: form.value.to_account_id,
                type: form.value.type,
                description: form.value.description,
                amount: formatUSD(form.value.amount),
                transfer_date: convertToDbFormat(form.value.transfer_date),
            }
        }

		function getTodaysDate() {
			return convertToBrFormat(new Date().toISOString().split('T')[0]);
		}

		const onInputTotalAmount = (value) => {
            if (!value) {
                form.value.amount = null;
                return;
            }            
            form.value.amount = formatBRL(value)
        };

        const formattedTotalAmount = computed({
            get() {
                return form.value.amount || '';
            },
            set(value) {
                form.value.amount = value;
                onInputTotalAmount(value);
            }
        });

        return {
			formattedTotalAmount,
            form,
            headerProps,
            selectOptions,
            onSubmit,
			formatUSD
        }
    }
})
</script>
