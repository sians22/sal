
    import React, { Suspense } from 'react';
    import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
    import { Helmet } from 'react-helmet';
    import { Toaster } from '@/components/ui/toaster';
    import { AuthProvider, useAuth } from '@/contexts/AuthContext';
    import { OrderProvider } from '@/contexts/OrderContext';
    import { NotificationProvider } from '@/contexts/NotificationContext';
    import { AddressProvider } from '@/contexts/AddressContext'; // AddressProvider import edildi
    import LoginPage from '@/pages/LoginPage';
    import CustomerDashboard from '@/pages/CustomerDashboard';
    import CourierDashboard from '@/pages/CourierDashboard';
    import AdminDashboard from '@/pages/AdminDashboard';
    import CreateOrder from '@/pages/CreateOrder';
    import LanguageSwitcher from '@/components/LanguageSwitcher';
    import { useTranslation } from 'react-i18next';
    import './i18n';
    
    function ProtectedRoute({ children, allowedRoles }) {
      const { user, isAuthenticated } = useAuth();
      
      if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
      }
      
      if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/login" replace />;
      }
      
      return children;
    }
    
    function AppRoutes() {
      const { user, isAuthenticated } = useAuth();
      
      return (
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                <Navigate to={`/${user.role}`} replace /> : 
                <LoginPage />
            } 
          />
          
          <Route 
            path="/customer" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/customer/create-order" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CreateOrder />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/courier" 
            element={
              <ProtectedRoute allowedRoles={['courier']}>
                <CourierDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
                <Navigate to={`/${user.role}`} replace /> : 
                <Navigate to="/login" replace />
            } 
          />
        </Routes>
      );
    }
    
    function App() {
      const { t } = useTranslation();
    
      return (
        <Router>
          <Helmet>
            <title>{t('site.title')}</title>
            <meta name="description" content={t('site.description')} />
          </Helmet>
          
          <AuthProvider>
            <OrderProvider>
              <NotificationProvider>
                <AddressProvider> {/* AddressProvider eklendi */}
                  <Suspense fallback={<div>Loading...</div>}>
                    <div className="min-h-screen">
                      <div className="absolute top-4 right-4 z-50">
                       <LanguageSwitcher />
                    </div>
                    <AppRoutes />
                    <Toaster />
                  </div>
                </Suspense>
                </AddressProvider> {/* AddressProvider kapatıldı */}
              </NotificationProvider>
            </OrderProvider>
          </AuthProvider>
        </Router>
      );
    }
    
    export default App;
  