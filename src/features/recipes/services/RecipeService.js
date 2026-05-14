import {
  createRecipe as createRecipeRequest,
  getRecipeByDish as getRecipeByDishRequest,
  getRecipeByBeverage as getRecipeByBeverageRequest,
  getRecipesByRestaurant as getRecipesByRestaurantRequest,
  getRecipeById as getRecipeByIdRequest,
  updateRecipe as updateRecipeRequest,
  deleteRecipe as deleteRecipeRequest,
  addIngredientToRecipe as addIngredientToRecipeRequest,
  removeIngredientFromRecipe as removeIngredientFromRecipeRequest,
  updateIngredientInRecipe as updateIngredientInRecipeRequest,
} from '../Api/recipeAdmin';

// Crear receta
export const createRecipeService = async (data) => {
  try {
    const response = await createRecipeRequest(data);
    return response.data;
  } catch (error) {
    console.error('[RecipeService] Error creating recipe:', error?.response?.data || error?.message);
    throw error;
  }
};

// Obtener receta por platillo
export const getRecipeByDishService = async (dishId) => {
  try {
    const response = await getRecipeByDishRequest(dishId);
    return response.data;
  } catch (error) {
    console.error('[RecipeService] Error getting recipe by dish:', error?.response?.data || error?.message);
    throw error;
  }
};

// Obtener receta por bebida
export const getRecipeByBeverageService = async (beverageId) => {
  try {
    const response = await getRecipeByBeverageRequest(beverageId);
    return response.data;
  } catch (error) {
    console.error('[RecipeService] Error getting recipe by beverage:', error?.response?.data || error?.message);
    throw error;
  }
};

// Obtener todas las recetas de un restaurante
export const getRecipesByRestaurantService = async (restaurantId) => {
  try {
    const response = await getRecipesByRestaurantRequest(restaurantId);
    return response.data;
  } catch (error) {
    console.error('[RecipeService] Error getting recipes by restaurant:', error?.response?.data || error?.message);
    throw error;
  }
};

// Obtener receta por ID
export const getRecipeByIdService = async (id) => {
  try {
    const response = await getRecipeByIdRequest(id);
    return response.data;
  } catch (error) {
    console.error('[RecipeService] Error getting recipe by id:', error?.response?.data || error?.message);
    throw error;
  }
};

// Actualizar receta
export const updateRecipeService = async (id, data) => {
  try {
    const response = await updateRecipeRequest(id, data);
    return response.data;
  } catch (error) {
    console.error('[RecipeService] Error updating recipe:', error?.response?.data || error?.message);
    throw error;
  }
};

// Eliminar receta
export const deleteRecipeService = async (id) => {
  try {
    const response = await deleteRecipeRequest(id);
    return response.data;
  } catch (error) {
    console.error('[RecipeService] Error deleting recipe:', error?.response?.data || error?.message);
    throw error;
  }
};

// Agregar ingrediente a receta
export const addIngredientToRecipeService = async (recipeId, ingredientData) => {
  try {
    const response = await addIngredientToRecipeRequest(recipeId, ingredientData);
    return response.data;
  } catch (error) {
    console.error('[RecipeService] Error adding ingredient:', error?.response?.data || error?.message);
    throw error;
  }
};

// Remover ingrediente de receta
export const removeIngredientFromRecipeService = async (recipeId, ingredientId) => {
  try {
    const response = await removeIngredientFromRecipeRequest(recipeId, ingredientId);
    return response.data;
  } catch (error) {
    console.error('[RecipeService] Error removing ingredient:', error?.response?.data || error?.message);
    throw error;
  }
};

// Actualizar ingrediente en receta
export const updateIngredientInRecipeService = async (recipeId, ingredientId, ingredientData) => {
  try {
    const response = await updateIngredientInRecipeRequest(recipeId, ingredientId, ingredientData);
    return response.data;
  } catch (error) {
    console.error('[RecipeService] Error updating ingredient:', error?.response?.data || error?.message);
    throw error;
  }
};
