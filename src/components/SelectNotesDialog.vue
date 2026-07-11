<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide">
        <q-card class="q-dialog-plugin" style="min-width: 360px">
            <q-form @submit="onSubmit">
                <q-card-section>
                    <div class="text-h6">{{ title }}</div>
                </q-card-section>

                <q-card-section v-if="message" class="q-pt-none text-body2">
                    {{ message }}
                </q-card-section>

                <q-card-section class="q-gutter-md q-pt-none">
                    <q-select
                        v-if="showSelect"
                        outlined
                        v-model="selected"
                        :options="options"
                        :label="selectLabel"
                        emit-value
                        map-options
                        :rules="selectRules"
                    />
                    <q-input
                        v-if="showNotes"
                        outlined
                        type="textarea"
                        v-model="notes"
                        :label="notesLabel"
                        autogrow
                        :rules="notesRules"
                    />
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat :label="cancelLabel" color="primary" @click="onDialogCancel" />
                    <q-btn :label="okLabel" color="primary" type="submit" />
                </q-card-actions>
            </q-form>
        </q-card>
    </q-dialog>
</template>

<script>
import { defineComponent, ref, computed } from 'vue'
import { useDialogPluginComponent } from 'quasar'

/**
 * Reusable "pick one option + optional reason" dialog, invoked via the Quasar
 * Dialog plugin. Resolves onOk with { value, notes }.
 *
 * Both the select and the notes field are independently toggleable, so it also
 * works as a notes-only prompt (showSelect=false) or a select-only confirm
 * (showNotes=false).
 *
 *   $q.dialog({
 *     component: SelectNotesDialog,
 *     componentProps: {
 *       title: 'Alterar status',
 *       options: statusOptions,          // [{ label, value }]
 *       initialValue: currentStatusId,
 *       notesLabel: 'Motivo (opcional)'
 *     }
 *   }).onOk(({ value, notes }) => { ... })
 */
export default defineComponent({
    name: 'SelectNotesDialog',
    props: {
        title: { type: String, required: true },
        message: { type: String, default: '' },
        showSelect: { type: Boolean, default: true },
        selectLabel: { type: String, default: 'Selecione' },
        options: { type: Array, default: () => [] },
        initialValue: { type: [String, Number, Object], default: null },
        selectRequired: { type: Boolean, default: true },
        showNotes: { type: Boolean, default: true },
        notesLabel: { type: String, default: 'Observações (opcional)' },
        notesRequired: { type: Boolean, default: false },
        initialNotes: { type: String, default: '' },
        okLabel: { type: String, default: 'Confirmar' },
        cancelLabel: { type: String, default: 'Cancelar' }
    },
    emits: [...useDialogPluginComponent.emits],
    setup (props) {
        const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

        const selected = ref(props.initialValue)
        const notes = ref(props.initialNotes)

        const selectRules = computed(() =>
            props.selectRequired
                ? [val => (val !== null && val !== undefined && val !== '') || 'Campo obrigatório!']
                : []
        )

        const notesRules = computed(() =>
            props.notesRequired
                ? [val => !!(val && val.trim()) || 'Campo obrigatório!']
                : []
        )

        const onSubmit = () => {
            onDialogOK({
                value: selected.value,
                notes: notes.value && notes.value.trim() ? notes.value.trim() : null
            })
        }

        return {
            dialogRef,
            onDialogHide,
            onDialogCancel,
            onSubmit,
            selected,
            notes,
            selectRules,
            notesRules
        }
    }
})
</script>
