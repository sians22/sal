// Application Configuration
export const APP_CONFIG = {
  // Yandex Maps API Configuration
  YANDEX_MAPS: {
    API_KEY: import.meta.env.VITE_YANDEX_MAPS_API_KEY || 'your-yandex-maps-api-key',
    LANGUAGE: 'tr_TR', // Turkish language
    CENTER: [41.0082, 28.9784], // Istanbul coordinates
    ZOOM: 10,
  },

  // Default Pricing Rules (in TL)
  DEFAULT_PRICING: [
    { minDistance: 0, maxDistance: 3, price: 10 },
    { minDistance: 3, maxDistance: 10, price: 15 },
    { minDistance: 10, maxDistance: 20, price: 25 },
    { minDistance: 20, maxDistance: 50, price: 40 },
  ],

  // Default Promo Codes
  DEFAULT_PROMO_CODES: [
    { code: 'WELCOME10', discount: 10, type: 'percentage', maxUses: 100, usedCount: 0 },
    { code: 'FIRST5', discount: 5, type: 'fixed', maxUses: 50, usedCount: 0 },
  ],

  // Site Settings
  SITE_SETTINGS: {
    siteName: 'Kurye Yönetim Sistemi',
    siteTheme: 'default',
    siteLogo: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6',
  },

  // Order Status Configuration
  ORDER_STATUS: {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    IN_TRANSIT: 'in-transit',
    DELIVERED: 'delivered',
  },

  // User Roles
  USER_ROLES: {
    ADMIN: 'admin',
    CUSTOMER: 'customer',
    COURIER: 'courier',
  },

  // Notification Types
  NOTIFICATION_TYPES: {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
  },

  // Delivery Time Estimation (in minutes)
  DELIVERY_TIME: {
    BASE_TIME: 15, // Base pickup time
    TIME_PER_KM: 2, // Additional time per kilometer
  },

  // Local Storage Keys
  STORAGE_KEYS: {
    USERS: 'users',
    ORDERS: 'orders',
    PRICING_RULES: 'pricingRules',
    PROMO_CODES: 'promoCodes',
    RATINGS: 'ratings',
    SITE_SETTINGS: 'siteSettings',
    CURRENT_USER: 'currentUser',
    NOTIFICATIONS: 'notifications',
  },

  // Demo Users (for testing)
  DEMO_USERS: [
    {
      id: '1',
      username: 'admin',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin',
    },
    {
      id: '2',
      username: 'customer',
      password: 'customer123',
      name: 'Test Customer',
      role: 'customer',
    },
    {
      id: '3',
      username: 'courier',
      password: 'courier123',
      name: 'Test Courier',
      role: 'courier',
    },
  ],

  // App Features Configuration
  FEATURES: {
    ENABLE_PROMO_CODES: true,
    ENABLE_RATINGS: true,
    ENABLE_NOTIFICATIONS: true,
    ENABLE_REAL_TIME_UPDATES: true,
    ENABLE_MOBILE_OPTIMIZATION: true,
  },

  // API Endpoints (for future backend integration)
  API_ENDPOINTS: {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
    ORDERS: '/orders',
    USERS: '/users',
    NOTIFICATIONS: '/notifications',
    RATINGS: '/ratings',
  },

  // Mobile App Configuration
  MOBILE_CONFIG: {
    ENABLE_PUSH_NOTIFICATIONS: true,
    ENABLE_LOCATION_TRACKING: true,
    ENABLE_OFFLINE_MODE: true,
  },

  // Security Configuration
  SECURITY: {
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    PASSWORD_MIN_LENGTH: 6,
    ENABLE_2FA: false, // Two-factor authentication
  },

  // Performance Configuration
  PERFORMANCE: {
    DEBOUNCE_DELAY: 300, // milliseconds
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    MAX_ORDERS_PER_PAGE: 20,
  },
};

// Environment-specific configurations
export const getConfig = () => {
  const env = import.meta.env.MODE;
  
  switch (env) {
    case 'development':
      return {
        ...APP_CONFIG,
        DEBUG: true,
        LOG_LEVEL: 'debug',
      };
    case 'production':
      return {
        ...APP_CONFIG,
        DEBUG: false,
        LOG_LEVEL: 'error',
      };
    default:
      return APP_CONFIG;
  }
};

// Helper functions
export const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(price);
};

export const formatDistance = (distance) => {
  return `${distance.toFixed(2)} km`;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleString('tr-TR');
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[\+]?[1-9][\d]{0,15}$/;
  return re.test(phone.replace(/\s/g, ''));
};

export default APP_CONFIG; 