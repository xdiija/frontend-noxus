import VueApexCharts from 'vue3-apexcharts'

export default async ({ app }) => {
    app.component('apexchart', VueApexCharts)
}