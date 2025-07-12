import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, Truck, LogOut, Bell, MapPin, Navigation, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import CourierRouteView from '@/components/CourierRouteView';

const CourierDashboard = () => {
  const { user, logout } = useAuth();
  const { orders, acceptOrder, updateOrderStatus } = useOrders();
  const { getUnreadCount, sendNotification } = useNotifications();
  const { t } = useTranslation();
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const availableOrders = orders.filter(order => order.status === 'pending');
  const myOrders = orders.filter(order => order.courierId === user.id);

  const handleAcceptOrder = (orderId) => {
    acceptOrder(orderId, user.id, user.name); // Bu zaten OrderContext'te çevrili toast gösteriyor olabilir
    // Müşteriye özel bildirim (OrderContext'teki acceptOrder içinde de yapılabilir)
    const order = orders.find(o => o.id === orderId);
    if (order && order.customerId) { // Müşteri ID'si varsa
        sendNotification(
            'customer', // Hedef rol customer
            'notification.order_accepted_title', // Yeni çeviri anahtarı
            'notification.order_accepted_by_courier_description', // Yeni çeviri anahtarı
            { courierName: user.name, orderId: order.id },
            'info'
        );
    }
  };

  const handleStatusUpdate = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus); // Bu zaten OrderContext'te çevrili toast gösteriyor olabilir
    
    const order = orders.find(o => o.id === orderId);
    if (order && order.customerId) { // Müşteri ID'si varsa
        const notificationMap = {
        'in-transit': { titleKey: 'notification.order_updated_title', messageKey: 'notification.order_in_transit_customer_description', params: {orderId: order.id} },
        'delivered': { titleKey: 'notification.order_updated_title', messageKey: 'notification.order_delivered_customer_description', params: {orderId: order.id} },
        };

        if (notificationMap[newStatus]) {
        sendNotification(
            'customer',
            notificationMap[newStatus].titleKey,
            notificationMap[newStatus].messageKey,
            notificationMap[newStatus].params,
            'info'
        );
        }
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
      case 'pending': return 'status-pending'; // Bu class'lar CSS'te tanımlı olmalı
      case 'accepted': return 'status-accepted';
      case 'in-transit': return 'status-in-transit';
      case 'delivered': return 'status-delivered';
      default: return 'status-pending';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString(t('locale_code', 'ru-RU'));
  };


  return (
    <>
      <Helmet>
        <title>{t('courier.dashboard.helmet_title', 'Панель Курьера - Система Управления Курьерами')}</title>
        <meta name="description" content={t('courier.dashboard.helmet_description', 'Управляйте и отслеживайте курьерские заказы')} />
      </Helmet>

      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{t('courier.dashboard.welcome_title', { name: user.name })}</h1>
              <p className="text-gray-300">{t('courier.dashboard.welcome_description')}</p>
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
              <Button variant="outline" onClick={logout} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <LogOut className="w-4 h-4 mr-2" />{t('logout.button')}
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <Card className="glass-effect border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between"><div><p className="text-sm text-gray-300">{t('courier.stats.available_orders')}</p><p className="text-2xl font-bold text-white">{availableOrders.length}</p></div><Package className="w-8 h-8 text-blue-400" /></div>
              </CardContent>
            </Card>
            <Card className="glass-effect border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between"><div><p className="text-sm text-gray-300">{t('courier.stats.my_orders')}</p><p className="text-2xl font-bold text-white">{myOrders.length}</p></div><Truck className="w-8 h-8 text-purple-400" /></div>
              </CardContent>
            </Card>
            <Card className="glass-effect border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between"><div><p className="text-sm text-gray-300">{t('courier.stats.active_deliveries')}</p><p className="text-2xl font-bold text-white">{myOrders.filter(o => ['accepted', 'in-transit'].includes(o.status)).length}</p></div><Clock className="w-8 h-8 text-yellow-400" /></div>
              </CardContent>
            </Card>
            <Card className="glass-effect border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between"><div><p className="text-sm text-gray-300">{t('courier.stats.completed')}</p><p className="text-2xl font-bold text-white">{myOrders.filter(o => o.status === 'delivered').length}</p></div><CheckCircle className="w-8 h-8 text-green-400" /></div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card className="glass-effect border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">{t('courier.available_orders.title')}</CardTitle>
                  <CardDescription className="text-gray-300">{t('courier.available_orders.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {availableOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-400">{t('courier.available_orders.no_orders')}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {availableOrders.map((order, index) => (
                        <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="order-card bg-white/5 p-4 rounded-lg">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-white">{t('order.id', {id: order.id})}</h3>
                              <p className="text-sm text-gray-300">{order.description}</p>
                              <p className="text-xs text-gray-400">{t('order.customer_label', 'Клиент')}: {order.customerName}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-400">{order.price} {t('currency.rub', 'RUB')}</p>
                              <p className="text-xs text-gray-400">{order.distance} {t('unit.km', 'км')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <MapPin className="w-4 h-4 text-blue-400" />
                            <span className="text-sm text-gray-300">{order.distance} {t('unit.km', 'км')} {t('order.distance_label_suffix', 'расстояние')}</span>
                          </div>
                          <Button onClick={() => handleAcceptOrder(order.id)} className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                            {t('courier.available_orders.accept_button')}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <Card className="glass-effect border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">{t('courier.my_orders.title')}</CardTitle>
                  <CardDescription className="text-gray-300">{t('courier.my_orders.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {myOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <Truck className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-400">{t('courier.my_orders.no_orders')}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myOrders.map((order, index) => (
                        <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="order-card bg-white/5 p-4 rounded-lg">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-white">{t('order.id', {id: order.id})}</h3>
                              <p className="text-sm text-gray-300">{order.description}</p>
                              <p className="text-xs text-gray-400">{t('order.customer_label', 'Клиент')}: {order.customerName}</p>
                              <p className="text-xs text-gray-400">{t('order.date_created_label', 'Создан')}: {formatDate(order.createdAt)}</p>
                            </div>
                            <span className={`status-badge ${getStatusClass(order.status)} inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1">{getStatusText(order.status)}</span>
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                            <div><p className="text-gray-400">{t('order.price')}</p><p className="text-white">{order.price} {t('currency.rub', 'RUB')}</p></div>
                            <div><p className="text-gray-400">{t('order.distance')}</p><p className="text-white">{order.distance} {t('unit.km', 'км')}</p></div>
                          </div>
                          <div className="flex gap-2">
                            {['accepted', 'in-transit'].includes(order.status) && (
                              <Button
                                onClick={() => setSelectedOrder(order)}
                                variant="outline"
                                size="sm"
                                className="flex-1 bg-blue-500/20 border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
                              >
                                <Navigation className="w-4 h-4 mr-1" />
                                {t('courier.view_route')}
                              </Button>
                            )}
                            {order.status !== 'delivered' && (
                              <Select value={order.status} onValueChange={(value) => handleStatusUpdate(order.id, value)}>
                                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                  <SelectValue placeholder={getStatusText(order.status)} />
                                </SelectTrigger>
                                <SelectContent>
                                  {order.status === 'pending' && <SelectItem value="accepted">{t('order.status.accepted')}</SelectItem>}
                                  {order.status === 'accepted' && <SelectItem value="in-transit">{t('order.status.in_transit')}</SelectItem>}
                                  {order.status === 'in-transit' && <SelectItem value="delivered">{t('order.status.delivered')}</SelectItem>}
                                  {order.status !== 'delivered' && order.status !== 'in-transit' && order.status !== 'accepted' && <SelectItem value="accepted" disabled>{t('order.status.accepted')}</SelectItem>}
                                  {order.status !== 'delivered' && order.status !== 'in-transit' && <SelectItem value="in-transit" disabled={order.status === 'pending'}>{t('order.status.in_transit')}</SelectItem>}
                                  {order.status !== 'delivered' && <SelectItem value="delivered" disabled={order.status === 'pending'}>{t('order.status.delivered')}</SelectItem>}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
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

      {/* Route View Modal */}
      {selectedOrder && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {t('courier.route_view_title', { id: selectedOrder.id })}
                </h2>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedOrder(null)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <CourierRouteView
                order={selectedOrder}
                onStatusUpdate={handleStatusUpdate}
                onNavigate={() => setSelectedOrder(null)}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default CourierDashboard;