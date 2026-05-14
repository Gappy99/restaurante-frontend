import adminClient from '../../../shared/api/adminClient';

// Crear receta
export const createRecipe = async (data) => {
  try {
    const response = await adminClient.post('/recipe', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener receta por platillo
export const getRecipeByDish = async (dishId) => {
  try {
    const response = await adminClient.get(`/recipe/dish/${dishId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener receta por bebida
export const getRecipeByBeverage = async (beverageId) => {
  try {
    const response = await adminClient.get(`/recipe/beverage/${beverageId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener todas las recetas de un restaurante
export const getRecipesByRestaurant = async (restaurantId) => {
  try {
    const response = await adminClient.get(`/recipe/restaurant/${restaurantId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener receta por ID
export const getRecipeById = async (id) => {
  try {
    const response = await adminClient.get(`/recipe/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Actualizar receta
export const updateRecipe = async (id, data) => {
  try {
    const response = await adminClient.put(`/recipe/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Eliminar receta
export const deleteRecipe = async (id) => {
  try {
    const response = await adminClient.delete(`/recipe/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Agregar ingrediente a receta
export const addIngredientToRecipe = async (recipeId, ingredientData) => {
  try {
    const response = await adminClient.post(`/recipe/${recipeId}/ingredients`, ingredientData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Remover ingrediente de receta
export const removeIngredientFromRecipe = async (recipeId, ingredientId) => {
  try {
    const response = await adminClient.delete(`/recipe/${recipeId}/ingredients/${ingredientId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Actualizar ingrediente en receta
export const updateIngredientInRecipe = async (recipeId, ingredientId, ingredientData) => {
  try {
    const response = await adminClient.put(
      `/recipe/${recipeId}/ingredients/${ingredientId}`,
      ingredientData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
