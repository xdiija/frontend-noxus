import { api } from 'boot/axios'

// Pre-aggregated numbers for the HomePage panel (Module 7). Org scoping is
// done server-side; these return only the authenticated user's org.
export default function dashboardService() {
    const summary = () => api.get('dashboard/summary')

    const monthlyTrends = (months = 6) =>
        api.get(`dashboard/monthly-trends?months=${months}`)

    const upcomingAppointments = (days = 30) =>
        api.get(`dashboard/upcoming-appointments?days=${days}`)

    return { summary, monthlyTrends, upcomingAppointments }
}
