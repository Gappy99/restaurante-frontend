import { axiosAdmin } from '../../../features/menus/Api/api.js'

export const getReviews = async (restaurantId = null) => {
  const params = {}

  if (restaurantId) {
    params.restaurant_id = restaurantId
  }

  return axiosAdmin.get('/review', { params })
}

export const createReview = async (data) => {
  return axiosAdmin.post('/review', data)
}

export const updateReview = async (id, data) => {
  return axiosAdmin.put(`/review/${id}`, data)
}

export const deleteReview = async (id) => {
  return axiosAdmin.delete(`/review/${id}`)
}