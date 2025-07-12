# Courier Management System

A comprehensive mobile-first web application for managing courier services with real-time location tracking, route optimization, and order management.

## 🚀 Features

### User Authentication & Security
- **Secure Login System**: Role-based authentication (Customer, Courier, Admin)
- **Session Management**: Automatic session timeout and secure logout
- **Demo Accounts**: Pre-configured test accounts for all user types

### Order Management
- **Order Creation**: Intuitive interface for customers to create delivery orders
- **Location Selection**: Google Maps integration for precise pickup and delivery locations
- **Real-time Pricing**: Dynamic pricing based on distance with promo code support
- **Order Tracking**: Real-time status updates and order history

### Google Maps Integration
- **Location Search**: Autocomplete search with Google Places API
- **Route Display**: Interactive route visualization for couriers
- **Current Location**: GPS-based location detection and tracking
- **Navigation**: Direct integration with Google Maps navigation

### Courier Interface
- **Order Acceptance**: Couriers can accept available orders
- **Route Visualization**: Real-time route display with current location
- **Status Updates**: Easy order status management (Pickup → In Transit → Delivered)
- **Navigation**: One-click navigation to pickup/delivery locations

### Real-time Features
- **Live Location Tracking**: GPS-based courier location monitoring
- **Order Notifications**: Instant notifications for new orders and status changes
- **Real-time Updates**: Live order status and location updates

### Admin Dashboard
- **Order Management**: Complete order oversight and management
- **User Management**: Customer and courier account management
- **Analytics**: Order statistics and performance metrics
- **System Configuration**: Pricing rules and promo code management

## 🛠️ Technical Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions
- **Radix UI**: Accessible component primitives

### Maps & Location
- **Google Maps API**: Primary mapping and location services
- **Google Places API**: Location search and autocomplete
- **Google Directions API**: Route calculation and optimization
- **Geolocation API**: Browser-based location services

### State Management
- **React Context**: Global state management
- **Zustand**: Lightweight state management for complex data
- **Local Storage**: Persistent data storage

### Internationalization
- **i18next**: Multi-language support
- **React i18next**: React integration for translations

## 📱 Mobile-First Design

The application is designed with mobile users in mind:
- **Responsive Design**: Optimized for all screen sizes
- **Touch-Friendly**: Large touch targets and intuitive gestures
- **Offline Capability**: Basic functionality without internet connection
- **PWA Ready**: Progressive Web App features

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Maps API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd courier-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   VITE_API_BASE_URL=http://localhost:3001/api
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   ```

## 🔑 API Configuration

### Google Maps API Setup

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Required APIs**
   - Maps JavaScript API
   - Places API
   - Directions API
   - Geocoding API

3. **Create API Key**
   - Go to Credentials → Create Credentials → API Key
   - Restrict the key to your domain for security

4. **Set Environment Variable**
   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

## � Demo Accounts

The application comes with pre-configured demo accounts:

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: System Administrator

### Customer Account
- **Username**: `musteri1`
- **Password**: `musteri123`
- **Role**: Customer

### Courier Account
- **Username**: `kurye1`
- **Password**: `kurye123`
- **Role**: Courier

## � Usage Guide

### For Customers

1. **Login**: Use customer credentials to access the system
2. **Create Order**: 
   - Fill in order details
   - Select pickup and delivery locations using Google Maps
   - Apply promo codes if available
   - Submit order
3. **Track Order**: Monitor order status and courier location
4. **Rate Service**: Provide feedback after delivery

### For Couriers

1. **Login**: Use courier credentials to access the system
2. **View Available Orders**: See pending orders in your area
3. **Accept Orders**: Click to accept orders you want to deliver
4. **View Route**: Use the route view to see optimal delivery path
5. **Update Status**: Mark orders as picked up, in transit, or delivered
6. **Navigate**: Use integrated navigation to reach destinations

### For Administrators

1. **Login**: Use admin credentials to access the system
2. **Monitor Orders**: View all orders and their current status
3. **Manage Users**: Add, edit, or remove customer and courier accounts
4. **Configure System**: Set pricing rules and manage promo codes
5. **View Analytics**: Access order statistics and performance metrics

## 🔧 Configuration

### Pricing Rules
Configure distance-based pricing in `src/config/settings.js`:
```javascript
DEFAULT_PRICING: [
  { minDistance: 0, maxDistance: 3, price: 10 },
  { minDistance: 3, maxDistance: 10, price: 15 },
  { minDistance: 10, maxDistance: 20, price: 25 },
  { minDistance: 20, maxDistance: 50, price: 40 },
]
```

### Promo Codes
Manage promotional codes in the same file:
```javascript
DEFAULT_PROMO_CODES: [
  { code: 'WELCOME10', discount: 10, type: 'percentage', maxUses: 100 },
  { code: 'FIRST5', discount: 5, type: 'fixed', maxUses: 50 },
]
```

## 🌐 Internationalization

The application supports multiple languages through i18next:
- **English**: Default language
- **Turkish**: Full translation support
- **Russian**: Partial translation support

Add new languages by creating translation files in `src/i18n/`.

## � Security Features

- **Input Validation**: All user inputs are validated
- **XSS Protection**: Sanitized data rendering
- **CSRF Protection**: Built-in CSRF token handling
- **Secure Storage**: Encrypted local storage for sensitive data
- **API Key Protection**: Environment variable-based API key management

## 📊 Performance Optimization

- **Code Splitting**: Automatic route-based code splitting
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Optimized images and icons
- **Caching**: Intelligent caching strategies
- **Bundle Optimization**: Minified and compressed assets

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## 📦 Deployment

### Vercel Deployment
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify Deployment
1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables

### Docker Deployment
```bash
# Build Docker image
docker build -t courier-system .

# Run container
docker run -p 3000:3000 courier-system
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## � Changelog

### Version 2.0.0
- ✅ Google Maps API integration
- ✅ Real-time location tracking
- ✅ Enhanced route visualization
- ✅ Mobile-optimized interface
- ✅ Improved notification system

### Version 1.0.0
- ✅ Basic order management
- ✅ User authentication
- ✅ Yandex Maps integration
- ✅ Admin dashboard

---

**Built with ❤️ for efficient courier management** 