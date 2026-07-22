<template>
  <q-page class="q-pa-md">
    <div class="q-mb-md">
      <div class="text-h6">Painel do Abrigo</div>
      <div v-if="user?.organization?.name" class="text-subtitle2 text-grey-7">
        {{ user.organization.name }}
      </div>
    </div>

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

        <!-- Agenda: consultas agendadas + retornos sugeridos (org-wide) -->
        <div class="col-12">
          <q-card>
            <q-card-section>
              <div class="text-subtitle1">Agenda — próximos {{ UPCOMING_DAYS }} dias</div>
              <div v-if="!upcoming.length" class="text-caption text-grey-7 q-mt-sm">
                Nenhuma consulta ou retorno no período.
              </div>
              <q-list v-else separator>
                <q-item v-for="(item, index) in upcoming" :key="index">
                  <q-item-section avatar>
                    <q-icon
                      :name="item.kind === 'appointment' ? 'event' : 'undo'"
                      color="primary"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>
                      {{ item.animal?.name || '—' }}
                      <q-chip
                        dense
                        :color="item.kind === 'appointment' ? 'primary' : 'teal'"
                        text-color="white"
                        class="q-ml-sm"
                      >
                        {{ item.kind === 'appointment' ? 'Consulta' : 'Retorno' }}
                      </q-chip>
                    </q-item-label>
                    <q-item-label caption>
                      {{ [item.purpose, item.veterinarian, item.clinic].filter(Boolean).join(' · ') || 'Sem detalhes' }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label>{{ item.date }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
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
import dashboardService from 'src/services/dashboardService'
import notifications from '../utils/notifications'

// Chart chrome shared across every chart on this page (dataviz skill § chrome & ink).
const GRID_COLOR = '#e1e0d9'
const AXIS_LABEL_COLOR = '#898781'
const DATA_LABEL_COLOR = '#52514e'

// Statuses that mean the animal is no longer under the shelter's care.
const TERMINAL_STATUSES = ['Adotado', 'Óbito']

const MONTH_NAMES_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const TREND_MONTHS = 6
const UPCOMING_DAYS = 30

// 'YYYY-MM' (dashboard bucket key) -> PT month label
const monthLabel = (key) => MONTH_NAMES_PT[parseInt(key.split('-')[1], 10) - 1]

export default defineComponent({
    name: 'HomePage',
    components: { apexchart: ApexChart },
    props: ['user'],
    setup () {
        const { notifyError } = notifications()

        const loading = ref(true)
        const statTiles = ref([])
        const upcoming = ref([])

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
        // `statuses` already arrives counted and ordered by sort_order.
        const buildStatusChart = (statuses) => {
            statusChartSeries.value = [{ name: 'Animais', data: statuses.map(status => status.count) }]
            statusChartOptions.value = {
                chart: { id: 'animais-status', toolbar: { show: false } },
                plotOptions: {
                    bar: { horizontal: true, distributed: true, borderRadius: 4, barHeight: '55%' }
                },
                colors: statuses.map(status => status.color || '#2a78d6'),
                dataLabels: { enabled: true, style: { colors: [DATA_LABEL_COLOR] }, formatter: (val) => val },
                legend: { show: false },
                grid: { borderColor: GRID_COLOR, strokeDashArray: 0 },
                xaxis: { categories: statuses.map(status => status.name), labels: { style: { colors: AXIS_LABEL_COLOR } } },
                yaxis: { labels: { style: { colors: AXIS_LABEL_COLOR } } },
                tooltip: { y: { formatter: (val) => `${val} animal(is)` } }
            }
        }

        // Animais por Espécie — plain magnitude comparison, so a single flat hue
        // (not one color per species): the x-axis labels already carry identity.
        // `species` already arrives counted and ordered by count desc.
        const buildSpeciesChart = (species) => {
            speciesChartSeries.value = [{ name: 'Animais', data: species.map(s => s.count) }]
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
                xaxis: { categories: species.map(s => s.name), labels: { style: { colors: AXIS_LABEL_COLOR } } },
                yaxis: { labels: { style: { colors: AXIS_LABEL_COLOR } } }
            }
        }

        // Adoções por Mês (single series, one flat hue) and Resgates x Adoções
        // (two series over the same months — the one place two hues are needed to
        // tell them apart, plus a legend). `trends` arrives pre-bucketed per
        // month (oldest first, zero months included).
        const buildMonthlyCharts = (trends) => {
            const labels = trends.map(t => monthLabel(t.month))
            const adoptionCounts = trends.map(t => t.adoptions)
            const rescueCounts = trends.map(t => t.rescues)

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

        const buildStatTiles = (summary, trends) => {
            const byName = Object.fromEntries(summary.animals_by_status.map(s => [s.name, s.count]))
            const underCare = summary.animals_by_status
                .filter(s => !TERMINAL_STATUSES.includes(s.name))
                .reduce((total, s) => total + s.count, 0)

            const thisMonth = trends[trends.length - 1]?.adoptions ?? 0
            const previousMonth = trends.length > 1 ? trends[trends.length - 2].adoptions : null

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
                { label: 'Em lar temporário', value: byName['Em Lar Temporário'] || 0 },
                { label: 'Voluntários ativos', value: summary.active_volunteers },
                { label: 'Adoções este mês', value: thisMonth, delta }
            ]
        }

        onMounted(async () => {
            const { summary, monthlyTrends, upcomingAppointments } = dashboardService()

            try {
                // Everything arrives pre-aggregated and org-scoped from the
                // dashboard endpoints (Module 7) — no client-side pagination loops.
                const [summaryRes, trendsRes, upcomingRes] = await Promise.all([
                    summary(),
                    monthlyTrends(TREND_MONTHS),
                    upcomingAppointments(UPCOMING_DAYS)
                ])
                const summaryData = summaryRes.data.data
                const trends = trendsRes.data.data

                buildStatusChart(summaryData.animals_by_status)
                buildSpeciesChart(summaryData.animals_by_species)
                buildMonthlyCharts(trends)
                buildStatTiles(summaryData, trends)
                upcoming.value = upcomingRes.data.data
            } catch (error) {
                notifyError('Erro ao carregar dados do painel!')
            } finally {
                loading.value = false
            }
        })

        return {
            loading,
            statTiles,
            upcoming,
            UPCOMING_DAYS,
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
