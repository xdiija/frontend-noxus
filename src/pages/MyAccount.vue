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
                readonly
                class="col-md-6 col-xs-12"
                :rules="[ val => val && val.length > 0 || 'Campo Obrigatório!']"
            />
            <q-input
                outlined
                v-model="form.email"
                label="Email"
                readonly
                lazy-rules
                class="col-md-6 col-xs-12"
                :rules="[ val => val && val.length > 0 || 'Campo Obrigatório!']"
            />
            <q-select
                label="Perfil"
                class="col-md-6 col-xs-12"
                outlined
                readonly
                v-model="form.roles"
                :options="roles"
                option-label="name"
                option-value="id"
                emit-value
                map-options
                multiple
                :rules="[val => !!val || 'Campo Obrigatório!']"
            />
            <q-select
                label="Status"
                class="col-md-6 col-xs-12"
                outlined
                readonly
                v-model="form.status"
                :options="activeInactive"
                option-label="name"
                emit-value
                map-options
                :rules="[val => !!val || 'Campo Obrigatório!']"
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
import { defineComponent, ref, onMounted, computed } from 'vue'
import usersService from 'src/services/usersService'
import rolesService from 'src/services/rolesService'
import { useRouter, useRoute } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import notifications from '../utils/notifications'
import { activeInactive } from 'src/constants/statusOptions';

const headerProps = {
    title: 'Minha Conta',
    btnIcon: 'format_list_numbered',
    btnTo: 'users'
}

export default defineComponent({
    name: 'UsersForm',
    components: { ViewHeader },
    props: {
        user: { type: Object, required: true}
    },

    
    setup (props) {
        const router = useRouter()
        const route = useRoute()
        const { getByID, update } = usersService()
        const { notifySuccess, notifyError } = notifications()

        const roles = ref([])
        const form = ref({
            isPwd: true,
            name: null,
            status: null,
            roles: [],
            email: null,
            old_password: null,
            password: null,
            password_confirm: null
        })

        const isEditMode = true;

        const passwordRules = computed(() => [
            val => isEditMode || (val && val.length > 0) || 'Campo Obrigatório!',
            val => (isEditMode && !val) || val.length >= 6 || 'A senha deve ter pelo menos 6 caracteres'
        ])

        const passwordConfirmRules = computed(() => [
            val => {
                if (!isEditMode || form.value.password) {
                    return (val && val === form.value.password) || 'As senhas não coincidem'
                }
                return true
            }
        ])

        onMounted(async () => {
            await getRoles()
            await getUser(props.user.id)

        })

        const getRoles = async () => {
            try {
                const { list } = rolesService()
                const { data } = await list("/getactive")
                roles.value = data.data
            } catch (error) {
                notifyError(error.response.data.message)
            }
        }

        const getUser = async (id) => {
            try {
                const { data } = await getByID(id)
                const userData = data.data;
                userData.roles = userData.roles.map(role => role.id)
                Object.assign(form.value, data.data)
            } catch (error) {
                notifyError(error.response.data.message)
                router.push({ name: 'users' })
            }
        }

        const updateUser = async () => {
            try {
                const idAndEndPoint = `${form.value.id}/change-password`;
                await update(makePayload(), idAndEndPoint)
                notifySuccess('Usuário atualizado com sucesso!')
                router.push({ name: 'users' })
            } catch (error) {
                console.log(error);
                Object.keys(error.response.data.errors).forEach(key => {
                    notifyError(error.response.data.errors[key])
                })
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
            passwordConfirmRules,
            roles,
            activeInactive
        }
    }
})
</script>
