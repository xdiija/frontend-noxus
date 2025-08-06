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
        return await api.post(`${url}${endPoint}`, reqData)
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
        if (!objParams || typeof objParams !== 'object') return '';

        const params = new URLSearchParams();

        for (const key in objParams) {
            if (Array.isArray(objParams[key])) {
                // Handle array values (account: [1, 2] → account[]=1&account[]=2)
                objParams[key].forEach(value => {
                    params.append(`${key}[]`, value);
                });
            } else if (objParams[key] !== undefined && objParams[key] !== null) {
                params.append(key, objParams[key]);
            }
        }

        const queryString = params.toString();
        return queryString ? `?${queryString}` : '';
    };

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
