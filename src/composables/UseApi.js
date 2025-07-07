import { api } from 'boot/axios'
import authService from 'src/services/authService'

export default function useApi(url) {
    const list = async (endPoint = "", queryParams = {}) => {
        await refreshToken(url);
        queryParams = buildQueryParams(queryParams)
        return await api.get(`${url}${endPoint}${queryParams}`)
    }

    const getByID = async (id, queryParams = "") => {
        await refreshToken(url);
        return await api.get(`${url}/${id}${queryParams}`)
    }

    const post = async (reqData, endPoint = "") => {
        await refreshToken(url);
        return await api.post(url, reqData)
    }

    const update = async (reqData, id, endPoint = "") => {
        await refreshToken(url);
        return await api.put(`${url}${endPoint}/${id}`, reqData)
    }

    const changeStatus = async (id, reqData, endPoint = "") => {
        await refreshToken(url);
        return await api.put(`${url}${endPoint}/${id}/status`, reqData)
    }

    const destroy = async (id) => {
        await refreshToken(url);
        return await api.delete(`${url}/${id}`)
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
        changeStatus,
        destroy
    }
}
