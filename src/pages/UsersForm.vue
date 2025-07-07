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
            <q-input
                outlined
                v-model="form.email"
                label="Email"
                lazy-rules
                class="col-md-6 col-xs-12"
                :rules="[ val => val && val.length > 0 || 'Campo Obrigatório!']"
            />
            <q-select
                label="Perfil"
                class="col-md-6 col-xs-12"
                outlined
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
                v-model="form.status"
                :options="activeInactive"
                option-label="name"
                emit-value
                map-options
                :rules="[val => !!val || 'Campo Obrigatório!']"
            />
            <q-input
                outlined
                label="Senha"
                v-model="form.password"
                lazy-rules
                class="col-md-6 col-xs-12"
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
                class="col-md-6 col-xs-12"
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
                    :to="{ name: 'users' }"
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
    title: '',
    btnIcon: 'format_list_numbered',
    btnName: 'Listar',
    btnTo: 'users'
}

export default defineComponent({
    name: 'UsersForm',
    components: { ViewHeader },
    props: {
        user: { type: Object, required: true}
    },
    setup () {
        const router = useRouter()
        const route = useRoute()
        const { post, getByID, update } = usersService()
        const { notifySuccess, notifyError } = notifications()

        const roles = ref([])
        const form = ref({
            isPwd: true,
            name: null,
            status: null,
            roles: [],
            email: null,
            password: null,
            password_confirm: null
        })

        const isEditMode = computed(() => !!route.params.id)
        headerProps.title = isEditMode.value ? 'Editar Usuário' : 'Cadastrar Usuário'

        const passwordRules = computed(() => [
            val => isEditMode.value || (val && val.length > 0) || 'Campo Obrigatório!',
            val => (isEditMode.value && !val) || val.length >= 6 || 'A senha deve ter pelo menos 6 caracteres'
        ])

        const passwordConfirmRules = computed(() => [
            val => {
                if (!isEditMode.value || form.value.password) {
                    return (val && val === form.value.password) || 'As senhas não coincidem'
                }
                return true
            }
        ])

        onMounted(async () => {
            if (route.params.id) {
                await getUser(route.params.id)
            }
            await getRoles()
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
                form.value = data.data
            } catch (error) {
                notifyError(error.response.data.message)
                router.push({ name: 'users' })
            }
        }

        const updateUser = async () => {
            try {
                await update(makePayload(), form.value.id)
                notifySuccess('Usuário atualizado com sucesso!')
                router.push({ name: 'users' })
            } catch (error) {
                console.log(error);
                Object.keys(error.response.data.errors).forEach(key => {
                    notifyError(error.response.data.errors[key])
                })
            }
        }

        const newUser = async () => {
            
            try {
                await post(makePayload())
                notifySuccess('Usuário criado com sucesso!')
                router.push({ name: 'users' })
            } catch (error) {                
                Object.keys(error.response.data.errors).forEach(key => {
                    notifyError(error.response.data.errors[key])
                })
            }
        }

        const makePayload = () => {                      
            const payload = {
                name: form.value.name,
                roles: form.value.roles,
                email: form.value.email,
                status: form.value.status.id
            }            
            if (form.value.password) { payload.password = form.value.password }
            return payload
        }

        const onSubmit = async () => {
            form.value.id ? updateUser() : newUser()
        }

        return {
            form,
            onSubmit,
            onReset () {
                form.value = {
                    isPwd: true,
                    name: null,
                    roles: [],
                    status: null,
                    email: null,
                    password: null,
                    password_confirm: null
                }
            },
            headerProps,
            passwordRules,
            passwordConfirmRules,
            roles,
            activeInactive
        }
    }
})
</script>
