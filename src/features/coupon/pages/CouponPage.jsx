import { useEffect, useMemo, useState } from 'react'
import {
  useCoupons,
  useCouponForm,
  useCouponDelete,
} from '../hooks/index.js'
import { Coupons, CouponModal, DeleteConfirmModal } from '../components/index.js'
import { restaurantService } from '../../restaurant/services/restaurantService.js'
import toast from 'react-hot-toast'

const CouponPage = () => {
  const { coupons, loading, error, fetchCoupons } = useCoupons()
  const { handleCreate, handleUpdate, loading: formLoading } = useCouponForm()
  const { handleDelete, loading: deleteLoading } = useCouponDelete()

  const [restaurants, setRestaurants] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [couponToDelete, setCouponToDelete] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchCoupons()
  }, [fetchCoupons])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  useEffect(() => {
    const loadRestaurants = async () => {
      const result = await restaurantService.getRestaurants()
      if (result.success) {
        setRestaurants(Array.isArray(result.data) ? result.data : [])
      }
    }

    loadRestaurants()
  }, [])

  const handleCreateNew = () => {
    setSelectedCoupon(null)
    setIsModalOpen(true)
  }

  const handleEdit = (coupon) => {
    setSelectedCoupon(coupon)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCoupon(null)
  }

  const handleFormSubmit = async (formData) => {
    const result = selectedCoupon
      ? await handleUpdate(selectedCoupon._id || selectedCoupon.id, formData)
      : await handleCreate(formData)

    if (result?.success) {
      toast.success(
        selectedCoupon
          ? 'Cupón actualizado exitosamente'
          : 'Cupón creado exitosamente'
      )
      return result
    }

    toast.error(result?.error || 'Error al guardar el cupón')
    return result
  }

  const couponsList = useMemo(() => {
    return Array.isArray(coupons) ? coupons : []
  }, [coupons])

  const filteredCoupons = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase()

    return couponsList.filter((coupon) => {
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && coupon.active) ||
        (statusFilter === 'inactive' && !coupon.active)

      if (!matchesStatus) return false

      if (!normalizedSearch) return true

      // Buscar en código, descripción y nombres de restaurantes
      const restaurantNames = Array.isArray(coupon.restaurant_ids)
        ? coupon.restaurant_ids
            .map((restaurantId) => {
              if (!restaurantId) return ''
              const idStr = typeof restaurantId === 'string' ? restaurantId : (restaurantId?._id || restaurantId?.id)
              const restaurant = restaurants.find(r => (r._id || r.id) === idStr)
              return restaurant?.restaurant_name || restaurant?.name || ''
            })
            .filter(Boolean)
            .join(' ')
        : ''

      return [
        coupon.code,
        coupon.description,
        restaurantNames,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch))
    })
  }, [couponsList, searchText, statusFilter, restaurants])

  const stats = useMemo(() => {
    const total = couponsList.length
    const active = couponsList.filter((coupon) => coupon.active).length
    const inactive = total - active
    return { total, active, inactive }
  }, [couponsList])

  const handleDeleteClick = (id) => {
    const coupon = coupons.find((c) => (c._id || c.id) === id)
    setCouponToDelete(coupon)
    setIsDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!couponToDelete) return

    const result = await handleDelete(couponToDelete._id || couponToDelete.id)
    if (result?.success) {
      toast.success('Cupón desactivado exitosamente')
      setIsDeleteConfirmOpen(false)
      setCouponToDelete(null)
    } else {
      toast.error(result?.error || 'Error al desactivar el cupón')
    }
  }

  return (
    <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-[#FCF0CA] bg-gradient-to-br from-[#FFF8E4] via-[#FFFFFF] to-[#F8E5C5] p-6 shadow-[0_24px_70px_rgba(46,22,12,0.12)] relative overflow-hidden">
        <div className="pointer-events-none absolute -right-14 -top-16 h-40 w-40 rounded-full bg-[#946841]/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-12 bottom-0 h-36 w-36 rounded-full bg-[#5B300E]/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex rounded-full border border-[#7F532C]/20 bg-[#FCF0CA] px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-[#5B300E]">
              Cupón
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-[#2E160C]">
              Administración de cupones
            </h1>
            <p className="mt-3 text-base leading-7 text-[#7F532C]">
              Controla la creación, edición y estado de cupones activos devueltos por el backend.
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center justify-center rounded-2xl bg-[#5B300E] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#5B300E]/20 transition hover:-translate-y-0.5 hover:bg-[#2E160C]"
          >
            + Nuevo cupón
          </button>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-[28px] border border-[#E8D8B5] bg-white p-6 shadow-[0_18px_44px_rgba(46,22,12,0.08)]">
          <p className="text-sm font-medium text-[#5B300E]">Total de cupones</p>
          <p className="mt-4 text-4xl font-black text-[#2E160C]">{stats.total}</p>
          <p className="mt-2 text-sm text-[#5B300E]">Cupones cargados desde el backend</p>
          <div className="mt-4 h-1 rounded-full bg-[#5B300E]" />
        </div>
        <div className="rounded-[28px] border border-[#E8D8B5] bg-white p-6 shadow-[0_18px_44px_rgba(46,22,12,0.08)]">
          <p className="text-sm font-medium text-[#5B300E]">Activos</p>
          <p className="mt-4 text-4xl font-black text-[#2E160C]">{stats.active}</p>
          <p className="mt-2 text-sm text-[#5B300E]">Cupones vigentes</p>
          <div className="mt-4 h-1 rounded-full bg-emerald-500" />
        </div>
        <div className="rounded-[28px] border border-[#E8D8B5] bg-white p-6 shadow-[0_18px_44px_rgba(46,22,12,0.08)]">
          <p className="text-sm font-medium text-[#5B300E]">Inactivos</p>
          <p className="mt-4 text-4xl font-black text-[#2E160C]">{stats.inactive}</p>
          <p className="mt-2 text-sm text-[#5B300E]">Cupones desactivados</p>
          <div className="mt-4 h-1 rounded-full bg-amber-500" />
        </div>
      </section>

      <section className="rounded-[28px] border border-[#FCF0CA] bg-white p-6 shadow-[0_18px_44px_rgba(46,22,12,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-[#5B300E]">Filtrar cupones</h2>
            <p className="mt-1 text-sm text-[#5B300E]">Busca por código, descripción o restaurante asociado.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:w-auto">
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Buscar cupones"
              className="min-w-[260px] rounded-xl border border-[#E8D8B5] bg-[#FFFDF8] px-4 py-3 text-[#5B300E] placeholder:text-[#5B300E] caret-[#5B300E] outline-none transition focus:border-[#5B300E] focus:ring-2 focus:ring-[#946841]/20"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="min-w-[240px] rounded-xl border border-[#E8D8B5] bg-[#FFFDF8] px-4 py-3 text-[#5B300E] outline-none transition focus:border-[#5B300E] focus:ring-2 focus:ring-[#946841]/20"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>
      </section>

      <section>
        <Coupons
          coupons={filteredCoupons}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          loading={loading}
        />

        {!loading && filteredCoupons.length === 0 && (
          <div className="rounded-[28px] border border-dashed border-[#E8D8B5] bg-white p-14 text-center shadow-[0_18px_44px_rgba(46,22,12,0.06)]">
            <p className="text-xl font-semibold text-[#5B300E]">No hay cupones para mostrar</p>
            <p className="mt-2 text-sm text-[#5B300E]">Crea un cupón nuevo o ajusta los filtros para ver resultados.</p>
          </div>
        )}
      </section>

      <CouponModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        coupon={selectedCoupon}
        restaurants={restaurants}
        onSuccess={handleFormSubmit}
        loading={formLoading}
      />

      <DeleteConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        coupon={couponToDelete}
        loading={deleteLoading}
      />
    </div>
  )
}

export default CouponPage