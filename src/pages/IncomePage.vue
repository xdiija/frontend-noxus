<template>
  <div class="q-pa-md">
    <q-table
        title="Receitas"
        :rows="rows"
        :columns="columns"
        row-key="name">
        <template v-slot:top>
            <span class="text-h5">Receitas</span>
            <q-space />
            <q-btn
                color="primary"
                label="Adicionar"
                icon="add"
                :to="{ name: 'incomeForm' }"
            />
        </template>
        <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="q-gutter-sm">
                <q-btn
                    icon="edit"
                    color="warning"
                    dense size="sm"
                    @click="handleEditIncome(props.row.id)"
                />
                <q-btn
                    icon="delete"
                    color="negative"
                    dense size="sm"
                    @click="handleDeleteIncome(props.row.id)"
                />
            </q-td>
        </template>
  </q-table>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import incomeService from 'src/services/incomeService'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

export default defineComponent({
    name: 'IncomePage',
    setup () {
        const $q = useQuasar()
        const router = useRouter()
        const rows = ref([])
        const { list, remove } = incomeService()
        const columns = [
            {
                label: 'ID',
                field: 'id',
                name: 'id',
                sortable: true,
                align: 'left'
            },
            {
                label: 'Nome',
                field: row => row.predefined_income.name,
                name: 'predefined_income_name',
                sortable: true,
                align: 'left'
            },
            {
                label: 'Valor',
                field: 'amount',
                name: 'amount',
                sortable: true,
                align: 'left'
            },
            {
                label: 'Data Recebimento',
                field: 'date',
                name: 'date',
                sortable: true,
                align: 'left'
            },
            {
                label: 'Ações',
                field: 'actions',
                name: 'actions',
                align: 'right'
            }
        ]

        onMounted(() => {
            getIncomes()
        })

        const getIncomes = async () => {
            try {
                const { data } = await list()
                rows.value = data
                console.log(data)
            } catch (error) {
                console.error(error)
            }
        }

        const handleDeleteIncome = async (id) => {
            try {
                $q.dialog({
                    title: 'Confirmação',
                    message: 'Deseja realmente apagar o registro?',
                    cancel: {
                        label: 'Cancelar',
                        color: 'negative'
                    },
                    ok: {
                        label: 'Confirmar',
                        color: 'positive',
                        textColor: 'yellow'
                    },
                    persistent: true
                }).onOk(async () => {
                    await remove(id)
                    $q.notify({
                        message: `Income ${id} removida!`,
                        icon: 'check',
                        color: 'positive'
                    })
                    await getIncomes()
                })
            } catch (error) {
                $q.notify({
                    message: 'Erro ao apagar!',
                    icon: 'times',
                    color: 'negative'
                })
            }
        }

        const handleEditIncome = (id) => {
            router.push({ name: 'incomeForm', params: { id } })
        }

        return {
            rows,
            columns,
            handleDeleteIncome,
            handleEditIncome
        }
    }
})
</script>
