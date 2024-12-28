<template>
    <q-page padding>
        <q-form
            @submit="onSubmit"
            @reset="onReset"
            class="row q-col-gutter-sm"
        >
            <q-input
                outlined
                v-model="form.predefined_income_id"
                label="Nome"
                lazy-rules
                class="col-lg-6 col-xs-12"
                :rules="[ val => val && val.length > 0 || 'Campo Obrigatório!']"
            />
            <q-input
                outlined
                v-model="form.user_id"
                label="Usuários"
                lazy-rules
                class="col-lg-6 col-xs-12"
                :rules="[ val => val && val.length > 0 || 'Campo Obrigatório!']"
            />
            <q-input
                outlined
                v-model="form.date"
                label="Data"
                lazy-rules
                class="col-lg-6 col-xs-12"
                :rules="[ val => val && val.length > 0 || 'Campo Obrigatório!']"
            />
            <q-input
                outlined
                v-model="form.observation"
                label="Observações"
                lazy-rules
                class="col-lg-6 col-xs-12"
                :rules="[ val => val && val.length > 0 || 'Campo Obrigatório!']"
            />
            <q-input
                outlined
                v-model="form.amount"
                label="Valor"
                mask="#.##"
                fill-mask="0"
                reverse-fill-mask
                class="col-lg-6 col-xs-12"
                input-class="text-right"
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
                    label="Limpar"
                    type="reset"
                    color="primary"
                    class="float-right q-mr-sm"
                    icon="clear"
                    outline
                />
            </div>
        </q-form>
    </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import incomeService from 'src/services/incomeService'
import { useQuasar } from 'quasar'
import { useRouter, useRoute } from 'vue-router'

export default defineComponent({
    name: 'IncomeForm',
    setup () {
        const $q = useQuasar()
        const router = useRouter()
        const route = useRoute()
        const { post, getByID, update } = incomeService()
        const form = ref({
            predefined_income_id: null,
            observation: null,
            amount: null,
            date: null,
            user_id: null
        })

        onMounted(async () => {
            if (route.params.id) {
                getIncome(route.params.id)
            }
        })

        const getIncome = async (id) => {
            try {
                const res = await getByID(id)
                form.value = res.data
            } catch (error) {
                console.erro(error)
            }
        }

        const updateIncome = async () => {
            try {
                const res = await update(form.value)
                notifyAndRedirect()
            } catch (error) {
                console.erro(error)
            }
        }

        const newIncome = async () => {
            try {
                const res = await post(form.value)
                notifyAndRedirect()
            } catch (error) {
                console.erro(error)
            }
        }

        const notifyAndRedirect = () => {
            $q.notify({
                message: 'Registrado com sucesso!',
                icon: 'check',
                color: 'positive'
            })
            router.push({ name: 'income' })
        }

        const onSubmit = async () => {
            form.value.id ? updateIncome() : newIncome()
        }

        return {
            form,
            onSubmit,
            onReset () {
                form.value = {
                    predefined_income_id: null,
                    observation: null,
                    amount: null,
                    date: null,
                    user_id: null
                }
            }
        }
    }
})
</script>
