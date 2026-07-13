<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md">Painel do Abrigo</div>

    <div v-if="loading" class="row justify-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
    </div>

    <template v-else>
      <!-- KPIs -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-6 col-md-3" v-for="tile in statTiles" :key="tile.label">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-caption text-grey-8">{{ tile.label }}</div>
              <div class="text-h4 q-mt-xs">{{ tile.value }}</div>
              <div v-if="tile.delta" class="text-caption q-mt-xs" :class="tile.delta.class">
                <q-icon :name="tile.delta.icon" size="16px" />
                {{ tile.delta.text }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Charts -->
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6">
          <q-card>
            <q-card-section style="height: 40vh;">
              <div class="text-subtitle1">Animais por Status</div>
              <apexchart
                height="88%"
                type="bar"
                :options="statusChartOptions"
                :series="statusChartSeries"
              />
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-6">
          <q-card>
            <q-card-section style="height: 40vh;">
              <div class="text-subtitle1">Animais por Espécie</div>
              <apexchart
                height="88%"
                type="bar"
                :options="speciesChartOptions"
                :series="speciesChartSeries"
              />
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-6">
          <q-card>
            <q-card-section style="height: 40vh;">
              <div class="text-subtitle1">Adoções por Mês</div>
              <apexchart
                height="88%"
                type="bar"
                :options="adoptionsChartOptions"
                :series="adoptionsChartSeries"
              />
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-6">
          <q-card>
            <q-card-section style="height: 40vh;">
              <div class="text-subtitle1">Resgates x Adoções</div>
              <apexchart
                height="88%"
                type="line"
                :options="trendChartOptions"
                :series="trendChartSeries"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </template>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import ApexChart from 'vue3-apexcharts'
import animalStatusesService from 'src/services/animalStatusesService'
import animalsService from 'src/services/animalsService'
import adoptionsService from 'src/services/adoptionsService'
import volunteersService from 'src/services/volunteersService'
import notifications from '../utils/notifications'

// Chart chrome shared across every chart on this page (dataviz skill § chrome & ink).
const GRID_COLOR = '#e1e0d9'
const AXIS_LABEL_COLOR = '#898781'
const DATA_LABEL_COLOR = '#52514e'

// Statuses that mean the animal is no longer under the shelter's care.
const TERMINAL_STATUSES = ['Adotado', 'Óbito']

const MONTH_NAMES_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

// dd/mm/yyyy or dd/mm/yyyy HH:mm:ss (API dates are always BR-formatted) -> yyyy-mm
const brDateToMonthKey = (value) => {
    if (!value) return null
    const [datePart] = value.split(' ')
    const [d, m, y] = datePart.split('/')
    return (d && m && y) ? `${y}-${m}` : null
}

// The last n calendar months (oldest first), so a month with zero events still
// renders as a zero bar/point instead of being silently skipped.
const lastNMonths = (n) => {
    const months = []
    const now = new Date()
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        months.push({
            key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
            label: MONTH_NAMES_PT[d.getMonth()]
        })
    }
    return months
}

// Pages through a paginated index endpoint (max per_page is 100) to get every
// row for client-side aggregation — fine at shelter scale, but a real reporting
// endpoint (Module 7) would be the right move if org sizes grow a lot.
const fetchAllPages = async (listFn) => {
    const perPage = 100
    let page = 1
    let lastPage = 1
    let rows = []

    do {
        const { data } = await listFn('', { page, per_page: perPage })
        rows = rows.concat(data.data)
        lastPage = data.meta?.last_page ?? 1
        page++
    } while (page <= lastPage)

    return rows
}

export default defineComponent({
    name: 'HomePage',
    components: { apexchart: ApexChart },
    props: ['user'],
    setup () {
        const { notifyError } = notifications()

        const loading = ref(true)
        const statTiles = ref([])

        const statusChartSeries = ref([])
        const statusChartOptions = ref({})
        const speciesChartSeries = ref([])
        const speciesChartOptions = ref({})
        const adoptionsChartSeries = ref([])
        const adoptionsChartOptions = ref({})
        const trendChartSeries = ref([])
        const trendChartOptions = ref({})

        // Animais por Status — a horizontal bar (not a donut: up to 7 statuses,
        // some close in value, and a donut for many/close-value comparisons is a
        // known anti-pattern). Reuses each status's own seeded color for
        // consistency with the status chips used everywhere else in the app; the
        // status name is always printed on the axis right beside its bar, so
        // identity never depends on distinguishing the hues themselves.
        const buildStatusChart = (statuses, animals) => {
            const sorted = [...statuses].sort((a, b) => a.sort_order - b.sort_order)
            const counts = sorted.map(status => animals.filter(a => a.status?.id === status.id).length)

            statusChartSeries.value = [{ name: 'Animais', data: counts }]
            statusChartOptions.value = {
                chart: { id: 'animais-status', toolbar: { show: false } },
                plotOptions: {
                    bar: { horizontal: true, distributed: true, borderRadius: 4, barHeight: '55%' }
                },
                colors: sorted.map(status => status.color || '#2a78d6'),
                dataLabels: { enabled: true, style: { colors: [DATA_LABEL_COLOR] }, formatter: (val) => val },
                legend: { show: false },
                grid: { borderColor: GRID_COLOR, strokeDashArray: 0 },
                xaxis: { categories: sorted.map(status => status.name), labels: { style: { colors: AXIS_LABEL_COLOR } } },
                yaxis: { labels: { style: { colors: AXIS_LABEL_COLOR } } },
                tooltip: { y: { formatter: (val) => `${val} animal(is)` } }
            }
        }

        // Animais por Espécie — plain magnitude comparison, so a single flat hue
        // (not one color per species): the x-axis labels already carry identity.
        const buildSpeciesChart = (animals) => {
            const counts = {}
            animals.forEach(a => {
                const name = a.species?.name || 'Não informado'
                counts[name] = (counts[name] || 0) + 1
            })
            const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])

            speciesChartSeries.value = [{ name: 'Animais', data: entries.map(e => e[1]) }]
            speciesChartOptions.value = {
                chart: { id: 'animais-especie', toolbar: { show: false } },
                plotOptions: { bar: { borderRadius: 4, columnWidth: '45%' } },
                colors: ['#2a78d6'],
                dataLabels: {
                    enabled: true,
                    offsetY: -20,
                    background: { enabled: false },
                    style: { colors: [DATA_LABEL_COLOR] },
                    formatter: (val) => val
                },
                legend: { show: false },
                grid: { borderColor: GRID_COLOR, strokeDashArray: 0 },
                xaxis: { categories: entries.map(e => e[0]), labels: { style: { colors: AXIS_LABEL_COLOR } } },
                yaxis: { labels: { style: { colors: AXIS_LABEL_COLOR } } }
            }
        }

        // Adoções por Mês (single series, one flat hue) and Resgates x Adoções
        // (two series over the same months — the one place two hues are needed to
        // tell them apart, plus a legend).
        const buildMonthlyCharts = (months, animals, adoptions) => {
            const labels = months.map(m => m.label)
            const rescueCounts = months.map(({ key }) =>
                animals.filter(a => a.rescue && brDateToMonthKey(a.rescue.rescue_date) === key).length
            )
            const adoptionCounts = months.map(({ key }) =>
                adoptions.filter(ad => brDateToMonthKey(ad.adoption_date) === key).length
            )

            adoptionsChartSeries.value = [{ name: 'Adoções', data: adoptionCounts }]
            adoptionsChartOptions.value = {
                chart: { id: 'adocoes-mes', toolbar: { show: false } },
                plotOptions: { bar: { borderRadius: 4, columnWidth: '45%' } },
                colors: ['#2a78d6'],
                dataLabels: {
                    enabled: true,
                    offsetY: -20,
                    background: { enabled: false },
                    style: { colors: [DATA_LABEL_COLOR] },
                    formatter: (val) => val
                },
                legend: { show: false },
                grid: { borderColor: GRID_COLOR, strokeDashArray: 0 },
                xaxis: { categories: labels, labels: { style: { colors: AXIS_LABEL_COLOR } } },
                yaxis: { labels: { style: { colors: AXIS_LABEL_COLOR } } }
            }

            trendChartSeries.value = [
                { name: 'Resgates', data: rescueCounts },
                { name: 'Adoções', data: adoptionCounts }
            ]
            trendChartOptions.value = {
                chart: { id: 'resgates-adocoes', toolbar: { show: false } },
                stroke: { width: 2, curve: 'smooth' },
                markers: { size: 5, hover: { size: 7 } },
                colors: ['#2a78d6', '#1baf7a'],
                // Only the last point of each line is labeled directly — never a
                // number on every point; the legend + tooltip carry the rest.
                dataLabels: {
                    enabled: true,
                    formatter: (val, opts) => (opts.dataPointIndex === labels.length - 1 ? val : ''),
                    style: { colors: [DATA_LABEL_COLOR] }
                },
                legend: { show: true, labels: { colors: DATA_LABEL_COLOR } },
                grid: { borderColor: GRID_COLOR, strokeDashArray: 0 },
                xaxis: { categories: labels, labels: { style: { colors: AXIS_LABEL_COLOR } } },
                yaxis: { labels: { style: { colors: AXIS_LABEL_COLOR } } }
            }
        }

        const buildStatTiles = (animals, adoptions, volunteers, months) => {
            const underCare = animals.filter(a => !TERMINAL_STATUSES.includes(a.status?.name)).length
            const fosteredNow = animals.filter(a => a.status?.name === 'Em Lar Temporário').length
            const activeVolunteers = volunteers.filter(v => v.status?.name === 'Ativo').length

            const currentKey = months[months.length - 1].key
            const previousKey = months[months.length - 2]?.key
            const thisMonth = adoptions.filter(ad => brDateToMonthKey(ad.adoption_date) === currentKey).length
            const previousMonth = previousKey
                ? adoptions.filter(ad => brDateToMonthKey(ad.adoption_date) === previousKey).length
                : null

            let delta = null
            if (previousMonth !== null) {
                const diff = thisMonth - previousMonth
                delta = {
                    icon: diff > 0 ? 'arrow_upward' : diff < 0 ? 'arrow_downward' : 'remove',
                    class: diff > 0 ? 'text-positive' : 'text-grey-7',
                    text: `${diff > 0 ? '+' : ''}${diff} vs mês anterior`
                }
            }

            statTiles.value = [
                { label: 'Animais sob cuidado', value: underCare },
                { label: 'Em lar temporário', value: fosteredNow },
                { label: 'Voluntários ativos', value: activeVolunteers },
                { label: 'Adoções este mês', value: thisMonth, delta }
            ]
        }

        onMounted(async () => {
            const { list: listStatuses } = animalStatusesService()
            const { list: listAnimals } = animalsService()
            const { list: listAdoptions } = adoptionsService()
            const { list: listVolunteers } = volunteersService()

            try {
                const [statusesRes, animals, adoptions, volunteers] = await Promise.all([
                    listStatuses(),
                    fetchAllPages(listAnimals),
                    fetchAllPages(listAdoptions),
                    fetchAllPages(listVolunteers)
                ])
                const statuses = statusesRes.data.data
                const months = lastNMonths(6)

                buildStatusChart(statuses, animals)
                buildSpeciesChart(animals)
                buildMonthlyCharts(months, animals, adoptions)
                buildStatTiles(animals, adoptions, volunteers, months)
            } catch (error) {
                notifyError('Erro ao carregar dados do painel!')
            } finally {
                loading.value = false
            }
        })

        return {
            loading,
            statTiles,
            statusChartSeries,
            statusChartOptions,
            speciesChartSeries,
            speciesChartOptions,
            adoptionsChartSeries,
            adoptionsChartOptions,
            trendChartSeries,
            trendChartOptions
        }
    }
})
</script>
