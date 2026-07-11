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
                :rules="[ val => val && val.length > 1 || 'Campo Obrigatório!']"
            />
            <q-input
                outlined
                v-model="maskedCpf"
                label="CPF (Opcional)"
                class="col-md-3 col-xs-12"
            />
            <q-input
                outlined
                v-model="maskedPhone"
                label="Telefone (Opcional)"
                class="col-md-3 col-xs-12"
            />
            <q-input
                outlined
                v-model="form.email"
                label="E-mail (Opcional)"
                type="email"
                lazy-rules
                class="col-md-6 col-xs-12"
                :rules="[ val => !val || val.includes('@') || 'E-mail inválido']"
            />
            <q-input
                outlined
                v-model="form.birth_date"
                label="Data de nascimento (Opcional)"
                mask="##/##/####"
                placeholder="dd/mm/aaaa"
                class="col-md-6 col-xs-12"
            >
                <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                            <q-date v-model="form.birth_date" mask="DD/MM/YYYY">
                                <div class="row items-center justify-end">
                                    <q-btn v-close-popup label="Fechar" color="primary" flat />
                                </div>
                            </q-date>
                        </q-popup-proxy>
                    </q-icon>
                </template>
            </q-input>
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
import adoptersService from 'src/services/adoptersService'
import { useRouter, useRoute } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import notifications from '../utils/notifications'
import mask from '../utils/mask'

const listRoute = 'adopters'

const headerProps = {
    title: '',
    btnIcon: 'format_list_numbered',
    btnName: 'Listar',
    btnTo: listRoute
}

// dd/mm/yyyy -> yyyy-mm-dd
const brDateToDb = (value) => {
    if (!value) return null
    const [d, m, y] = value.split('/')
    return (d && m && y) ? `${y}-${m}-${d}` : null
}

export default defineComponent({
    name: 'AdoptersForm',
    components: { ViewHeader },
    setup () {
        const router = useRouter()
        const route = useRoute()
        const { cpfMask, phoneMask, unMask } = mask()
        const { post, getByID, update } = adoptersService()
        const { notifySuccess, notifyError } = notifications()

        const form = ref({
            name: '',
            cpf: '',
            phone: '',
            email: '',
            birth_date: '',
            address: '',
            city: '',
            state: ''
        })

        const isEditMode = computed(() => !!route.params.id)
        headerProps.title = isEditMode.value ? 'Editar Adotante' : 'Cadastrar Adotante'

        onMounted(async () => {
            if (route.params.id) {
                await getAdopter(route.params.id)
            }
        })

        const getAdopter = async (id) => {
            try {
                const { data } = await getByID(id)
                const adopter = data.data

                form.value = {
                    id: adopter.id,
                    name: adopter.name,
                    cpf: cpfMask(adopter.cpf),
                    phone: phoneMask(adopter.phone),
                    email: adopter.email ?? '',
                    birth_date: adopter.birth_date ?? '',
                    address: adopter.address ?? '',
                    city: adopter.city ?? '',
                    state: adopter.state ?? ''
                }
            } catch (error) {
                notifyError(error.response?.data?.message || 'Erro ao carregar adotante!')
                router.push({ name: listRoute })
            }
        }

        const makePayload = () => ({
            name: form.value.name,
            cpf: unMask(form.value.cpf) || null,
            phone: unMask(form.value.phone) || null,
            email: form.value.email || null,
            birth_date: brDateToDb(form.value.birth_date),
            address: form.value.address || null,
            city: form.value.city || null,
            state: form.value.state || null
        })

        const onSubmit = async () => {
            form.value.id ? updateAdopter() : newAdopter()
        }

        const updateAdopter = async () => {
            try {
                await update(makePayload(), form.value.id)
                notifySuccess('Adotante atualizado com sucesso!')
                router.push({ name: listRoute })
            } catch (error) {
                handleErrors(error)
            }
        }

        const newAdopter = async () => {
            try {
                await post(makePayload())
                notifySuccess('Adotante criado com sucesso!')
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
                notifyError(error.response?.data?.message || 'Erro ao salvar adotante!')
            }
        }

        const maskedCpf = computed({
            get () { return form.value.cpf || '' },
            set (value) { form.value.cpf = value ? cpfMask(value) : '' }
        })

        const maskedPhone = computed({
            get () { return form.value.phone || '' },
            set (value) { form.value.phone = value ? phoneMask(value) : '' }
        })

        return {
            form,
            maskedCpf,
            maskedPhone,
            isEditMode,
            onSubmit,
            headerProps,
            listRoute
        }
    }
})
</script>
