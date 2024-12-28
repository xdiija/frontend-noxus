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
                class="col-md-4 col-xs-12"
                :rules="[ val => val && val.length > 0 || 'Campo Obrigatório!']"
            />
            <q-select
                label="Menu Pai"
                class="col-md-4 col-xs-12"
                outlined
                v-model="form.parent"
                :options="parentMenus"
                option-label="name"
                emit-value
                map-options
                :rules="[val => !!val || 'Campo Obrigatório!']"
                @update:model-value="onParentChange"
                :readonly="isParentReadonly"
            />
            <q-input
                outlined
                v-model="form.route"
                label="Rota"
                lazy-rules
                class="col-md-4 col-xs-12"
                :rules="routeRules"
                :readonly="isRouteReadonly"
            />
            <q-input
                outlined
                v-model="form.icon"
                label="Ícone"
                lazy-rules
                class="col-md-4 col-xs-12"
                :rules="[ val => val && val.length > 0 || 'Campo Obrigatório!']"
            />
            <q-input
                outlined
                v-model="form.order"
                label="Ordem"
                lazy-rules
                class="col-md-4 col-xs-12"
                :rules="[val => /^[0-9]*$/.test(val) || 'Apenas números são permitidos!', val => val && val.length > 0 || 'Campo Obrigatório!']"
                type="number"
            >
                <template v-slot:prepend>
                    <q-tooltip>Digite apenas números para definir a ordem</q-tooltip>
                    <q-icon name="info" />
                </template>
            </q-input>
            <q-select
                label="Status"
                class="col-md-4 col-xs-12"
                outlined
                v-model="form.status"
                :options="activeInactive"
                option-label="name"
                emit-value
                map-options
                :rules="[val => !!val || 'Campo Obrigatório!']"
            />
            <q-checkbox
                v-model="form.exclusive_noxus"
                label="Exclusivo Noxus"
                class="col-md-4 col-xs-12"
                :true-value="true"
                :false-value="false"
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
                    :to="{ name: listRoute }"
                    outline
                />
            </div>
        </q-form>
    </div>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from 'vue'
import menusService from 'src/services/menusService'
import { useRouter, useRoute } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import notifications from '../utils/notifications'
import { activeInactive } from 'src/constants/statusOptions';

const listRoute = 'menus';
const headerProps = {
    title: '',
    btnIcon: 'format_list_numbered',
    btnName: 'Listar',
    btnTo: listRoute
}

export default defineComponent({
    name: 'MenusForm',
    components: { ViewHeader },
    props: {
        user: { type: Object, required: true }
    },
    setup () {
        const router = useRouter()
        const route = useRoute()
        const { list, post, getByID, update } = menusService()
        const { notifySuccess, notifyError } = notifications()

        const parentMenus = ref([])
        const form = ref({
            name: null,
            parent: null,
            route: "",
            exclusive_noxus: false,
            status: null
        })

        const isEditMode = computed(() => !!route.params.id)
        headerProps.title = isEditMode.value ? 'Editar Menu' : 'Cadastrar Menu'

        const isRouteReadonly = ref(true);
        const isParentReadonly = ref(false);
        const routeRules = ref([]);

        onMounted(async () => {
            if (route.params.id) {
                await getMenu(route.params.id)
            }
            await getParentMenus()
        })

        const onSubmit = async () => {
            form.value.id ? updateMenu() : newMenu()
        }

        const onParentChange = (value) => {
            if (value.id === null) {
                form.value.route = "";
                isRouteReadonly.value = true;
                routeRules.value = [];
            } else {
                isRouteReadonly.value = false;
                routeRules.value = [val => val && val.length > 0 || "Campo Obrigatório!"];
            }
        };

        const getParentMenus = async () => {
            try {
                const { data } = await list("/getactive")
                parentMenus.value = data.data
                parentMenus.value = [{ id: null, name: "Nenhum" }, ...data.data];
                if (!isEditMode.value) {
                    form.value.parent = "Nenhum";
                }                
            } catch (error) {
                notifyError(error.response.data.message)
            }
        }

        const getMenu = async (id) => {
            try {
                const { data } = await getByID(id)
                const menuData = data.data;                
                form.value = {
                    ...menuData,
                    order: menuData.order.toString()
                };
                
                if (!menuData.parent) {
                    isRouteReadonly.value = true;
                    isParentReadonly.value = true;
                    form.value.parent = "Nenhum";
                }                        
            } catch (error) {
                notifyError(error.response.data.message)
                router.push({ name: listRoute })
            }
        }

        const updateMenu = async () => {
            try {
                await update(makePayload(), form.value.id)
                notifySuccess('Menu atualizado com sucesso!')
                router.push({ name: listRoute })
            } catch (error) {
                Object.keys(error.response.data.errors).forEach(key => {
                    notifyError(error.response.data.errors[key])
                })
            }
        }

        const newMenu = async () => {
            try {
                await post(makePayload())
                notifySuccess('Menu criado com sucesso!')
                router.push({ name: listRoute })
            } catch (error) {
                Object.keys(error.response.data.errors).forEach(key => {
                    notifyError(error.response.data.errors[key])
                })
            }
        }

        const makePayload = () => {    
            const payload = {
                name: form.value.name,
                parent_id: form.value.parent.id ?? null,
                route: form.value.route,
                icon: form.value.icon,
                order: form.value.order,
                exclusive_noxus: form.value.exclusive_noxus,
                status: form.value.status.id
            }
            return payload        
        }

        return {
            form,
            onSubmit,
            onReset () {
                form.value = {
                    name: null,
                    status: null
                }
            },
            headerProps,
            activeInactive,
            parentMenus,
            isRouteReadonly,
            isParentReadonly,
            routeRules,
            listRoute,
            onParentChange
        }
    }
})
</script>
