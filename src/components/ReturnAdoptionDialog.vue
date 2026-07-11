<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide">
        <q-card class="q-dialog-plugin" style="min-width: 360px">
            <q-form @submit="onSubmit">
                <q-card-section>
                    <div class="text-h6">Registrar devolução</div>
                </q-card-section>

                <q-card-section v-if="message" class="q-pt-none text-body2">
                    {{ message }}
                </q-card-section>

                <q-card-section class="q-gutter-md q-pt-none">
                    <q-input
                        outlined
                        v-model="returnDate"
                        label="Data da devolução"
                        mask="##/##/####"
                        placeholder="dd/mm/aaaa"
                        :rules="[ val => !!val || 'Campo obrigatório!']"
                    >
                        <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer">
                                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                    <q-date v-model="returnDate" mask="DD/MM/YYYY">
                                        <div class="row items-center justify-end">
                                            <q-btn v-close-popup label="Fechar" color="primary" flat />
                                        </div>
                                    </q-date>
                                </q-popup-proxy>
                            </q-icon>
                        </template>
                    </q-input>
                    <q-input
                        outlined
                        type="textarea"
                        v-model="reason"
                        label="Motivo (opcional)"
                        autogrow
                    />
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
 * "Register a return" dialog (date required + reason optional), invoked via the
 * Quasar Dialog plugin. Resolves onOk with { return_date, return_reason }, the
 * shape the adoptions return endpoint expects.
 */
export default defineComponent({
    name: 'ReturnAdoptionDialog',
    props: {
        message: { type: String, default: '' }
    },
    emits: [...useDialogPluginComponent.emits],
    setup () {
        const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

        const returnDate = ref('')
        const reason = ref('')

        const onSubmit = () => {
            onDialogOK({
                return_date: brDateToDb(returnDate.value),
                return_reason: reason.value && reason.value.trim() ? reason.value.trim() : null
            })
        }

        return {
            dialogRef,
            onDialogHide,
            onDialogCancel,
            onSubmit,
            returnDate,
            reason
        }
    }
})
</script>
