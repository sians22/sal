import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, Truck, LogOut, Bell, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useTranslation } from 'react-i18next';

const CourierDashboard = () => {
  const { user, logout } = useAuth();
  const { orders, acceptOrder, updateOrderStatus } = useOrders();
  const { getUnreadCount, sendNotification } = useNotifications();
  const { t } = useTranslation();
  
  const availableOrders = orders.filter(order => order.status === 'pending');
  const myOrders = orders.filter(order => order.courierId === user.id);

  const handleAcceptOrder = (orderId) => {
    acceptOrder(orderId, user.id, user.name);
    sendNotification(
      'customer',
      'notification.order_accepted',
      'notification.order_accepted_description',
      { courierName: user.name },
      'info'
    );
  };

  const handleStatusUpdate = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
    
    const notificationMap = {
      'in-transit': { title: 'notification.order_updated', message: 'notification.order_in_transit' },
      'delivered': { title: 'notification.order_updated', message: 'notification.order_delivered' },
    };

    if (notificationMap[newStatus]) {
      sendNotification(
        'customer',
        notificationMap[newStatus].title,
        notificationMap[newStatus].message,
        {},
        'info'
      );
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'accepted': return <Truck className="w-4 h-4" />;
      case 'in-transit': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    return t(`order.status.${status}`);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'accepted': return 'status-accepted';
      case 'in-transit': return 'status-in-transit';
      case 'delivered': return 'status-delivered';
      default: return 'status-pending';
    }
  };

  return (
    <>
      <Helmet>
        <title>Kurye Paneli - Kurye Yönetim Sistemi</title>
        <meta name="description" content="Kurye siparişlerini yönetin ve takip edin" />
      </Helmet>

      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Hoş Geldiniz, {user.name}</h1>
              <p className="text-gray-300">Kurye paneline hoş geldiniz</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Button variant="outline" size="icon" className="bg-white/10 border-white/20">
                  <Bell className="w-4 h-4" />
                </Button>
                {getUnreadCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center notification-badge">
                    {getUnreadCount()}
                  </span>
                )}
              </div>
              
              <Button 
                variant="outline" 
                onClick={logout}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t('logout.button')}
              </Button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <Card className="glass-effect border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Mevcut Siparişler</p>
                    <p className="text-2xl font-bold text-white">{availableOrders.length}</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Aldığım Siparişler</p>
                    <p className="text-2xl font-bold text-white">{myOrders.length}</p>
                  </div>
                  <Truck className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Aktif Teslimatlar</p>
                    <p className="text-2xl font-bold text-white">
                      {myOrders.filter(o => ['accepted', 'in-transit'].includes(o.status)).length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Tamamlanan</p>
                    <p className="text-2xl font-bold text-white">
                      {myOrders.filter(o => o.status === 'delivered').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Available Orders */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-effect border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Mevcut Siparişler</CardTitle>
                  <CardDescription className="text-gray-300">
                    Alınmayı bekleyen siparişler
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {availableOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-400">Şu anda mevcut sipariş yok</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {availableOrders.map((order, index) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="order-card bg-white/5 p-4 rounded-lg"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-white">{t('order.id', {id: order.id})}</h3>
                              <p className="text-sm text-gray-300">{order.description}</p>
                              <p className="text-xs text-gray-400">Müşteri: {order.customerName}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-400">{order.price} TL</p>
                              <p className="text-xs text-gray-400">{order.distance} km</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <MapPin className="w-4 h-4 text-blue-400" />
                            <span className="text-sm text-gray-300">
                              {order.distance} km mesafe
                            </span>
                          </div>
                          
                          <Button 
                            onClick={() => handleAcceptOrder(order.id)}
                            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                          >
                            Siparişi Al
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* My Orders */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass-effect border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Aldığım Siparişler</CardTitle>
                  <CardDescription className="text-gray-300">
                    Sorumlu olduğunuz siparişler
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {myOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <Truck className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-400">Henüz sipariş almadınız</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myOrders.map((order, index) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="order-card bg-white/5 p-4 rounded-lg"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-white">{t('order.id', {id: order.id})}</h3>
                              <p className="text-sm text-gray-300">{order.description}</p>
                              <p className="text-xs text-gray-400">Müşteri: {order.customerName}</p>
                            </div>
                            <span className={`status-badge ${getStatusClass(order.status)}`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1">{getStatusText(order.status)}</span>
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                            <div>
                              <p className="text-gray-400">{t('order.price')}</p>
                              <p className="text-white">{order.price} TL</p>
                            </div>
                            <div>
                              <p className="text-gray-400">{t('order.distance')}</p>
                              <p className="text-white">{order.distance} km</p>
                            </div>
                          </div>
                          
                          {order.status !== 'delivered' && (
                            <Select 
                              value={order.status} 
                              onValueChange={(value) => handleStatusUpdate(order.id, value)}
                            >
                              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                <SelectValue placeholder={t(`order.status.${order.status}`)} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="accepted">{t('order.status.accepted')}</SelectItem>
                                <SelectItem value="in-transit">{t('order.status.in_transit')}</SelectItem>
                                <SelectItem value="delivered">{t('order.status.delivered')}</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourierDashboard;