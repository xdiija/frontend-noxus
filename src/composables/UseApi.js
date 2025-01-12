import { api } from 'boot/axios'
import authService from 'src/services/authService'

export default function useApi(url) {
    const list = async (endPoint = "", queryParams = {}) => {
        await refreshToken(url)
        queryParams = buildQueryParams(queryParams)
        return await api.get(`${url}${endPoint}${queryParams}`)
    }

    const getByID = async (id, queryParams = "") => {
        await refreshToken(url)
        return await api.get(`${url}/${id}${queryParams}`)
    }

    const post = async (reqData) => {
        await refreshToken(url)
        return await api.post(url, reqData)
    }

    const update = async (reqData, id) => {
        await refreshToken(url)
        return await api.put(`${url}/${id}`, reqData)
    }

    const changeStatus = async (id) => {
        return await api.put(`${url}/${id}/status`)
    }

    const buildQueryParams = (objParams) => {
        let strParams = "";

        if (typeof objParams === 'object' && objParams !== null) {
            const arrParams = [];
            for (const key in objParams) {
                if (objParams.hasOwnProperty(key)) {
                    arrParams.push(`${key}=${objParams[key]}`);
                }
            }

            strParams = `?${arrParams.join('&')}`;
        }

        return strParams;
    }

    const refreshToken = async (url) => {
        const arrIgnore = ['auth'];
        if (!arrIgnore.some(word => url.includes(word))) {
            const auth = authService();
            await auth.refreshToken();
        }
    }

    return {
        list,
        getByID,
        post,
        update,
        changeStatus
    }
}
