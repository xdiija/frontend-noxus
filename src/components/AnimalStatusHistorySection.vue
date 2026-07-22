<template>
    <q-card flat bordered class="col-xs-12 q-mt-sm">
        <q-card-section>
            <div class="text-subtitle1 q-mb-sm">Histórico de status</div>

            <q-markup-table flat dense v-if="rows.length">
                <thead>
                    <tr>
                        <th class="text-left">Data</th>
                        <th class="text-left">De</th>
                        <th class="text-left">Para</th>
                        <th class="text-left">Motivo</th>
                        <th class="text-left">Alterado por</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="row in rows" :key="row.id">
                        <td class="text-left">{{ row.created_at }}</td>
                        <td class="text-left">
                            <q-chip
                                v-if="row.old_status"
                                :style="chipStyle(row.old_status.color)"
                                text-color="white"
                                dense
                            >
                                {{ row.old_status.name }}
                            </q-chip>
                            <template v-else>—</template>
                        </td>
                        <td class="text-left">
                            <q-chip
                                :style="chipStyle(row.new_status.color)"
                                text-color="white"
                                dense
                            >
                                {{ row.new_status.name }}
                            </q-chip>
                        </td>
                        <td class="text-left">{{ row.notes || '—' }}</td>
                        <td class="text-left">{{ row.changed_by?.name || '—' }}</td>
                    </tr>
                </tbody>
            </q-markup-table>
            <div v-else class="text-grey">Nenhuma alteração de status registrada.</div>
        </q-card-section>
    </q-card>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import animalStatusHistoryService from 'src/services/animalStatusHistoryService'
import notifications from '../utils/notifications'

export default defineComponent({
    name: 'AnimalStatusHistorySection',
    props: {
        animalId: {
            type: [String, Number],
            required: true
        }
    },
    setup (props) {
        const { notifyError } = notifications()
        const historyApi = animalStatusHistoryService(props.animalId)

        const rows = ref([])

        const chipStyle = (color) => ({ backgroundColor: color || '#6B7280' })

        onMounted(async () => {
            try {
                const { data } = await historyApi.list()
                rows.value = data.data
            } catch (error) {
                notifyError('Erro ao carregar o histórico de status.')
            }
        })

        return {
            rows,
            chipStyle
        }
    }
})
</script>
