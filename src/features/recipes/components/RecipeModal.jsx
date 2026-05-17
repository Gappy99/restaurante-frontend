import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useRecipes } from '../hooks';
import { getInventoryByRestaurantService } from '../../inventory/services/InventoryService';
import { Spinner } from '../../../shared/components/Spinner';

export const RecipeModal = ({ isOpen, onClose, productId, productType, restaurantId }) => {
  const { createRecipe, addIngredient, loading } = useRecipes();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      description: '',
      preparation_time: 0,
      difficulty: 'Medio',
    }
  });

  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [currentIngredient, setCurrentIngredient] = useState({
    inventory_id: '',
    quantity: '',
    unit: ''
  });
  const [fetchingInventory, setFetchingInventory] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [recipeId, setRecipeId] = useState(null);

  // Cargar inventario del restaurante
  useEffect(() => {
    if (isOpen && restaurantId) {
      loadInventory();
    }
  }, [isOpen, restaurantId]);

  const loadInventory = async () => {
    setFetchingInventory(true);
    try {
      const response = await getInventoryByRestaurantService(restaurantId);
      setInventoryItems(response.data || response || []);
    } catch (error) {
      console.error('Error al cargar inventario:', error);
      toast.error('No se pudo cargar el inventario');
      setInventoryItems([]);
    } finally {
      setFetchingInventory(false);
    }
  };

  const onSubmitRecipe = async (data) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      if (!productId || !productType) {
        toast.error('Error: Falta ID o tipo de producto');
        setSubmitting(false);
        return;
      }

      // Preparar datos de la receta
      const recipeData = {
        ...(productType === 'dish' ? { dish_id: productId } : { beverage_id: productId }),
        restaurant_id: restaurantId,
        description: data.description || null,
        preparation_time: parseInt(data.preparation_time) || 0,
        difficulty: data.difficulty,
        ingredients: selectedIngredients,
      };

      // Debug: mostrar payload antes de enviarlo al servidor
      console.log('[RecipeModal] recipeData:', recipeData);

      // Crear receta
      const newRecipe = await createRecipe(recipeData);
      setRecipeId(newRecipe._id);
      toast.success('Receta creada exitosamente');
      
      // Limpiar formulario
      reset();
      setSelectedIngredients([]);
      setCurrentIngredient({
        inventory_id: '',
        quantity: '',
        unit: ''
      });
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error al crear receta:', error);
      toast.error(error?.response?.data?.message || 'Error al crear la receta');
    } finally {
      setSubmitting(false);
    }
  };

  const addIngredientToList = () => {
    if (!currentIngredient.inventory_id || !currentIngredient.quantity) {
      toast.error('Completa todos los campos del ingrediente');
      return;
    }

    // Verificar si el ingrediente ya existe
    const exists = selectedIngredients.some(
      i => i.inventory_id === currentIngredient.inventory_id
    );
    if (exists) {
      toast.error('Este ingrediente ya está agregado');
      return;
    }

    setSelectedIngredients([
      ...selectedIngredients,
      {
        ...currentIngredient,
        unit: getInventoryItemUnit(currentIngredient.inventory_id),
        quantity: parseFloat(currentIngredient.quantity)
      }
    ]);

    setCurrentIngredient({
      inventory_id: '',
      quantity: '',
      unit: ''
    });

    toast.success('Ingrediente agregado');
  };

  const removeIngredient = (index) => {
    setSelectedIngredients(
      selectedIngredients.filter((_, i) => i !== index)
    );
    toast.success('Ingrediente removido');
  };

  const getInventoryItemName = (id) => {
    const item = inventoryItems.find(i => i._id === id || i.id === id);
    return item?.item_name || item?.name || 'Desconocido';
  };

  const getInventoryItemUnit = (id) => {
    const item = inventoryItems.find(i => i._id === id || i.id === id);
    return item?.unit || '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            Agregar Receta - {productType === 'dish' ? 'Platillo' : 'Bebida'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-orange-700 rounded-full w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmitRecipe)} className="p-6 space-y-6">
          {/* Descripción */}
          <div>
            <textarea
              aria-label="Descripción (opcional)"
              {...register('description')}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Describe los pasos de preparación..."
            />
          </div>

          {/* Tiempo de preparación y Dificultad */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                aria-label="Tiempo de preparación (minutos)"
                type="number"
                {...register('preparation_time')}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="0"
              />
            </div>

            <div>
              <select
                aria-label="Dificultad"
                {...register('difficulty')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="Fácil">Fácil</option>
                <option value="Medio">Medio</option>
                <option value="Difícil">Difícil</option>
              </select>
            </div>
          </div>

          {/* Sección de Ingredientes */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Ingredientes</h3>

            {/* Cargar ingredientes */}
            {fetchingInventory ? (
              <div className="flex justify-center p-4">
                <Spinner />
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                {/* Selector de inventario */}
                <div>
                  <select
                    aria-label="Selecciona un ingrediente"
                    value={currentIngredient.inventory_id}
                    onChange={(e) =>
                      setCurrentIngredient({
                        ...currentIngredient,
                        inventory_id: e.target.value,
                        unit: getInventoryItemUnit(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">-- Selecciona un ingrediente --</option>
                    {inventoryItems.map((item) => (
                      <option key={item._id || item.id} value={item._id || item.id}>
                        {item.item_name || item.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cantidad y Unidad */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      aria-label="Cantidad"
                      type="number"
                      step="0.01"
                      value={currentIngredient.quantity}
                      onChange={(e) =>
                        setCurrentIngredient({
                          ...currentIngredient,
                          quantity: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <input
                      aria-label="Unidad"
                      type="text"
                      value={currentIngredient.unit}
                      readOnly
                      placeholder="Selecciona un ingrediente"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Botón agregar */}
                <button
                  type="button"
                  onClick={addIngredientToList}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-md transition-colors"
                >
                  Agregar Ingrediente
                </button>
              </div>
            )}

            {/* Lista de ingredientes agregados */}
            {selectedIngredients.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-800 mb-3">
                  Ingredientes agregados ({selectedIngredients.length})
                </h4>
                <div className="space-y-2">
                  {selectedIngredients.map((ingredient, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-100 p-3 rounded-md"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {getInventoryItemName(ingredient.inventory_id)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {ingredient.quantity} {ingredient.unit}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="text-red-500 hover:text-red-700 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedIngredients.length === 0 && !fetchingInventory && (
              <p className="text-gray-500 text-sm italic">
                No hay ingredientes agregados. Agrega al menos uno.
              </p>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || submitting || selectedIngredients.length === 0}
              className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors flex items-center justify-center gap-2"
            >
              {loading || submitting ? (
                <>
                  <Spinner size="sm" />
                  Guardando...
                </>
              ) : (
                'Guardar Receta'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
