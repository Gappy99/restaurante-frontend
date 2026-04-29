/**
 * Barrel export principal del feature Restaurant
 * Exporta solo lo que otros features necesitan
 */

// Hooks
export {
  useRestaurants,
  useRestaurant,
  useRestaurantForm,
  useRestaurantSearch,
  useRestaurantDelete,
} from './hooks/index.js'

// Store
export { default as useRestaurantStore } from './store/useRestaurantStore.js'

// Services
export { restaurantService } from './services/restaurantService.js'

// Utils
export {
  formatRestaurantData,
  validateRestaurantForm,
  getRestaurantStatusLabel,
  sortRestaurants,
  filterRestaurants,
} from './utils/restaurantUtils.js'

// Constants
export {
  RESTAURANT_MESSAGES,
  RESTAURANT_API_ENDPOINTS,
  RESTAURANT_DEFAULTS,
  RESTAURANT_TYPES,
  GASTRONOMIC_TYPES,
  DEFAULT_TIME_START,
  DEFAULT_TIME_CLOSE,
} from './constants/restaurantConstants.js'

// Types
export { RESTAURANT_STATUS, RESTAURANT_SORT_BY } from './types/restaurant.types.js'
