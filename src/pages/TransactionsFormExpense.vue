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
                label="Pessoa"
                class="col-md-4 col-xs-12"
                outlined
                v-model="form.pessoa"
                :options="selectOptions.pessoas"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                :rules="[val => !!val || 'Campo Obrigatório!']"
            /> 
            <q-select
                label="Categoria"
                class="col-md-4 col-xs-12"
                outlined
                v-model="form.category_id"
                :options="selectOptions.categories"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                :rules="[val => !!val || 'Campo Obrigatório!']"
            />    
            <q-select
                label="Centro de Custos"
                class="col-md-4 col-xs-12"
                outlined
                v-model="form.costs_center"
                :options="selectOptions.costs_center"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                :rules="[val => !!val || 'Campo Obrigatório!']"
            />
            <q-input
                outlined
                v-model="form.description"
                label="Descrição"
                lazy-rules
                class="col-md-4 col-xs-12"
                :rules="[val => val && val.length > 0 || 'Campo Obrigatório!']"
            />        
            <q-select
                label="Pagamento"
                class="col-md-2 col-xs-12"
                outlined
                v-model="form.payment_type"
                :options="selectOptions.payment_type"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                :rules="[val => !!val || 'Campo Obrigatório!']"
				@update:model-value="paymentFunctions.handlePaymentTypeChange"
            />
            <q-input
				v-if="form.payment_type == 'installment'"
				:outlined="form.installmentsUpdate.payment_number"
  				:filled="!form.installmentsUpdate.payment_number"
				v-model="form.payment_number"
				type="number"
				label="Parcelas"
				lazy-rules
				class="col-md-2 col-xs-12"
				:min="form.payment_type === 'installment' ? 2 : 1"
				:max="form.payment_type === 'installment' ? 24 : 1"
				:rules="[
					val => val > 0 || 'O valor deve ser maior que zero!',
					val => (form.payment_type === 'installment' && (val < 2 || val > 24)) 
					? 'O número de parcelas deve ser entre 2 e 24' 
					: true
				]"
				@update:model-value="paymentFunctions.handlePaymentNumberChange"
			/>
			<q-input
				v-if="form.payment_type == 'installment'"
				:outlined="form.installmentsUpdate.start_date"
  				:filled="!form.installmentsUpdate.start_date"
                :model-value="form.start_date"
                label="Primeira Parcela"
                class="col-md-2 col-xs-12"
                readonly
            >
                <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                            <q-date
                                v-model="form.start_date"
                                mask="DD/MM/YYYY"
								@update:model-value="paymentFunctions.handlePaymentsStartDateChange"
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
				v-if="form.payment_type == 'installment'"
                :outlined="form.installmentsUpdate.total_amount"
  				:filled="!form.installmentsUpdate.total_amount"
                v-model="formattedTotalAmount"
                label="Valor"
                lazy-rules
                class="col-md-2 col-xs-12"
                :rules="[val => formatUSD(val) > 0 || 'O valor deve ser maior que zero!']"
				@update:model-value="paymentFunctions.handleTotalAmountChange(form.total_amount)"
            />

			<!--<div> TABLE --- TABLE --- TABLE --- TABLE --- TABLE --- TABLE --- </div>-->
			<!--<div> TABLE --- TABLE --- TABLE --- TABLE --- TABLE --- TABLE --- </div>-->

            <div class="col-12 q-mt-md">
				<q-table
					:rows="form.payments"
					title="Parcelas"
					:columns="paymentColumns"
					row-key="index"
					hide-pagination
					virtual-scroll
					:rows-per-page-options="[0]"
					style="height: 400px"
				>
				<template v-slot:top-right>
					<q-btn
						v-if="form.payment_type == 'installment'"
						:disabled="form.start_date == null || form.total_amount == 0 || form.payment_number < 2 || form.payment_number > 24"
						size="sm"
						color="primary"
						label="Gerar Parcelas"
						@click="paymentFunctions.createPayments"
					/>
				</template>
				<template v-slot:body-cell-created_at="props">
					<q-td :props="props">
						<q-input 
						v-model="props.row.created_at" 
						dense 
						borderless 
						readonly
						/>
					</q-td>
				</template>
					<template v-slot:body-cell-due_date="props">
						<q-td :props="props">
							<q-input 
								v-model="props.row.due_date" 
								dense 
								readonly 
								@update:model-value="updatePayment(props.row)"
							>
								<template v-slot:append>
									<q-icon name="event" class="cursor-pointer">
										<q-popup-proxy cover transition-show="scale" transition-hide="scale">
											<q-date
												v-model="props.row.due_date"
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
						</q-td>
					</template>
					
					<template v-slot:body-cell-payment_date="props">
						<q-td :props="props">
							<q-input 
								v-model="props.row.payment_date" 
								dense 
								readonly 
								@update:model-value="updatePayment(props.row)"
							>
								<template v-slot:append>
									<q-icon name="event" class="cursor-pointer">
										<q-popup-proxy cover transition-show="scale" transition-hide="scale">
											<q-date
												v-model="props.row.payment_date"
												:options="optionsPaymentDate"
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
						</q-td>
					</template>

					<template v-slot:body-cell-account_id="props">
						<q-td :props="props">
							<div class="row items-center no-wrap q-gutter-xs">
								<q-select
									v-model="props.row.account_id"
									:options="selectOptions.accounts"
									option-value="id"
									option-label="name"
									emit-value
									map-options
									dense
									class="col-grow"
								/>
								<q-btn
									v-if="form.payments.length > 1"
									:disabled="!props.row.account_id"
									icon="check"
									color="positive"
									flat
									dense
									size="sm"
									@click="paymentFunctions.replicateAccountToOtherPayments(props.row.account_id)"
								>
									<q-tooltip class="bg-positive">Aplicar em todas</q-tooltip>
								</q-btn>
							</div>
						</q-td>
					</template>

					<template v-slot:body-cell-amount="props">
						<q-td :props="props" class="q-gutter-sm">
							<div class="row items-center no-wrap q-gutter-xs">
								<q-input
									v-model="props.row.amount"
									dense
									:readonly="!props.row.lock"
									@update:model-value="val => paymentFunctions.handlePaymentAmountInput(val, props.row)"
								/>
								<q-checkbox
									v-if="form.payments.length > 1"
									v-model="props.row.lock"
									checked-icon="lock"
									unchecked-icon="lock_open"
									indeterminate-icon="help"
								/>
							</div>
						</q-td>
					</template>
				</q-table>
    		</div>

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
				 <q-btn
                    label="TESTEEE"
                    color="primary"
                    class="float-right q-mr-sm"
                    outline
					@click="paymentFunctions.testeee"
                />
            </div>
        </q-form>
    </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import transactionsService from 'src/services/transactionsService'
import transactionCategoriesService from 'src/services/transactionCategoriesService'
import accountsService from 'src/services/accountsService'
import { useRouter, useRoute } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import dateHelper from '../utils/dateHelper';
import notifications from '../utils/notifications'
import currency from '../utils/currency';

const listRoute = 'transactions'
const viewDescricao = 'Despesa'

const headerProps = {
    title: '',
    btnIcon: 'format_list_numbered',
    btnName: 'Listar',
    btnTo: listRoute
}

export default defineComponent({
    name: 'TransactionsFormExpense',
    components: { ViewHeader },
    setup () {
        const router = useRouter()
        const route = useRoute()
        const { post, getByID, update } = transactionsService()
        const { list: listCategories } = transactionCategoriesService()
        const { list: listAccounts } = accountsService()
        const { notifySuccess, notifyError } = notifications()
        const { convertToDbFormat, convertToBrFormat } = dateHelper()
        const { formatBRL, formatUSD, maskCurrency, usdToCents } = currency()

        const form = ref({
			installmentsUpdate: { payment_number: false, start_date: false, total_amount: false },
            type: 'expense',
            pessoa: null,
            category_id: null,
			costs_center: null,
            description: '',
            payment_type: 'single',
            payment_number: 1,
			start_date: null,
			total_amount: 0,
            payments: [
				{
					index: 1,
					created_at: getTodaysDate(),
					due_date: getTodaysDate(),
					payment_date: '',
					account_id: '',
					payment_method_id: '',
					amount: 0,
					lock: false,
				}
			],
        })

        const selectOptions = ref({
            accounts: [],
            categories: [],
            pessoas: [
                {id: 1, name: 'Luis Silva'},
                {id: 2, name: 'Maria Fernanda Alves'},
                {id: 3, name: 'Roberto Melchioretto'}
            ],
            payment_type: [
                {id: 'single', name: 'Único'},
                {id: 'installment', name: 'Parcelado'},
                {id: 'recurrent', name: 'Recorrente'}
            ],
            costs_center: [
                {id: 1, name: 'Marcenaria'},
                {id: 2, name: 'Loja'},
                {id: 3, name: 'Marketing'}
            ],
        });

        const isEditMode = computed(() => !!route.params.id)
        headerProps.title = isEditMode.value ? `Editar ${viewDescricao}` : `Cadastrar ${viewDescricao}`

        onMounted(async () => {
            await fetchCategoriesAndAccounts()
            if (route.params.id) {
                await getTransaction(route.params.id)
            }
        })

        const fetchCategoriesAndAccounts = async () => {
            try {
                const categoriesResponse = await listCategories()
                const accountsResponse = await listAccounts()

                selectOptions.value.categories = categoriesResponse.data.data
                selectOptions.value.accounts = accountsResponse.data.data
            } catch (error) {
                notifyError('Erro ao carregar categorias ou contas.')
            }
        }

        const onSubmit = async () => {
            form.value.id ? updateTransaction() : newTransaction()
        }

        const getTransaction = async (id) => {
            try {
                const { data } = await getByID(id)
                form.value = data.data
            } catch (error) {
                notifyError(error.response.data.message)
                router.push({ name: listRoute })
            }
        }

        const updateTransaction = async () => {
            try {
                await update(makePayload(), form.value.id)
                notifySuccess(`${viewDescricao} atualizada com sucesso!`)
                router.push({ name: listRoute })
            } catch (error) {
                Object.keys(error.response.data.errors).forEach(key => {
                    notifyError(error.response.data.errors[key])
                })
            }
        }

        const newTransaction = async () => {
            try {
                await post(makePayload())
                notifySuccess(`${viewDescricao} criada com sucesso!`)
                router.push({ name: listRoute })
            } catch (error) {
                Object.keys(error.response.data.errors).forEach(key => {
                    notifyError(error.response.data.errors[key])
                })
            }
        }

        const makePayload = () => {
            return {
                total_amount: form.value.total_amount,
                start_date: form.value.start_date,
                payment_date: form.value.payment_date,
                description: form.value.description,
                category_id: form.value.category_id,
                account_id: form.value.account_id
            }
        }

        const paymentColumns = [
			{ name: 'index', label: '#', field: 'index', align: 'left', style: 'width: 5%' },
			{ name: 'created_at', label: 'Data Lançamento', field: 'created_at', align: 'left', style: 'width: 18%' },
			{ name: 'due_date', label: 'Data Vencimento', field: 'due_date', align: 'left', style: 'width: 18%' },
			{ name: 'payment_date', label: 'Data Pagamento', field: 'payment_date', align: 'left', style: 'width: 18%' },
			{ name: 'account_id', label: 'Conta', field: 'account_id', align: 'left', style: 'width: 25%' },
			{ name: 'amount', label: 'Valor', field: 'amount', align: 'left' , style: 'width: 16%' },
		]

		const updatePayment = (payment) => {
			console.log("updatePayment");

			const rowIndex = payment.index -1
			if (rowIndex !== -1) {
				form.value.payments[rowIndex] = payment
			}
			
			const paymentIndex = rowIndex
			if (paymentIndex === -1) {
				form.value.payments.push(payment)
			} else {
				form.value.payments[paymentIndex] = payment
			}
		}

		function getTodaysDate() {
			return convertToBrFormat(new Date().toISOString().split('T')[0]);
		}

		const paymentFunctions = {

			testeee: () => {
				console.log('form.value.payments');
				console.log(form.value.payments);
				console.log('form.value.total_amount');
				console.log(form.value.total_amount);
			},

			handlePaymentTypeChange: (type) => {
				if(type == 'installment'){
					form.value.payment_number = 2;
					form.value.total_amount = form.value.payments[0].amount;
					form.value.payments[0].amount = 0;
					return;
				}
				
				form.value.payment_number = 1
				form.value.start_date = null;
				form.value.payments = [
					{
						index: 1,
						created_at: form.value.payments[0].created_at,
						due_date: form.value.payments[0].due_date,
						payment_date: form.value.payments[0].payment_date,
						account_id: form.value.payments[0].account_id,
						amount: form.value.total_amount,
						lock: false,
					}
				];
			},

			handlePaymentNumberChange: (val) => {
				if(val <= 1) return;
				form.value.installmentsUpdate.payment_number = val == form.value.payments.length;
			},

			handlePaymentsStartDateChange: (val) => {					
				form.value.installmentsUpdate.start_date = val == form.value.payments[0].due_date;
			},

			handleTotalAmountChange: (val) => {
				if(form.value.payments.length <= 1) return;
				let paymentsAmountTotalCents = 0;
				const newValCents = usdToCents(formatUSD(val));

				form.value.payments.forEach(payment => {
					paymentsAmountTotalCents = paymentsAmountTotalCents + usdToCents(formatUSD(payment.amount))
				});			
				
				form.value.installmentsUpdate.total_amount = newValCents == paymentsAmountTotalCents;
			},

			createPayments: () => {

				if(!form.value.total_amount || !form.value.start_date) return;

				const installmentValue = formatUSD(form.value.total_amount) / form.value.payment_number;
				
				const newPayments = [];
				let dueDate = form.value.start_date;

				for (let i = 0; i < form.value.payment_number; i++) {
					dueDate = paymentFunctions.generateDueDate(i, dueDate, {type:'months', toAdd: 1});
					newPayments.push({
						index: i + 1,
						created_at: getTodaysDate(),
						due_date: dueDate,
						payment_date: null,
						account_id: null,
						amount: formatBRL(installmentValue.toFixed(2)),
						lock: false,
					})
				}

				Object.entries(form.value.installmentsUpdate).forEach(([key, value]) => {
					form.value.installmentsUpdate[key] = true;
				});

				form.value.payments = newPayments
			},

			generateDueDate: (index, date, interval) => {
				if(index == 0) return date;

				if(interval.type == 'months'){
					return convertToBrFormat(paymentFunctions.addMonths(date, interval.toAdd));
				}

				if(interval.type == 'days'){
					return convertToBrFormat(paymentFunctions.addDays(date, interval.toAdd));
				}
	
				return '';
			},

			addMonths: (brDate, toAdd) => {
				const [day, month, year] = brDate.split('/').map(Number);
				const dateObj = new Date(year, month - 1, day);
				dateObj.setMonth(dateObj.getMonth() + toAdd);

				const yyyy = dateObj.getFullYear();
				const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
				const dd = String(dateObj.getDate()).padStart(2, '0');

				return `${yyyy}-${mm}-${dd}`;
			},

			addDays: (date, toAdd) => {
				const dbDate = convertToDbFormat(date);
				const dateObj = new Date(dbDate);
				dateObj.setDate(dateObj.getDate() + toAdd);
				return dateObj.toISOString().split('T')[0];
			},

			handlePaymentAmountInput: (val, row) => {			
				if (!val) {
					row.amount = '';
					return;
				}
							
				row.amount = formatBRL(val);				
				
				if(form.value.payments.length <= 1) return;

				let lockedAmountCents = 0;
				let lockedPaymentsCount = 0;
				const totalCents = usdToCents(formatUSD(form.value.total_amount));
				
				form.value.payments.forEach(payment => {
					if(payment.lock){
						lockedPaymentsCount++
						lockedAmountCents = lockedAmountCents + usdToCents(formatUSD(payment.amount))
					}
				});

				if(lockedAmountCents > totalCents) {
					notifyError('Os valores dos pagamentos não podem ser superiores ao valor total')
					return;
				}

				const saldoRestanteCents = totalCents - lockedAmountCents;
				const amountParcelasRestanteCents = saldoRestanteCents / (form.value.payments.length - lockedPaymentsCount)		
				
				
				form.value.payments.forEach(payment => {
					if(!payment.lock) payment.amount = formatBRL(amountParcelasRestanteCents);
				});
			},

			replicateAccountToOtherPayments: (accountId) => {
				form.value.payments.forEach(payment => {
					payment.account_id = accountId;
				});
			}
		}
		
		const optionsPaymentDate = (date) => {
			const inputDate = new Date(date)
			const today = new Date()
			today.setHours(0, 0, 0, 0)
			return inputDate <= today
		}

		const onInputTotalAmount = (value) => {
            if (!value) {
                form.value.total_amount = null;
                return;
            }            
            form.value.total_amount = formatBRL(value)
        };

        const formattedTotalAmount = computed({
            get() {
                return form.value.total_amount || '';
            },
            set(value) {
                form.value.total_amount = value;
                onInputTotalAmount(value);
            }
        });

        return {
			formattedTotalAmount,
            form,
            onSubmit,
			getTodaysDate,
			optionsPaymentDate,
			paymentFunctions,
            headerProps,
            listRoute,
            selectOptions,
            paymentColumns,
            updatePayment,
			formatUSD
        }
    }
})
</script>
