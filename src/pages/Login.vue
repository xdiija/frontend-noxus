<template>
  <q-page class="flex flex-center">
    <q-card style="width: 300px; height: auto; display: flex; flex-direction: column; align-items: center;">
      <img src="../assets/noxusLogoGreen.png">
      <form @keydown.enter.prevent="onSubmit">
        <q-card-section class="q-pt-none full-width">
            <q-input
                filled
                v-model="login.email"
                label="Email"
                autocomplete="email"
            />
            <q-input
                class="q-mt-sm"
                v-model="login.password"
                filled
                label="Senha"
                :type="login.isPwd ? 'password' : 'text'"
                autocomplete="senha-atual"
            >
                <template v-slot:append>
                <q-icon
                    :name="login.isPwd ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="login.isPwd = !login.isPwd"
                />
                </template>
            </q-input>
        </q-card-section>
    </form>
      <q-card-actions class="full-width">
        <q-btn
            class="q-mx-sm"
            color="primary"
            label="Login"
            style="width: 100%"
            @click="onSubmit"
        />
      </q-card-actions>
      <q-card-actions class="full-width">
        <q-btn flat no-caps class="q-mx-sm" color="primary" label="Esqueci minha senha" @click="$router.push({ name: 'esqueciSenha' })" style="width: 100%"/>
      </q-card-actions>
    </q-card>

  </q-page>
</template>

<script>
import authService from 'src/services/authService'
import notifications from '../utils/notifications'

export default {
    name: 'LoginPage',
    data () {
        return {
            login: {
                email: 'djalma@example.com',
                password: '123456',
                isPwd: true
            }
        }
    },
    methods: {
        async onSubmit () {
            const { post, setToken, setUser, setMenus } = authService('login')
            const { notifyError } = notifications()
            const userCredentials = { email: this.login.email, password: this.login.password }
            try {
                const { data } = await post(userCredentials)       
                setToken(data.access_token, data.expires_in)
                setUser(data.user)
                setMenus(data.menus)
                this.$router.push({ name: 'home' })
            } catch (error) {                
                if(error.code == 'ERR_NETWORK'){
                    notifyError("Erro de conexão com o servidor. Tente novamente mais tarde.")
                }else if (error.response && error.response.status === 401) {
                    notifyError("Email ou senha incorretos.")
                } else {
                    console.error(error)
                    notifyError("Erro ao efetuar login. Tente novamente.")
                }
            }
        }
    }
}
</script>
