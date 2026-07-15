import useApi from 'src/composables/UseApi'

// Read-only lookup: list returns the system defaults + the org's own rows.
// Consumed by the expense form's category select.
export default function expenseCategoriesService() {
    const { list } = useApi('expense-categories')

    return { list }
}
