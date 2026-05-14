import { useRecipeStore } from '../store/useRecipeStore';

export const useRecipes = () => {
  const {
    recipes,
    currentRecipe,
    loading,
    error,
    createRecipe,
    getRecipeByDish,
    getRecipeByBeverage,
    getRecipesByRestaurant,
    updateRecipe,
    deleteRecipe,
    addIngredient,
    removeIngredient,
    updateIngredient,
    clearError,
    resetCurrentRecipe,
  } = useRecipeStore();

  return {
    recipes,
    currentRecipe,
    loading,
    error,
    createRecipe,
    getRecipeByDish,
    getRecipeByBeverage,
    getRecipesByRestaurant,
    updateRecipe,
    deleteRecipe,
    addIngredient,
    removeIngredient,
    updateIngredient,
    clearError,
    resetCurrentRecipe,
  };
};
