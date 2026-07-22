<template>
    <div class="q-pa-md">
        <ViewHeader
            :title="headerProps.title"
            :btnTo="headerProps.btnTo"
            :btnIcon="headerProps.btnIcon"
            :btnName="headerProps.btnName"
        />
        <!-- Current location (Module 8): open kennel stay or open foster stay. -->
        <q-banner v-if="currentLocation" dense rounded class="bg-blue-1 text-primary q-mb-sm">
            <template v-slot:avatar>
                <q-icon :name="currentLocation.icon" />
            </template>
            {{ currentLocation.label }}
        </q-banner>
        <q-form @submit="onSubmit" class="row q-col-gutter-sm">
            <q-input
                outlined
                v-model="form.name"
                label="Nome"
                lazy-rules
                class="col-md-4 col-xs-12"
                :rules="[ val => val && val.length > 1 || 'Campo Obrigatório!']"
            />

            <q-select
                outlined
                v-model="form.species_id"
                :options="speciesOptions"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                label="Espécie"
                class="col-md-4 col-xs-12"
                :rules="[ val => !!val || 'Campo Obrigatório!']"
                @update:model-value="onSpeciesChange"
            />

            <q-select
                outlined
                v-model="form.breed_id"
                :options="breedOptions"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                clearable
                label="Raça (Opcional)"
                class="col-md-4 col-xs-12"
            />

            <q-select
                outlined
                v-model="form.sex"
                :options="sexOptions"
                emit-value
                map-options
                clearable
                label="Sexo"
                class="col-md-2 col-xs-12"
            />

            <q-select
                outlined
                v-model="form.size_id"
                :options="sizeOptions"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                label="Porte"
                class="col-md-2 col-xs-12"
                :rules="[ val => !!val || 'Campo Obrigatório!']"
            />

            <q-input
                outlined
                v-model="form.color"
                label="Cor (Opcional)"
                class="col-md-4 col-xs-12"
            />

            <q-select
                outlined
                v-model="form.status_id"
                :options="statusOptions"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                label="Status"
                class="col-md-4 col-xs-12"
                :rules="[ val => !!val || 'Campo Obrigatório!']"
            />

            <q-input
                outlined
                v-model="form.estimated_birth_date"
                label="Data de nascimento (estimada)"
                mask="##/##/####"
                placeholder="dd/mm/aaaa"
                class="col-md-4 col-xs-12"
            >
                <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                            <q-date v-model="form.estimated_birth_date" mask="DD/MM/YYYY">
                                <div class="row items-center justify-end">
                                    <q-btn v-close-popup label="Fechar" color="primary" flat />
                                </div>
                            </q-date>
                        </q-popup-proxy>
                    </q-icon>
                </template>
            </q-input>

            <div class="col-md-2 col-xs-12 flex items-center self-start" style="height: 56px">
                <q-toggle v-model="form.birth_date_is_estimated" label="Data estimada" />
            </div>

            <div class="col-md-2 col-xs-12 flex items-center self-start" style="height: 56px">
                <q-toggle v-model="form.neutered" label="Castrado" />
            </div>

            <q-input
                v-if="form.neutered"
                outlined
                v-model="form.neuter_date"
                label="Data de castração"
                mask="##/##/####"
                placeholder="dd/mm/aaaa"
                class="col-md-4 col-xs-12"
                :rules="[ val => !!val || 'Informe a data de castração']"
            >
                <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                            <q-date v-model="form.neuter_date" mask="DD/MM/YYYY">
                                <div class="row items-center justify-end">
                                    <q-btn v-close-popup label="Fechar" color="primary" flat />
                                </div>
                            </q-date>
                        </q-popup-proxy>
                    </q-icon>
                </template>
            </q-input>

            <q-select
                outlined
                v-model="form.tags"
                :options="tagOptions"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                multiple
                use-chips
                label="Etiquetas (Opcional)"
                class="col-md-8 col-xs-12"
            />

            <q-input
                outlined
                v-model="form.microchip"
                label="Microchip (Opcional)"
                class="col-md-4 col-xs-12"
            />

            <q-input
                outlined
                type="textarea"
                v-model="form.notes"
                label="Observações (Opcional)"
                class="col-xs-12"
            />

            <!-- Intake / rescue (optional, 1:1) -->
            <q-expansion-item
                class="col-xs-12 q-mt-sm"
                icon="fire_truck"
                label="Dados do resgate (Opcional)"
                :default-opened="hasRescue"
            >
                <div class="row q-col-gutter-sm q-pt-sm">
                    <q-input
                        outlined
                        v-model="form.rescue.rescue_date"
                        label="Data do resgate"
                        mask="##/##/#### ##:##"
                        placeholder="dd/mm/aaaa hh:mm"
                        class="col-md-4 col-xs-12"
                    >
                        <template v-slot:prepend>
                            <q-icon name="event" class="cursor-pointer">
                                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                    <q-date v-model="form.rescue.rescue_date" mask="DD/MM/YYYY HH:mm">
                                        <div class="row items-center justify-end">
                                            <q-btn v-close-popup label="Fechar" color="primary" flat />
                                        </div>
                                    </q-date>
                                </q-popup-proxy>
                            </q-icon>
                        </template>
                        <template v-slot:append>
                            <q-icon name="access_time" class="cursor-pointer">
                                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                    <q-time v-model="form.rescue.rescue_date" mask="DD/MM/YYYY HH:mm" format24h>
                                        <div class="row items-center justify-end">
                                            <q-btn v-close-popup label="Fechar" color="primary" flat />
                                        </div>
                                    </q-time>
                                </q-popup-proxy>
                            </q-icon>
                        </template>
                    </q-input>
                    <q-input
                        outlined
                        v-model="form.rescue.location"
                        label="Local"
                        class="col-md-4 col-xs-12"
                    />
                    <q-input
                        outlined
                        v-model="form.rescue.rescued_by"
                        label="Resgatado por"
                        class="col-md-4 col-xs-12"
                    />
                    <q-input
                        outlined
                        v-model="form.rescue.condition"
                        label="Condição no resgate"
                        class="col-md-4 col-xs-12"
                    />
                    <q-input
                        outlined
                        type="textarea"
                        v-model="form.rescue.description"
                        label="Descrição"
                        class="col-md-8 col-xs-12"
                    />
                </div>
            </q-expansion-item>

            <!-- Photos — only in edit mode (upload needs a saved animal id) -->
            <q-card v-if="isEditMode" flat bordered class="col-xs-12 q-mt-sm">
                <q-card-section>
                    <div class="text-subtitle1 q-mb-sm">Fotos</div>
                    <div class="row q-col-gutter-sm">
                        <div v-for="img in images" :key="img.id" class="col-auto">
                            <div class="relative-position">
                                <q-img
                                    :src="img.url"
                                    width="120px"
                                    height="120px"
                                    class="rounded-borders cursor-pointer"
                                    @click="openPreview(img.url)"
                                >
                                    <div class="absolute-full flex flex-center text-white non-selectable image-hover">
                                        <q-icon name="zoom_in" size="sm" />
                                    </div>
                                    <q-tooltip>Clique para ampliar</q-tooltip>
                                </q-img>
                                <q-btn
                                    round dense size="sm" color="negative" icon="close"
                                    class="absolute-top-right q-ma-xs"
                                    @click="removeImage(img.id)"
                                >
                                    <q-tooltip>Remover</q-tooltip>
                                </q-btn>
                            </div>
                        </div>
                        <div v-if="!images.length" class="col-12 text-grey q-py-sm">
                            Nenhuma foto cadastrada.
                        </div>
                    </div>
                    <q-file
                        outlined
                        dense
                        v-model="newImage"
                        label="Adicionar foto"
                        accept="image/*"
                        class="q-mt-sm"
                        style="max-width: 320px"
                        :loading="uploadingImage"
                        @update:model-value="uploadImage"
                    >
                        <template v-slot:prepend>
                            <q-icon name="add_a_photo" />
                        </template>
                    </q-file>
                </q-card-section>
            </q-card>

            <!-- Health (Module 4) — only in edit mode (records need a saved animal id) -->
            <AnimalHealthSection
                v-if="isEditMode"
                :animal-id="$route.params.id"
                @castration="onCastration"
            />

            <!-- Status history — only in edit mode (log needs a saved animal id) -->
            <AnimalStatusHistorySection
                v-if="isEditMode"
                :animal-id="$route.params.id"
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

        <!-- Fullscreen image viewer (click backdrop / close / ESC to dismiss) -->
        <q-dialog v-model="preview.show" maximized>
            <div
                class="column flex-center bg-black"
                style="cursor: zoom-out"
                @click="preview.show = false"
            >
                <img
                    :src="preview.url"
                    style="max-width: 95vw; max-height: 95vh; object-fit: contain"
                >
                <q-btn
                    round dense icon="close"
                    color="white" text-color="black"
                    class="absolute-top-right q-ma-md"
                    @click="preview.show = false"
                />
            </div>
        </q-dialog>
    </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import animalsService from 'src/services/animalsService'
import animalImagesService from 'src/services/animalImagesService'
import { useQuasar } from 'quasar'
import { useRouter, useRoute } from 'vue-router'
import ViewHeader from 'components/ViewHeader.vue'
import AnimalHealthSection from 'components/AnimalHealthSection.vue'
import AnimalStatusHistorySection from 'components/AnimalStatusHistorySection.vue'
import notifications from '../utils/notifications'

const listRoute = 'animals'

const headerProps = {
    title: '',
    btnIcon: 'format_list_numbered',
    btnName: 'Listar',
    btnTo: listRoute
}

// The form holds dates in BR display format (matching the API read format and
// the q-date/q-time masks below); these convert to the DB format the API expects.

// dd/mm/yyyy -> yyyy-mm-dd
const brDateToDb = (value) => {
    if (!value) return null
    const [d, m, y] = value.split('/')
    return (d && m && y) ? `${y}-${m}-${d}` : null
}

// dd/mm/yyyy HH:mm[:ss] -> yyyy-mm-dd HH:mm
const brDateTimeToDb = (value) => {
    if (!value) return null
    const [datePart, timePart = '00:00'] = value.split(' ')
    const db = brDateToDb(datePart)
    if (!db) return null
    const [hh = '00', mm = '00'] = timePart.split(':')
    return `${db} ${hh}:${mm}`
}

// Drop seconds for the picker mask: dd/mm/yyyy HH:mm:ss -> dd/mm/yyyy HH:mm
const trimSeconds = (value) => {
    if (!value) return ''
    const [datePart, timePart = ''] = value.split(' ')
    const [hh = '00', mm = '00'] = timePart.split(':')
    return `${datePart} ${hh}:${mm}`
}

const emptyRescue = () => ({
    rescue_date: '',
    location: '',
    rescued_by: '',
    condition: '',
    description: ''
})

export default defineComponent({
    name: 'AnimalsForm',
    components: { ViewHeader, AnimalHealthSection, AnimalStatusHistorySection },
    setup () {
        const $q = useQuasar()
        const router = useRouter()
        const route = useRoute()
        const { post, getByID, update, getFormOptions } = animalsService()
        const { upload: uploadImageApi, destroy: destroyImageApi } = animalImagesService()
        const { notifySuccess, notifyError } = notifications()

        const form = ref({
            name: '',
            species_id: null,
            breed_id: null,
            sex: null,
            estimated_birth_date: '',
            birth_date_is_estimated: true,
            size_id: null,
            color: '',
            microchip: '',
            neutered: false,
            neuter_date: '',
            status_id: null,
            notes: '',
            tags: [],
            rescue: emptyRescue()
        })

        const speciesOptions = ref([])
        const allBreeds = ref([])
        // Breeds come bundled in form-options with their species_id; the
        // cascade is just a client-side filter.
        const breedOptions = computed(() =>
            allBreeds.value.filter(b => b.species_id === form.value.species_id)
        )
        const sizeOptions = ref([])
        const statusOptions = ref([])
        const tagOptions = ref([])
        const sexOptions = [
            { label: 'Macho', value: 'M' },
            { label: 'Fêmea', value: 'F' }
        ]

        const images = ref([])
        const newImage = ref(null)
        const uploadingImage = ref(false)
        const preview = ref({ show: false, url: '' })

        const openPreview = (url) => {
            preview.value = { show: true, url }
        }

        const isEditMode = computed(() => !!route.params.id)
        const hasRescue = ref(false)
        // { icon, label } for the location banner; null when no open stay.
        const currentLocation = ref(null)
        headerProps.title = isEditMode.value ? 'Editar Animal' : 'Cadastrar Animal'

        onMounted(async () => {
            await getOptions()
            if (route.params.id) {
                await getAnimal(route.params.id)
            }
        })

        // All the global lookups come from /animals/form-options (animals
        // permission), so the form doesn't depend on the per-lookup grants.
        const getOptions = async () => {
            const { data } = await getFormOptions()
            speciesOptions.value = data.data.species
            allBreeds.value = data.data.breeds
            sizeOptions.value = data.data.sizes
            statusOptions.value = data.data.statuses
            tagOptions.value = data.data.tags
        }

        const onSpeciesChange = () => {
            form.value.breed_id = null
        }

        const getAnimal = async (id) => {
            try {
                const { data } = await getByID(id)
                const animal = data.data

                form.value = {
                    id: animal.id,
                    name: animal.name,
                    species_id: animal.species?.id ?? null,
                    breed_id: animal.breed?.id ?? null,
                    sex: animal.sex ?? null,
                    estimated_birth_date: animal.estimated_birth_date ?? '',
                    birth_date_is_estimated: animal.birth_date_is_estimated,
                    size_id: animal.size?.id ?? null,
                    color: animal.color ?? '',
                    microchip: animal.microchip ?? '',
                    neutered: animal.neutered,
                    neuter_date: animal.neuter_date ?? '',
                    status_id: animal.status?.id ?? null,
                    notes: animal.notes ?? '',
                    tags: (animal.tags || []).map(t => t.id),
                    rescue: animal.rescue
                        ? {
                            rescue_date: trimSeconds(animal.rescue.rescue_date),
                            location: animal.rescue.location ?? '',
                            rescued_by: animal.rescue.rescued_by ?? '',
                            condition: animal.rescue.condition ?? '',
                            description: animal.rescue.description ?? ''
                        }
                        : emptyRescue()
                }
                hasRescue.value = !!animal.rescue
                images.value = animal.images || []
                currentLocation.value = animal.current_kennel
                    ? { icon: 'fence', label: `Localização atual: Canil ${animal.current_kennel.name}` }
                    : animal.current_foster_home
                        ? { icon: 'night_shelter', label: `Localização atual: Lar temporário de ${animal.current_foster_home.responsible_name}` }
                        : null
            } catch (error) {
                notifyError(error.response?.data?.message || 'Erro ao carregar animal!')
                router.push({ name: listRoute })
            }
        }

        const uploadImage = async (file) => {
            if (!file) return
            uploadingImage.value = true
            try {
                const { data } = await uploadImageApi(route.params.id, file)
                images.value.unshift(data.data)
                notifySuccess('Foto adicionada!')
            } catch (error) {
                handleErrors(error)
            } finally {
                uploadingImage.value = false
                newImage.value = null
            }
        }

        // A castration surgery marks the animal as neutered server-side; mirror
        // it locally so the form doesn't overwrite it back on save.
        const onCastration = (surgeryDate) => {
            form.value.neutered = true
            form.value.neuter_date = surgeryDate
        }

        const removeImage = (imageId) => {
            $q.dialog({
                title: 'Confirmação',
                message: 'Deseja remover esta foto?',
                cancel: { label: 'Cancelar', color: 'primary', outline: true },
                ok: { label: 'Confirmar', color: 'primary' },
                persistent: true
            }).onOk(async () => {
                try {
                    await destroyImageApi(route.params.id, imageId)
                    images.value = images.value.filter(img => img.id !== imageId)
                    notifySuccess('Foto removida!')
                } catch (error) {
                    notifyError('Erro ao remover foto.')
                }
            })
        }

        const makePayload = () => {
            const payload = {
                name: form.value.name,
                species_id: form.value.species_id,
                breed_id: form.value.breed_id,
                sex: form.value.sex,
                estimated_birth_date: brDateToDb(form.value.estimated_birth_date),
                birth_date_is_estimated: form.value.birth_date_is_estimated,
                size_id: form.value.size_id,
                color: form.value.color || null,
                microchip: form.value.microchip || null,
                neutered: form.value.neutered,
                neuter_date: form.value.neutered ? brDateToDb(form.value.neuter_date) : null,
                status_id: form.value.status_id,
                notes: form.value.notes || null,
                tags: form.value.tags
            }

            // Only send the rescue block when a rescue date was provided.
            if (form.value.rescue.rescue_date) {
                payload.rescue = {
                    rescue_date: brDateTimeToDb(form.value.rescue.rescue_date),
                    location: form.value.rescue.location || null,
                    rescued_by: form.value.rescue.rescued_by || null,
                    condition: form.value.rescue.condition || null,
                    description: form.value.rescue.description || null
                }
            }

            return payload
        }

        const onSubmit = async () => {
            form.value.id ? updateAnimal() : newAnimal()
        }

        const updateAnimal = async () => {
            try {
                await update(makePayload(), form.value.id)
                notifySuccess('Animal atualizado com sucesso!')
                router.push({ name: listRoute })
            } catch (error) {
                handleErrors(error)
            }
        }

        const newAnimal = async () => {
            try {
                await post(makePayload())
                notifySuccess('Animal criado com sucesso!')
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
                notifyError(error.response?.data?.message || 'Erro ao salvar animal!')
            }
        }

        return {
            form,
            speciesOptions,
            breedOptions,
            sizeOptions,
            statusOptions,
            tagOptions,
            sexOptions,
            hasRescue,
            currentLocation,
            isEditMode,
            images,
            newImage,
            uploadingImage,
            preview,
            openPreview,
            uploadImage,
            removeImage,
            onCastration,
            onSpeciesChange,
            onSubmit,
            headerProps,
            listRoute
        }
    }
})
</script>

<style scoped>
/* Dim overlay + zoom icon, revealed only when hovering a thumbnail. */
.image-hover {
    opacity: 0;
    transition: opacity 0.2s ease;
    background: rgba(0, 0, 0, 0.4);
}
.image-hover:hover {
    opacity: 1;
}
</style>
