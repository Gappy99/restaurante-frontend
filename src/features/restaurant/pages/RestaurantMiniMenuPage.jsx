import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import useRestaurantStore from '../store/useRestaurantStore.js'
import RestaurantMiniMenu from '../components/RestaurantMiniMenu.jsx'
import toast from 'react-hot-toast'

const RestaurantMiniMenuPage = () => {
  const { id } = useParams()
  const { fetchRestaurantById, currentRestaurant, error } = useRestaurantStore()
  const [restaurant, setRestaurant] = useState(null)

  useEffect(() => {
    if (id) {
      fetchRestaurantById(id).then((res) => {
        if (res.success) setRestaurant(res.data)
      })
    }
  }, [id, fetchRestaurantById])

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  return (
    <div className="max-w-7xl mx-auto p-6">
      <RestaurantMiniMenu restaurant={restaurant || currentRestaurant} />
    </div>
  )
}

export default RestaurantMiniMenuPage
