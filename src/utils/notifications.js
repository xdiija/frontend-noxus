import { Notify } from 'quasar'

export default function notifications() {

    const notifySuccess = (message) => {
        Notify.create({
            group: false,
            message,
            icon: 'check',
            color: 'positive'
        })
    }

    const notifyError = (message) => {
        Notify.create({
            group: false,
            message,
            icon: 'report_problem',
            color: 'negative'
        })
    }

    return {
        notifySuccess,
        notifyError
    }
}
