// Dishes Hooks
export {
  useDishes,
  useDish,
  useSaveDish,
  useDeleteDish,
  useSearchDishes,
  useDishesByType,
} from './hooks/index.js'

// Dishes Services
export {
  createDishService,
  getDishesByRestaurantService,
  getDishByIdService,
  updateDishService,
  deleteDishService,
  searchDishesByNameService,
} from './services/DishService.js'

// Dishes Store
export { default as useDishStore } from './store/useDishStore.js'
