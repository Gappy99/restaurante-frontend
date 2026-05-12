import { useCallback } from 'react'
import useCouponStore from '../store/useCouponStore.js'

/**
 * Hook para obtener y manejar cupones
 */
export const useCoupons = () => {
  const {
    coupons,
    loading,
    error,
    fetchCoupons,
    setCoupons,
    clearError,
  } = useCouponStore()

  return {
    coupons,
    loading,
    error,
    fetchCoupons,
    setCoupons,
    clearError,
  }
}

/**
 * Hook para manejar cupón individual
 */
export const useCoupon = (id) => {
  const {
    currentCoupon,
    loading,
    error,
    fetchCouponById,
    setCurrentCoupon,
    clearCurrentCoupon,
  } = useCouponStore()

  const fetch = useCallback(() => {
    if (id) {
      return fetchCouponById(id)
    }
  }, [id, fetchCouponById])

  return {
    coupon: currentCoupon,
    loading,
    error,
    fetch,
    setCurrentCoupon,
    clearCurrentCoupon,
  }
}

/**
 * Hook para manejar formulario de cupón
 */
export const useCouponForm = () => {
  const {
    createCoupon,
    updateCoupon,
    loading,
    error,
    clearError,
  } = useCouponStore()

  const handleCreate = useCallback(async (couponData) => {
    clearError()
    return await createCoupon(couponData)
  }, [createCoupon, clearError])

  const handleUpdate = useCallback(async (id, couponData) => {
    clearError()
    return await updateCoupon(id, couponData)
  }, [updateCoupon, clearError])

  return {
    handleCreate,
    handleUpdate,
    loading,
    error,
    clearError,
  }
}

/**
 * Hook para eliminar cupón
 */
export const useCouponDelete = () => {
  const {
    deleteCoupon,
    loading,
    error,
    clearError,
  } = useCouponStore()

  const handleDelete = useCallback(async (id) => {
    clearError()
    return await deleteCoupon(id)
  }, [deleteCoupon, clearError])

  return {
    handleDelete,
    loading,
    error,
    clearError,
  }
}