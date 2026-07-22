<template>
    <div class="q-pa-md">
    <ViewHeader :title="headerProps.title" />
        <q-form
            @submit="onSubmit"
            class="row q-col-gutter-sm"
        >
            <q-input
                outlined
                v-model="form.name"
                label="Nome"
                readonly
                class="col-md-4 col-xs-12"
            />
            <q-input
                outlined
                v-model="form.email"
                label="Email"
                readonly
                class="col-md-4 col-xs-12"
            />
            <q-input
                outlined
                v-model="form.role"
                label="Perfil"
                readonly
                class="col-md-4 col-xs-12"
            />
            <q-input
                outlined
                label="Senha Antiga"
                v-model="form.old_password"
                lazy-rules
                :rules="[val => !!val || 'Campo Obrigatório!']"
                class="col-md-4 col-xs-12"
                :type="form.isPwd ? 'password' : 'text'"
                autocomplete="senha-antiga"
            >
                <template v-slot:append>
                    <q-icon
                        :name="form.isPwd ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="form.isPwd = !form.isPwd"
                    />
                </template>
            </q-input>
            <q-input
                outlined
                label="Senha"
                v-model="form.password"
                lazy-rules
                class="col-md-4 col-xs-12"
                :type="form.isPwd ? 'password' : 'text'"
                autocomplete="nova-senha"
                :rules="passwordRules"
            >
                <template v-slot:append>
                    <q-icon
                        :name="form.isPwd ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="form.isPwd = !form.isPwd"
                    />
                </template>
            </q-input>
            <q-input
                outlined
                label="Confirmação de Senha"
                v-model="form.password_confirm"
                lazy-rules
                class="col-md-4 col-xs-12"
                :type="form.isPwd ? 'password' : 'text'"
                autocomplete="nova-senha"
                :rules="passwordConfirmRules"
            >
                <template v-slot:append>
                    <q-icon
                        :name="form.isPwd ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="form.isPwd = !form.isPwd"
                    />
                </template>
            </q-input>
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
                    :to="{ name: 'home' }"
                    outline
                />
            </div>
        </q-form>
    </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import usersService from 'src/services/usersService'
import { useRouter } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import notifications from '../utils/notifications'

const headerProps = {
    title: 'Minha Conta'
}

export default defineComponent({
    name: 'MyAccount',
    components: { ViewHeader },
    props: {
        user: { type: Object, required: true }
    },

    setup (props) {
        const router = useRouter()
        const { update } = usersService()
        const { notifySuccess, notifyError } = notifications()

        const form = ref({
            isPwd: true,
            name: null,
            role: null,
            email: null,
            old_password: null,
            password: null,
            password_confirm: null
        })

        const passwordRules = [
            val => !!val || 'Campo Obrigatório!',
            val => val.length >= 6 || 'A senha deve ter pelo menos 6 caracteres'
        ]

        const passwordConfirmRules = [
            val => (val && val === form.value.password) || 'As senhas não coincidem'
        ]

        // Profile data comes from the auth/me payload passed down by
        // MainLayout — no users,view permission is required for this page.
        onMounted(() => {
            form.value.name = props.user.name
            form.value.email = props.user.email
            form.value.role = props.user.role?.name ?? ''
        })

        const updateUser = async () => {
            try {
                const idAndEndPoint = `${props.user.id}/change-password`
                await update(makePayload(), idAndEndPoint)
                notifySuccess('Senha alterada com sucesso!')
                router.push({ name: 'home' })
            } catch (error) {
                const errors = error.response?.data?.errors
                if (errors) Object.keys(errors).forEach(key => notifyError(errors[key]))
                else notifyError(error.response?.data?.message || 'Erro ao alterar a senha!')
            }
        }

        const makePayload = () => {
            const payload = {
                old_password: form.value.old_password,
                new_password: form.value.password
            }
            return payload
        }

        const onSubmit = async () => {
            updateUser()
        }

        return {
            form,
            onSubmit,
            headerProps,
            passwordRules,
            passwordConfirmRules
        }
    }
})
</script>
