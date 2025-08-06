<template>
  <q-page class="q-pa-md">
    <div>
	
      <div class="row q-col-gutter-md q-mt-lg">
        <!-- Chart 1 -->
        <div class="col-12 col-md-6">
          <q-card>
            <q-card-section style="height: 40vh;">
              <div class="text-subtitle1">Vendas da Semana</div>
              <apexchart
                height="95%"
                type="bar"
                :options="chartOptions1"
                :series="series1"
              />
            </q-card-section>
          </q-card>
        </div>

        <!-- Chart 2 -->
        <div class="col-12 col-md-6">
          <q-card>
            <q-card-section style="height: 40vh;">
              <div class="text-subtitle1">Lucro Mensal</div>
              <apexchart
                height="95%"
                type="line"
                :options="chartOptions2"
                :series="series2"
              />
            </q-card-section>
          </q-card>
        </div>

        <!-- Chart 3 -->
        <div class="col-12 col-md-6">
          <q-card>
            <q-card-section style="height: 40vh;">
              <div class="text-subtitle1">Clientes Ativos</div>
              <apexchart
                height="95%"
                type="area"
                :options="chartOptions3"
                :series="series3"
              />
            </q-card-section>
          </q-card>
        </div>

        <!-- Chart 4 -->
        <div class="col-12 col-md-6">
          <q-card>
            <q-card-section style="height: 40vh;">
              <div class="text-subtitle1">Distribuição de Categorias</div>
              <apexchart
                height="95%"
                type="pie"
                :options="chartOptions4"
                :series="series4"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import ApexChart from 'vue3-apexcharts'
import { ref } from 'vue'

defineProps(['user'])

// Chart 1 - Bar
const series1 = ref([{ name: 'Vendas', data: [10, 20, 15, 30, 40, 35, 50] }])
const chartOptions1 = ref({
  chart: { id: 'vendas-semana' },
  xaxis: { categories: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'] }
})

// Chart 2 - Line
const series2 = ref([{ name: 'Lucro', data: [3000, 4200, 3900, 5100, 6100, 5800] }])
const chartOptions2 = ref({
  chart: { id: 'lucro-mensal' },
  xaxis: { categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'] }
})

// Chart 3 - Area
const series3 = ref([{ name: 'Clientes', data: [5, 10, 15, 20, 30, 25] }])
const chartOptions3 = ref({
  chart: { id: 'clientes-ativos' },
  xaxis: { categories: ['2020', '2021', '2022', '2023', '2024', '2025'] }
})

// Chart 4 - Pie
const series4 = ref([44, 33, 12, 11])
const chartOptions4 = ref({
  labels: ['Categoria A', 'Categoria B', 'Categoria C', 'Categoria D']
})
</script>

<script>
export default {
  name: 'HomePage',
  components: {
    apexchart: ApexChart,
  },
}
</script>
