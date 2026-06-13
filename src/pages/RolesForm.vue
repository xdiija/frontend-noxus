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
                emit-value
                map-options
                :rules="[val => !!val || 'Campo Obrigatório!']"
            />

             <!-- Permissions Section -->
             <div class="col-lg-12 col-xs-12">
                <h6>Permissões</h6>
                <div v-for="menu in menus" :key="menu.id" class="q-mb-md">
                    <q-card class="q-pa-sm">
                        <!-- Container menu: header only. Permissions live on its children. -->
                        <template v-if="menu.children && menu.children.length > 0">
                            <div class="row items-center q-pl-lg">
                                <span class="text-subtitle1 permission-label text-weight-bold">{{ menu.name }}</span>
                                <div class="q-pl-md">
                                    <q-checkbox
                                        class="text-weight-bold"
                                        :label="'Visualizar'"
                                        :model-value="parentPermissionState(menu, 'can_view')"
                                        :toggle-indeterminate="false"
                                        @update:model-value="toggleParentPermission(menu, 'can_view', $event)"
                                    />
                                    <q-checkbox
                                        class="text-weight-bold"
                                        :label="'Criar'"
                                        :model-value="parentPermissionState(menu, 'can_create')"
                                        :toggle-indeterminate="false"
                                        @update:model-value="toggleParentPermission(menu, 'can_create', $event)"
                                    />
                                    <q-checkbox
                                        class="text-weight-bold"
                                        :label="'Atualizar'"
                                        :model-value="parentPermissionState(menu, 'can_update')"
                                        :toggle-indeterminate="false"
                                        @update:model-value="toggleParentPermission(menu, 'can_update', $event)"
                                    />
                                </div>
                            </div>
                            <div class="q-pl-md">
                                <div v-for="child in menu.children" :key="child.id" class="q-mb-md">
                                    <q-card class="q-pa-sm">
                                        <div class="row items-center">
                                            <span class="text-subtitle2 permission-label text-weight-regular">{{ child.name }}</span>
                                            <div class="q-pl-md">
                                                <q-checkbox
                                                    class="text-weight-regular"
                                                    :label="'Visualizar'"
                                                    :model-value="isPermissionChecked(child.id, 'can_view')"
                                                    @update:model-value="togglePermission(child.id, 'can_view', $event)"
                                                />
                                                <q-checkbox
                                                    class="text-weight-regular"
                                                    :label="'Criar'"
                                                    :model-value="isPermissionChecked(child.id, 'can_create')"
                                                    @update:model-value="togglePermission(child.id, 'can_create', $event)"
                                                />
                                                <q-checkbox
                                                    class="text-weight-regular"
                                                    :label="'Atualizar'"
                                                    :model-value="isPermissionChecked(child.id, 'can_update')"
                                                    @update:model-value="togglePermission(child.id, 'can_update', $event)"
                                                />
                                            </div>
                                        </div>
                                    </q-card>
                                </div>
                            </div>
                        </template>

                        <!-- Leaf top-level menu: it is itself a permission unit. -->
                        <div v-else class="row items-center">
                            <span class="text-subtitle1 permission-label">{{ menu.name }}</span>
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
import { activeInactive, STATUS } from 'src/constants/statusOptions';

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
            status: STATUS.ACTIVE,
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
            if (form.value.permissions.length === 0) {
                notifyError('Selecione ao menos uma permissão!')
                return
            }
            form.value.id ? updateRole() : newRole()
        }

        // Only leaf menus are permission units now, so toggling is a flat add/remove —
        // no parent/child cascade. Container visibility is derived server-side from children.
        const togglePermission = (menuId, permission, isChecked) => {
            if (isChecked) {
                addPermission(menuId, permission)
            } else {
                removePermission(menuId, permission)
            }
        };

        // Parent-level checkboxes drive every child at once. State is derived from the
        // children: all checked -> true, some checked -> null (indeterminate), none -> false.
        const parentPermissionState = (menu, permission) => {
            const checkedCount = menu.children.filter(
                child => isPermissionChecked(child.id, permission)
            ).length

            if (checkedCount === 0) return false
            if (checkedCount === menu.children.length) return true
            return null
        };

        const toggleParentPermission = (menu, permission, isChecked) => {
            menu.children.forEach(
                child => togglePermission(child.id, permission, isChecked)
            )
        };

        const isPermissionOnArray = (menuId, permission) => {
            return form.value.permissions.some(
                    perm => perm.menu_id === menuId && perm.permission === permission
                )
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
                    status: roleData.status?.id,
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
                status: form.value.status,
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
                    status: STATUS.ACTIVE,
                    permissions: []
                }
            },
            headerProps,
            menus,
            activeInactive,
            isPermissionChecked,
            togglePermission,
            parentPermissionState,
            toggleParentPermission,
            isPermissionOnArray,
            addPermission,
            removePermission,
            permissionsToFrontend,
            permissionsToBackend
        }
    }
})
</script>

<style scoped>
.permission-label {
    display: inline-block;
    width: 180px;
    flex-shrink: 0;
}
</style>
