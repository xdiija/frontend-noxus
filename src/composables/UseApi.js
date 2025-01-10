import { api } from 'boot/axios'

export default function useApi(url) {
    const list = async (endPoint = "", queryParams = {}) => {
        queryParams = buildQueryParams(queryParams)
        return await api.get(`${url}${endPoint}${queryParams}`)
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

    return {
        list,
        getByID,
        post,
        update,
        changeStatus
    }
}
