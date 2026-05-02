import adminClient from '../../../shared/api/adminClient.js'

const normalizeInformationItem = (payload) => {
  if (!payload) {
    return null
  }

  if (Array.isArray(payload)) {
    return null
  }

  let raw = payload

  if (
    payload?.information &&
    typeof payload.information === 'object' &&
    !Array.isArray(payload.information)
  ) {
    raw = payload.information
  } else if (
    payload?.data &&
    typeof payload.data === 'object' &&
    !Array.isArray(payload.data)
  ) {
    raw = payload.data
  }

  return {
    ...raw,
    restaurantId:
      raw.restaurantId?._id || raw.restaurantId?.id || raw.restaurantId || '',
    usuario:
      raw.usuario?._id || raw.usuario?.id || raw.usuario || null,
  }
}

const normalizeInformationList = (payload) => {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload?.informations)) {
    return payload.informations
  }

  if (Array.isArray(payload?.information)) {
    return payload.information
  }

  if (Array.isArray(payload?.data)) {
    return payload.data
  }

  return []
}

export const informationService = {
  getInformations: async ({ restaurantId } = {}) => {
    try {
      const response = await adminClient.get('/information', {
        params: restaurantId ? { restaurantId } : {},
      })

      return {
        success: true,
        data: normalizeInformationList(response.data).map((item) =>
          normalizeInformationItem(item)
        ),
        total: response.data?.total ?? 0,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      }
    }
  },

  getInformationById: async (id) => {
    try {
      const response = await adminClient.get(`/information/${id}`)
      const information = normalizeInformationItem(response.data)

      if (!information) {
        throw new Error('Respuesta inválida al obtener información')
      }

      return {
        success: true,
        data: information,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      }
    }
  },

  createInformation: async (informationData) => {
    try {
      const response = await adminClient.post('/information', informationData)
      const information = normalizeInformationItem(response.data)

      if (!information) {
        throw new Error('Respuesta inválida al crear información')
      }

      return {
        success: true,
        data: information,
      }
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message,
        code: error.response?.data?.error,
      }
    }
  },

  updateInformation: async (id, informationData) => {
    try {
      const response = await adminClient.put(`/information/${id}`, informationData)
      const information = normalizeInformationItem(response.data)

      if (!information) {
        throw new Error('Respuesta inválida al actualizar información')
      }

      return {
        success: true,
        data: information,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      }
    }
  },

  deleteInformation: async (id) => {
    try {
      await adminClient.delete(`/information/${id}`)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      }
    }
  },
}
