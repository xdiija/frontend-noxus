<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide">
        <q-card class="q-dialog-plugin" style="min-width: 360px">
            <q-form @submit="onSubmit">
                <q-card-section>
                    <div class="text-h6">Encerrar estadia</div>
                </q-card-section>

                <q-card-section v-if="message" class="q-pt-none text-body2">
                    {{ message }}
                </q-card-section>

                <q-card-section class="q-gutter-md q-pt-none">
                    <q-input
                        outlined
                        v-model="exitDate"
                        label="Data de saída"
                        mask="##/##/####"
                        placeholder="dd/mm/aaaa"
                        :rules="[ val => !!val || 'Campo obrigatório!']"
                    >
                        <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer">
                                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                    <q-date v-model="exitDate" mask="DD/MM/YYYY">
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
 * "Close a foster stay" dialog (exit date required), invoked via the Quasar
 * Dialog plugin. Resolves onOk with { exit_date }, the shape the placement
 * close endpoint expects.
 */
export default defineComponent({
    name: 'ClosePlacementDialog',
    props: {
        message: { type: String, default: '' }
    },
    emits: [...useDialogPluginComponent.emits],
    setup () {
        const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

        const exitDate = ref('')

        const onSubmit = () => {
            onDialogOK({
                exit_date: brDateToDb(exitDate.value)
            })
        }

        return {
            dialogRef,
            onDialogHide,
            onDialogCancel,
            onSubmit,
            exitDate
        }
    }
})
</script>
