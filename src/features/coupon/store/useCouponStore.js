import { create } from 'zustand'
import { couponService } from '../services/couponService.js'
import { COUPON_DEFAULTS } from '../constants/couponConstants.js'

const useCouponStore = create((set, get) => ({
  // State
  coupons: [],
  currentCoupon: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: COUPON_DEFAULTS.PAGE_SIZE,
    total: 0,
  },
  filters: {
    search: '',
    active: true,
  },
  sortBy: COUPON_DEFAULTS.SORT_BY,
  sortOrder: COUPON_DEFAULTS.SORT_ORDER,

  // Actions
  setCoupons: (coupons) => set({ coupons }),
  setCurrentCoupon: (coupon) => set({ currentCoupon: coupon }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setPagination: (pagination) =>
    set((state) => ({
      pagination: { ...state.pagination, ...pagination },
    })),
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
  setSortBy: (sortBy, sortOrder = 'asc') =>
    set({ sortBy, sortOrder }),

  clearError: () => set({ error: null }),
  clearCurrentCoupon: () => set({ currentCoupon: null }),

  resolveCouponId: (coupon) => coupon?._id || coupon?.id,

  // Async Actions
  fetchCoupons: async (params = {}) => {
    set({ loading: true, error: null })
    const result = await couponService.getCoupons(params)

    if (result.success) {
      set({
        coupons: result.data,
        loading: false,
        error: null,
      })
      return result
    } else {
      set({
        loading: false,
        error: result.error,
      })
      return result
    }
  },

  fetchCouponById: async (id) => {
    if (!id) return { success: false, error: 'ID de cupón requerido' }

    set({ loading: true, error: null })
    const result = await couponService.getCouponById(id)

    if (result.success) {
      set({
        currentCoupon: result.data,
        loading: false,
        error: null,
      })
    } else {
      set({
        loading: false,
        error: result.error,
      })
    }
    return result
  },

  createCoupon: async (couponData) => {
    set({ loading: true, error: null })
    const result = await couponService.createCoupon(couponData)

    if (result.success) {
      set({ loading: false, error: null })
      // Optionally refresh coupons
      get().fetchCoupons()
    } else {
      set({ loading: false, error: result.error })
    }
    return result
  },

  updateCoupon: async (id, couponData) => {
    set({ loading: true, error: null })
    const result = await couponService.updateCoupon(id, couponData)

    if (result.success) {
      set({
        currentCoupon: result.data,
        loading: false,
        error: null,
      })
      // Refresh list
      get().fetchCoupons()
    } else {
      set({ loading: false, error: result.error })
    }
    return result
  },

  deleteCoupon: async (id) => {
    set({ loading: true, error: null })
    const result = await couponService.deleteCoupon(id)

    if (result.success) {
      set({ loading: false, error: null })
      // Refresh list
      get().fetchCoupons()
    } else {
      set({ loading: false, error: result.error })
    }
    return result
  },
}))

export default useCouponStore