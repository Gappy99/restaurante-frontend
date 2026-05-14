import { create } from 'zustand';
import {
  createRecipeService,
  getRecipeByDishService,
  getRecipeByBeverageService,
  getRecipesByRestaurantService,
  updateRecipeService,
  deleteRecipeService,
  addIngredientToRecipeService,
  removeIngredientFromRecipeService,
  updateIngredientInRecipeService,
} from '../services/RecipeService';

export const useRecipeStore = create((set, get) => ({
  recipes: [],
  currentRecipe: null,
  loading: false,
  error: null,

  // Crear receta
  createRecipe: async (data) => {
    set({ loading: true, error: null });
    try {
      const created = await createRecipeService(data);
      set((state) => ({
        recipes: [...state.recipes, created],
        loading: false,
      }));
      return created;
    } catch (error) {
      set({
        error: error?.response?.data?.message || error?.message || 'Error al crear receta',
        loading: false,
      });
      throw error;
    }
  },

  // Obtener receta por platillo
  getRecipeByDish: async (dishId) => {
    set({ loading: true, error: null });
    try {
      const recipe = await getRecipeByDishService(dishId);
      set({ currentRecipe: recipe, loading: false });
      return recipe;
    } catch (error) {
      set({
        error: error?.response?.data?.message || error?.message || 'Error al obtener receta',
        loading: false,
      });
      throw error;
    }
  },

  // Obtener receta por bebida
  getRecipeByBeverage: async (beverageId) => {
    set({ loading: true, error: null });
    try {
      const recipe = await getRecipeByBeverageService(beverageId);
      set({ currentRecipe: recipe, loading: false });
      return recipe;
    } catch (error) {
      set({
        error: error?.response?.data?.message || error?.message || 'Error al obtener receta',
        loading: false,
      });
      throw error;
    }
  },

  // Obtener todas las recetas de un restaurante
  getRecipesByRestaurant: async (restaurantId) => {
    set({ loading: true, error: null });
    try {
      const list = await getRecipesByRestaurantService(restaurantId);
      set({ recipes: list, loading: false });
      return list;
    } catch (error) {
      set({
        error: error?.response?.data?.message || error?.message || 'Error al obtener recetas',
        loading: false,
      });
      throw error;
    }
  },

  // Actualizar receta
  updateRecipe: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updated = await updateRecipeService(id, data);
      set((state) => ({
        recipes: state.recipes.map((r) => (r._id === id ? updated : r)),
        currentRecipe: updated._id === state.currentRecipe?._id ? updated : state.currentRecipe,
        loading: false,
      }));
      return updated;
    } catch (error) {
      set({
        error: error?.response?.data?.message || error?.message || 'Error al actualizar receta',
        loading: false,
      });
      throw error;
    }
  },

  // Eliminar receta
  deleteRecipe: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteRecipeService(id);
      set((state) => ({
        recipes: state.recipes.filter((r) => r._id !== id),
        currentRecipe: state.currentRecipe?._id === id ? null : state.currentRecipe,
        loading: false,
      }));
    } catch (error) {
      set({
        error: error?.response?.data?.message || error?.message || 'Error al eliminar receta',
        loading: false,
      });
      throw error;
    }
  },

  // Agregar ingrediente a receta
  addIngredient: async (recipeId, ingredientData) => {
    set({ loading: true, error: null });
    try {
      const updated = await addIngredientToRecipeService(recipeId, ingredientData);
      set((state) => ({
        currentRecipe: updated,
        recipes: state.recipes.map((r) => (r._id === recipeId ? updated : r)),
        loading: false,
      }));
      return updated;
    } catch (error) {
      set({
        error: error?.response?.data?.message || error?.message || 'Error al agregar ingrediente',
        loading: false,
      });
      throw error;
    }
  },

  // Remover ingrediente de receta
  removeIngredient: async (recipeId, ingredientId) => {
    set({ loading: true, error: null });
    try {
      const updated = await removeIngredientFromRecipeService(recipeId, ingredientId);
      set((state) => ({
        currentRecipe: updated,
        recipes: state.recipes.map((r) => (r._id === recipeId ? updated : r)),
        loading: false,
      }));
      return updated;
    } catch (error) {
      set({
        error: error?.response?.data?.message || error?.message || 'Error al remover ingrediente',
        loading: false,
      });
      throw error;
    }
  },

  // Actualizar ingrediente en receta
  updateIngredient: async (recipeId, ingredientId, ingredientData) => {
    set({ loading: true, error: null });
    try {
      const updated = await updateIngredientInRecipeService(recipeId, ingredientId, ingredientData);
      set((state) => ({
        currentRecipe: updated,
        recipes: state.recipes.map((r) => (r._id === recipeId ? updated : r)),
        loading: false,
      }));
      return updated;
    } catch (error) {
      set({
        error: error?.response?.data?.message || error?.message || 'Error al actualizar ingrediente',
        loading: false,
      });
      throw error;
    }
  },

  // Limpiar estado
  clearError: () => set({ error: null }),
  resetCurrentRecipe: () => set({ currentRecipe: null }),
}));
