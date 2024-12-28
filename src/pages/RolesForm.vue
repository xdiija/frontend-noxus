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
            @reset="onReset"
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

             <!-- Permissions Section -->
             <div class="col-lg-12 col-xs-12">
                <h6>Permissões</h6>
                <div v-for="menu in menus" :key="menu.id" class="q-mb-md">
                    <q-card class="q-pa-sm">
                        <div class="row items-center">
                            <span class="text-subtitle1">{{ menu.name }}</span>
                            <div class="q-pl-md">
                                <q-checkbox
                                    :label="'Visualizar'"
                                    :model-value="isPermissionChecked(menu.id, 'can_view')"
                                    @update:model-value="togglePermission(menu.id, 'can_view', $event)"
                                />
                                <q-checkbox
                                    :label="'Criar'"
                                    :model-value="isPermissionChecked(menu.id, 'can_create')"
                                    @update:model-value="togglePermission(menu.id, 'can_create', $event)"
                                />
                                <q-checkbox
                                    :label="'Atualizar'"
                                    :model-value="isPermissionChecked(menu.id, 'can_update')"
                                    @update:model-value="togglePermission(menu.id, 'can_update', $event)"
                                />
                            </div>
                        </div>

                        <!-- Render Child Menus -->
                        <div v-if="menu.children && menu.children.length > 0" class="q-pl-md">
                            <div v-for="child in menu.children" :key="child.id" class="q-mb-md">
                                <q-card class="q-pa-sm">
                                    <div class="row items-center">
                                        <span class="text-subtitle2">{{ child.name }}</span>
                                        <div class="q-pl-md">
                                            <q-checkbox
                                                :label="'Visualizar'"
                                                :model-value="isPermissionChecked(child.id, 'can_view')"
                                                @update:model-value="togglePermission(child.id, 'can_view', $event)"
                                            />
                                            <q-checkbox
                                                :label="'Criar'"
                                                :model-value="isPermissionChecked(child.id, 'can_create')"
                                                @update:model-value="togglePermission(child.id, 'can_create', $event)"
                                            />
                                            <q-checkbox
                                                :label="'Atualizar'"
                                                :model-value="isPermissionChecked(child.id, 'can_update')"
                                                @update:model-value="togglePermission(child.id, 'can_update', $event)"
                                            />
                                        </div>
                                    </div>
                                </q-card>
                            </div>
                        </div>
                    </q-card>
                </div>
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
                    :to="{ name: 'roles' }"
                    outline
                />
            </div>
        </q-form>
    </div>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from 'vue'
import rolesService from 'src/services/rolesService'
import menusService from 'src/services/menusService'
import { useRouter, useRoute } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import notifications from '../utils/notifications'
import { activeInactive } from 'src/constants/statusOptions';

const headerProps = {
    title: '',
    btnIcon: 'format_list_numbered',
    btnName: 'Listar',
    btnTo: 'roles'
}

export default defineComponent({
    name: 'RolesForm',
    components: { ViewHeader },
    props: {
        user: { type: Object, required: true }
    },
    setup () {
        const router = useRouter()
        const route = useRoute()
        const { post, getByID, update } = rolesService()
        const { notifySuccess, notifyError } = notifications()

        const menus = ref([])
        const form = ref({
            name: null,
            status: null,
            permissions: []
        })

        const isEditMode = computed(() => !!route.params.id)
        headerProps.title = isEditMode.value ? 'Editar Perfil' : 'Cadastrar Perfil'

        onMounted(async () => {
            if (route.params.id) {
                await getRole(route.params.id)
            }
            await getMenus()
        })

        const onSubmit = async () => {
            form.value.id ? updateRole() : newRole()
        }

        const togglePermission = (menuId, permission, isChecked) => {    
                    
            if (isChecked) {
                addPermission(menuId, permission)
                const menu = menus.value.find(m => m.id === menuId);
                if (menu) {
                    menu.children.forEach(child => {
                        addPermission(child.id, permission)
                    });
                } else {
                    const parent = findParentByChildId(menuId)
                    addPermission(parent.id, permission)
                }
                
            } else {
                removePermission(menuId, permission)
                const menu = menus.value.find(m => m.id === menuId);
                if (menu) {
                    menu.children.forEach(child => {
                        removePermission(child.id, permission)
                    });
                } else {
                    const parent = findParentByChildId(menuId)
                    if(! hasPermissionForChildMenus(parent.children, permission)){
                        removePermission(parent.id, permission) 
                    }
                }

            }
        };

        const isPermissionOnArray = (menuId, permission) => {
            return form.value.permissions.some(
                    perm => perm.menu_id === menuId && perm.permission === permission
                )
        }

        function hasPermissionForChildMenus(menus, permission) {
            return menus.some(menu => 
                form.value.permissions.some(p => p.menu_id === menu.id && p.permission === permission)
            );
        }

        const isPermissionChecked = (menuId, permission) => {
            return (
                form.value.permissions.some(
                    (perm) => perm.menu_id === menuId && perm.permission === permission
                )
            );
        };

        const addPermission = (menuId, permission) => {
            if ( !isPermissionOnArray(menuId, permission)) {
                form.value.permissions.push({ menu_id: menuId, permission });
            }
            if (permission != 'can_view' && !isPermissionOnArray(menuId, 'can_view')) {
                form.value.permissions.push({ menu_id: menuId, permission: 'can_view' });
            }
        };

        const removePermission = (menuId, permission) => {
           form.value.permissions = form.value.permissions.filter(
                perm => !(perm.menu_id === menuId && perm.permission === permission)
            );
            
            if (permission === 'can_view') {
                
                form.value.permissions = form.value.permissions.filter(
                    perm => perm.menu_id !== menuId || (perm.permission !== 'can_create' && perm.permission !== 'can_update')
                );
            }
        };

        const findParentByChildId = (childId) => {
            const data = menus.value;
            for (let item of data) {
                const child = item.children.find(child => child.id === childId);
                if (child) {
                    return item;
                }
            }
            return null;
        };

        const permissionsToFrontend = (backendPermissions) => {
            return backendPermissions.flatMap(permission => {
                return ['can_view', 'can_create', 'can_update']
                    .filter(key => permission[key] === 1)
                    .map(key => ({ menu_id: permission.menu_id, permission: key }));
            });
        };

        const permissionsToBackend = (frontendPermissions) => {
            const groupedPermissions = {};
            frontendPermissions.forEach(({ menu_id, permission }) => {
                if (!groupedPermissions[menu_id]) {
                    groupedPermissions[menu_id] = { menu_id, can_view: 0, can_create: 0, can_update: 0 };
                }
                groupedPermissions[menu_id][permission] = 1;
            });
            return Object.values(groupedPermissions);
        };

        const getMenus = async () => {
            try {
                const { list } = menusService()
                const { data } = await list("/getactive")
                menus.value = data.data
            } catch (error) {
                notifyError(error.response.data.message)
            }
        }

        const getRole = async (id) => {
            try {
                const { data } = await getByID(id, "?show_permissions=1")
                const roleData = data.data;
                form.value = {
                    ...roleData,
                    permissions: permissionsToFrontend(roleData.permissions || []),
                };                
            } catch (error) {
                notifyError(error.response.data.message)
                router.push({ name: 'roles' })
            }
        }

        const updateRole = async () => {
            try {
                await update(makePayload(), form.value.id)
                notifySuccess('Perfil atualizado com sucesso!')
                router.push({ name: 'roles' })
            } catch (error) {
                Object.keys(error.response.data.errors).forEach(key => {
                    notifyError(error.response.data.errors[key])
                })
            }
        }

        const newRole = async () => {
            try {
                await post(makePayload())
                notifySuccess('Perfil criado com sucesso!')
                router.push({ name: 'roles' })
            } catch (error) {
                Object.keys(error.response.data.errors).forEach(key => {
                    notifyError(error.response.data.errors[key])
                })
            }
        }

        const makePayload = () => {    
            const payload = {
                name: form.value.name,
                status: form.value.status.id,
                permissions: permissionsToBackend(form.value.permissions),
            }
            return payload        
        }

        return {
            form,
            onSubmit,
            onReset () {
                form.value = {
                    name: null,
                    status: null,
                    permissions: []
                }
            },
            headerProps,
            menus,
            activeInactive,
            isPermissionChecked,
            togglePermission,
            isPermissionOnArray,
            findParentByChildId,
            addPermission,
            removePermission,
            hasPermissionForChildMenus,
            permissionsToFrontend,
            permissionsToBackend
        }
    }
})
</script>
