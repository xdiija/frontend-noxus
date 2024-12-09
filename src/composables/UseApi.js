import { api } from 'boot/axios'

export default function useApi(url) {
    const list = async () => {
        return await api.get(url)
    }

    const getByID = async (id) => {
        return await api.get(`${url}/${id}`)
    }

    const post = async (reqData) => {
        return await api.post(url, reqData)
    }

    const update = async (reqData) => {
        return await api.put(`${url}/${reqData.id}`, reqData)
    }

    const changeStatus = async (id) => {
        return await api.put(`${url}/${id}/status`)
    }

    return {
        list,
        getByID,
        post,
        update,
        changeStatus
    }
}
