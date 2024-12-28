import { api } from 'boot/axios'

export default function useApi(url) {
    const list = async (complement = "") => {
        return await api.get(`${url}${complement}`)
    }

    const getByID = async (id, queryParams = "") => {
        return await api.get(`${url}/${id}${queryParams}`)
    }

    const post = async (reqData) => {
        return await api.post(url, reqData)
    }

    const update = async (reqData, id) => {
        return await api.put(`${url}/${id}`, reqData)
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
