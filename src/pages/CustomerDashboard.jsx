import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, Truck, LogOut, Bell, Plus, Star, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'; // DialogTrigger eklendi
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label'; // Label eklendi
// Textarea importu kaldırılacak, standart textarea kullanılacak

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const { getOrderHistory, rateOrder } = useOrders(); // getAverageRating kaldırıldı, burada kullanılmıyor
  const { getUnreadCount } = useNotifications();
  const { t } = useTranslation();
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  
  const myOrders = getOrderHistory(user.id, 'customer');
  const pendingOrders = myOrders.filter(order => order.status === 'pending');
  const inTransitOrders = myOrders.filter(order => ['accepted', 'in-transit'].includes(order.status)); // 'accepted' da yolda sayılabilir
  const deliveredOrders = myOrders.filter(order => order.status === 'delivered');

  const handleOpenRatingDialog = (order) => { // order objesini alacak şekilde güncellendi
    setSelectedOrder(order);
    setRating(order.rating || 5); // Mevcut rating varsa onu göster
    setRatingComment(order.ratingComment || ''); // Mevcut yorum varsa onu göster
    setShowRatingDialog(true);
  };

  const submitRating = () => {
    if (selectedOrder) {
      rateOrder(selectedOrder.id, rating, ratingComment);
      setShowRatingDialog(false);
      // State'i sıfırlamaya gerek yok, bir sonraki açılışta yeniden set edilecek.
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
      case 'pending': return 'bg-yellow-500/20 text-yellow-300';
      case 'accepted': return 'bg-blue-500/20 text-blue-300';
      case 'in-transit': return 'bg-orange-500/20 text-orange-300';
      case 'delivered': return 'bg-green-500/20 text-green-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString(t('locale_code', 'ru-RU')); // i18n'den locale kodu alınabilir
  };

  return (
    <>
      <Helmet>
        <title>{t('dashboard.customer.title')}</title>
        <meta name="description" content={t('dashboard.customer.description')} />
      </Helmet>

      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{t('dashboard.customer.welcome', { name: user.name })}</h1>
              <p className="text-gray-300">{t('dashboard.customer.welcome.description')}</p>
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
                <div className="flex items-center justify-between"><div><p className="text-sm text-gray-300">{t('dashboard.customer.total_orders')}</p><p className="text-2xl font-bold text-white">{myOrders.length}</p></div><Package className="w-8 h-8 text-blue-400" /></div>
              </CardContent>
            </Card>
            <Card className="glass-effect border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between"><div><p className="text-sm text-gray-300">{t('dashboard.customer.pending')}</p><p className="text-2xl font-bold text-white">{pendingOrders.length}</p></div><Clock className="w-8 h-8 text-yellow-400" /></div>
              </CardContent>
            </Card>
            <Card className="glass-effect border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between"><div><p className="text-sm text-gray-300">{t('dashboard.customer.in_transit')}</p><p className="text-2xl font-bold text-white">{inTransitOrders.length}</p></div><Truck className="w-8 h-8 text-orange-400" /></div>
              </CardContent>
            </Card>
            <Card className="glass-effect border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between"><div><p className="text-sm text-gray-300">{t('dashboard.customer.delivered')}</p><p className="text-2xl font-bold text-white">{deliveredOrders.length}</p></div><CheckCircle className="w-8 h-8 text-green-400" /></div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card className="glass-effect border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">{t('customer.dashboard.quick_actions')}</CardTitle>
                  <CardDescription className="text-gray-300">{t('customer.dashboard.quick_actions_description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link to="/customer/create-order">
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600"><Plus className="w-4 h-4 mr-2" />{t('dashboard.customer.create_order')}</Button>
                  </Link>
                  <Button variant="outline" className="w-full bg-white/10 border-white/20"><MapPin className="w-4 h-4 mr-2" />{t('customer.dashboard.track_order_button')}</Button>
                  <Button variant="outline" className="w-full bg-white/10 border-white/20"><Calendar className="w-4 h-4 mr-2" />{t('customer.dashboard.order_history_button')}</Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
              <Card className="glass-effect border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">{t('dashboard.customer.my_orders')}</CardTitle>
                  <CardDescription className="text-gray-300">{t('dashboard.customer.my_orders.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {myOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-400 mb-4">{t('dashboard.customer.no_orders')}</p>
                      <Link to="/customer/create-order">
                        <Button className="bg-gradient-to-r from-blue-500 to-purple-600">{t('dashboard.customer.create_first_order')}</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myOrders.slice(0, 5).map((order) => (
                        <div key={order.id} className="p-4 bg-white/5 rounded-lg">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-white">{t('order.id', { id: order.id })}</h3>
                              <p className="text-sm text-gray-300">{order.description}</p>
                              <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-white">{order.price} {t('currency.rub', 'RUB')}</p>
                              <span className={`inline-block px-2 py-1 rounded text-xs ${getStatusClass(order.status)}`}>{getStatusText(order.status)}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div><p className="text-gray-400">{t('order.distance')}</p><p className="text-white">{order.distance} {t('unit.km', 'км')}</p></div>
                            <div><p className="text-gray-400">{t('order.courier')}</p><p className="text-white">{order.courierName || t('order.courier.unassigned')}</p></div>
                            {order.estimatedTime && (<div><p className="text-gray-400">{t('customer.order.estimated_time')}</p><p className="text-white">{order.estimatedTime}</p></div>)}
                            <div><p className="text-gray-400">{t('order.status.label', 'Статус')}</p><div className="flex items-center gap-1">{getStatusIcon(order.status)}<span className="text-white">{getStatusText(order.status)}</span></div></div>
                          </div>
                          {order.status === 'delivered' && !order.rating && (
                            <div className="mt-3 pt-3 border-t border-white/10">
                               <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => handleOpenRatingDialog(order)} className="bg-yellow-500/20 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/30">
                                    <Star className="w-4 h-4 mr-2" />{t('customer.dashboard.rate_order_button')}
                                </Button>
                               </DialogTrigger>
                            </div>
                          )}
                          {order.rating && (
                            <div className="mt-3 pt-3 border-t border-white/10">
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (<Star key={star} className={`w-4 h-4 ${star <= order.rating ? 'text-yellow-400 fill-current' : 'text-gray-400'}`}/>))}
                                </div>
                                <span className="text-sm text-gray-300">{t('customer.dashboard.rated_text')}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {myOrders.length > 5 && (<div className="text-center pt-4"><Button variant="outline" className="bg-white/10 border-white/20">{t('customer.dashboard.view_all_orders_button')}</Button></div>)}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent className="bg-gray-900 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">{t('customer.dashboard.rating_dialog_title')}</DialogTitle>
            <DialogDescription className="text-gray-300">{t('customer.dashboard.rating_dialog_description')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white">{t('customer.dashboard.rating_label')}</Label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)} className="text-2xl hover:scale-110 transition-transform">
                    <Star className={`w-8 h-8 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-400'}`}/>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="ratingComment" className="text-white">{t('customer.dashboard.comment_label')}</Label>
              <textarea id="ratingComment" value={ratingComment} onChange={(e) => setRatingComment(e.target.value)} className="w-full p-2 rounded bg-white/10 border border-white/20 text-white resize-none focus:ring-blue-500 focus:border-blue-500" rows={3} placeholder={t('customer.dashboard.comment_placeholder')}/>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowRatingDialog(false)} className="flex-1 bg-white/10 border-white/20">{t('customer.dashboard.cancel_button')}</Button>
              <Button onClick={submitRating} className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600">{t('customer.dashboard.submit_rating_button')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomerDashboard;