<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide">
        <q-card class="q-dialog-plugin" style="min-width: 360px">
            <q-form @submit="onSubmit">
                <q-card-section>
                    <div class="text-h6">Transferir de canil</div>
                </q-card-section>

                <q-card-section v-if="message" class="q-pt-none text-body2">
                    {{ message }}
                </q-card-section>

                <q-card-section class="q-gutter-md q-pt-none">
                    <q-select
                        outlined
                        v-model="kennelId"
                        :options="kennelOptions"
                        option-value="id"
                        option-label="name"
                        emit-value
                        map-options
                        label="Canil de destino"
                        :rules="[ val => !!val || 'Campo obrigatório!']"
                    />
                    <q-input
                        outlined
                        v-model="date"
                        label="Data da transferência"
                        mask="##/##/####"
                        placeholder="dd/mm/aaaa"
                        :rules="[ val => !!val || 'Campo obrigatório!']"
                    >
                        <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer">
                                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                    <q-date v-model="date" mask="DD/MM/YYYY">
                                        <div class="row items-center justify-end">
                                            <q-btn v-close-popup label="Fechar" color="primary" flat />
                                        </div>
                                    </q-date>
                                </q-popup-proxy>
                            </q-icon>
                        </template>
                    </q-input>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="Cancelar" color="primary" @click="onDialogCancel" />
                    <q-btn label="Confirmar" color="primary" type="submit" />
                </q-card-actions>
            </q-form>
        </q-card>
    </q-dialog>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useDialogPluginComponent } from 'quasar'

// dd/mm/yyyy -> yyyy-mm-dd
const brDateToDb = (value) => {
    if (!value) return null
    const [d, m, y] = value.split('/')
    return (d && m && y) ? `${y}-${m}-${d}` : null
}

/**
 * "Transfer a kennel stay" dialog (target kennel + date), invoked via the
 * Quasar Dialog plugin. Resolves onOk with { kennel_id, date }, the shape the
 * stay transfer endpoint expects. kennelOptions should already exclude the
 * current kennel.
 */
export default defineComponent({
    name: 'TransferStayDialog',
    props: {
        message: { type: String, default: '' },
        kennelOptions: { type: Array, default: () => [] }
    },
    emits: [...useDialogPluginComponent.emits],
    setup () {
        const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

        const kennelId = ref(null)
        const date = ref('')

        const onSubmit = () => {
            onDialogOK({
                kennel_id: kennelId.value,
                date: brDateToDb(date.value)
            })
        }

        return {
            dialogRef,
            onDialogHide,
            onDialogCancel,
            onSubmit,
            kennelId,
            date
        }
    }
})
</script>
