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
                v-model="form.role"
                label="Função (Opcional)"
                class="col-md-6 col-xs-12"
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
            <div class="col-md-3 col-xs-12 flex items-center self-start" style="height: 56px">
                <q-toggle v-model="form.status" label="Ativo" />
            </div>

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
import volunteersService from 'src/services/volunteersService'
import { useRouter, useRoute } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import notifications from '../utils/notifications'
import mask from '../utils/mask'

const listRoute = 'volunteers'

const headerProps = {
    title: '',
    btnIcon: 'format_list_numbered',
    btnName: 'Listar',
    btnTo: listRoute
}

export default defineComponent({
    name: 'VolunteersForm',
    components: { ViewHeader },
    setup () {
        const router = useRouter()
        const route = useRoute()
        const { phoneMask, unMask } = mask()
        const { post, getByID, update } = volunteersService()
        const { notifySuccess, notifyError } = notifications()

        const form = ref({
            name: '',
            phone: '',
            email: '',
            role: '',
            status: true
        })

        const isEditMode = computed(() => !!route.params.id)
        headerProps.title = isEditMode.value ? 'Editar Voluntário' : 'Cadastrar Voluntário'

        onMounted(async () => {
            if (route.params.id) {
                await getVolunteer(route.params.id)
            }
        })

        const getVolunteer = async (id) => {
            try {
                const { data } = await getByID(id)
                const volunteer = data.data

                form.value = {
                    id: volunteer.id,
                    name: volunteer.name,
                    phone: phoneMask(volunteer.phone),
                    email: volunteer.email ?? '',
                    role: volunteer.role ?? '',
                    status: volunteer.status?.id === 1
                }
            } catch (error) {
                notifyError(error.response?.data?.message || 'Erro ao carregar voluntário!')
                router.push({ name: listRoute })
            }
        }

        const makePayload = () => ({
            name: form.value.name,
            phone: unMask(form.value.phone) || null,
            email: form.value.email || null,
            role: form.value.role || null,
            status: form.value.status
        })

        const onSubmit = async () => {
            form.value.id ? updateVolunteer() : newVolunteer()
        }

        const updateVolunteer = async () => {
            try {
                await update(makePayload(), form.value.id)
                notifySuccess('Voluntário atualizado com sucesso!')
                router.push({ name: listRoute })
            } catch (error) {
                handleErrors(error)
            }
        }

        const newVolunteer = async () => {
            try {
                await post(makePayload())
                notifySuccess('Voluntário criado com sucesso!')
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
                notifyError(error.response?.data?.message || 'Erro ao salvar voluntário!')
            }
        }

        const maskedPhone = computed({
            get () { return form.value.phone || '' },
            set (value) { form.value.phone = value ? phoneMask(value) : '' }
        })

        return {
            form,
            maskedPhone,
            isEditMode,
            onSubmit,
            headerProps,
            listRoute
        }
    }
})
</script>
