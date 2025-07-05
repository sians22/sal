
    import React from 'react';
    import { motion } from 'framer-motion';
    import { useOrders } from '@/contexts/OrderContext';
    import { Package, Clock, CheckCircle, Truck, MapPin } from 'lucide-react';
    import { useTranslation } from 'react-i18next';
    
    const OrderManagementTab = () => {
      const { orders } = useOrders();
      const { t } = useTranslation();
    
      const getStatusIcon = (status) => {
        switch (status) {
          case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />;
          case 'accepted':
          case 'in-transit': return <Truck className="w-4 h-4 text-blue-400" />;
          case 'delivered': return <CheckCircle className="w-4 h-4 text-green-400" />;
          default: return <Package className="w-4 h-4 text-gray-400" />;
        }
      };
    
      const getStatusText = (status) => {
        return t(`order.status.${status}`);
      };
    
      const getStatusClass = (status) => {
        switch (status) {
          case 'pending': return 'bg-yellow-500/10 text-yellow-400';
          case 'accepted': return 'bg-blue-500/10 text-blue-400';
          case 'in-transit': return 'bg-purple-500/10 text-purple-400';
          case 'delivered': return 'bg-green-500/10 text-green-400';
          default: return 'bg-gray-500/10 text-gray-400';
        }
      };
    
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-semibold text-white">Sipariş Yönetimi</h2>
          
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-10">
                <Package className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                <p className="text-gray-400">Henüz hiç sipariş yok.</p>
              </div>
            ) : (
              orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/5 p-4 rounded-lg border border-white/10"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-white">{t('order.id', { id: order.id })}</h3>
                      <p className="text-sm text-gray-300">{order.description}</p>
                      <p className="text-xs text-gray-400">Müşteri: {order.customerName}</p>
                    </div>
                    <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full ${getStatusClass(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span>{getStatusText(order.status)}</span>
                    </div>
                  </div>
    
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-gray-400">Tarih</p>
                      <p className="text-white">{new Date(order.createdAt).toLocaleString('tr-TR')}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Kurye</p>
                      <p className="text-white">{order.courierName || t('order.courier.unassigned')}</p>
                    </div>
                     <div>
                      <p className="text-gray-400">Mesafe</p>
                      <p className="text-white">{order.distance} km</p>
                    </div>
                     <div>
                      <p className="text-gray-400">Fiyat</p>
                      <p className="text-white font-semibold">{order.price} TL</p>
                    </div>
                  </div>
    
                  <div className="text-xs text-gray-400 space-y-1">
                      <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-blue-400" />
                          <span>Alış: {order.pickupLocation.lat.toFixed(4)}, {order.pickupLocation.lng.toFixed(4)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-green-400" />
                          <span>Teslimat: {order.deliveryLocation.lat.toFixed(4)}, {order.deliveryLocation.lng.toFixed(4)}</span>
                      </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      );
    };
    
    export default OrderManagementTab;
  