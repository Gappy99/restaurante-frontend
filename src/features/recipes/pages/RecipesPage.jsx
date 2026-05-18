import { useEffect, useState } from 'react'
import { useRecipes } from '../hooks'
import { Spinner } from '../../../shared/components/Spinner'

const RecipesPage = () => {
  const { recipes, loading, error, getRecipesByRestaurant, clearError } = useRecipes()
  const [restaurantId, setRestaurantId] = useState('')

  useEffect(() => {
    return () => {
      clearError()
    }
  }, [])

  const handleFetch = async () => {
    if (!restaurantId) return
    await getRecipesByRestaurant(restaurantId)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Recetas</h1>

      <div className="mb-6 flex gap-3">
        <input
          type="text"
          placeholder="Restaurant ID"
          value={restaurantId}
          onChange={(e) => setRestaurantId(e.target.value)}
          className="px-3 py-2 border rounded-md w-80"
        />
        <button
          onClick={handleFetch}
          className="px-4 py-2 bg-zinc-900 text-white rounded-md hover:bg-black"
        >
          Cargar Recetas
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center"><Spinner /></div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : recipes && recipes.length === 0 ? (
        <div className="text-gray-600">No hay recetas.</div>
      ) : (
        <div className="space-y-4">
          {recipes?.map((r) => (
            <div key={r._id} className="p-4 border rounded-md">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-semibold">
                    {r.description || (r.dish_id ? `Receta de platillo ${typeof r.dish_id === 'object' ? (r.dish_id._id || r.dish_id) : r.dish_id}` : `Receta de bebida ${typeof r.beverage_id === 'object' ? (r.beverage_id._id || r.beverage_id) : r.beverage_id}`)}
                  </h2>
                  <p className="text-sm text-gray-500">Dificultad: {r.difficulty} · Tiempo: {r.preparation_time} min</p>
                </div>
                <div className="text-sm text-gray-400">ID: {r._id}</div>
              </div>

              <div className="mt-3">
                <h4 className="font-medium">Ingredientes ({r.ingredients?.length || 0})</h4>
                <ul className="list-disc list-inside mt-2 text-sm text-gray-700">
                  {r.ingredients?.map((ing) => {
                    const inv = typeof ing.inventory_id === 'object'
                      ? (ing.inventory_id.item_name || ing.inventory_id.name || ing.inventory_id._id)
                      : ing.inventory_id
                    const key = ing._id || `${typeof inv === 'object' ? JSON.stringify(inv) : inv}-${ing.quantity}`
                    return (
                      <li key={key}>
                        {inv} — {ing.quantity} {ing.unit}
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RecipesPage
