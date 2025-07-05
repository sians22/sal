import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Users, Package, Truck, Settings, LogOut, Bell, Plus, Trash2, DollarSign, Tag, Palette, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '@/contexts/NotificationContext';
import { toast } from '@/components/ui/use-toast';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { orders, pricingRules, updatePricingRules, promoCodes, addPromoCode, deletePromoCode, getAverageRating } = useOrders();
  const { getUnreadCount, sendNotification } = useNotifications();
  const { t } = useTranslation();
  
  const [users, setUsers] = useState([]);

  const [siteSettings, setSiteSettings] = useState({
    siteName: '',
    siteTheme: 'default',
    siteLogo: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6'
  });
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    name: '',
    role: 'customer'
  });
  const [newPromoCode, setNewPromoCode] = useState({
    code: '',
    discount: '',
    type: 'percentage',
    maxUses: ''
  });
  const [editingPricing, setEditingPricing] = useState(false);
  const [tempPricingRules, setTempPricingRules] = useState([]);
  const [notificationData, setNotificationData] = useState({
    targetRole: 'all',
    title: '',
    message: ''
  });

  useEffect(() => {
    const savedUsers = localStorage.getItem('users');
    const savedSettings = localStorage.getItem('siteSettings');
    
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
    
    if (savedSettings) {
      setSiteSettings(JSON.parse(savedSettings));
    } else {
      setSiteSettings(prev => ({...prev, siteName: t('admin.settings.site_name_placeholder', 'Kurye Sistemi')}));
    }
    
    setTempPricingRules([...pricingRules]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pricingRules, t]);

  const handleCreateUser = () => {
    if (!newUser.username || !newUser.password || !newUser.name) {
      toast({
        title: t('admin.users.error_title', 'Ошибка'),
        description: t('admin.users.error_fill_fields'),
        variant: "destructive"
      });
      return;
    }

    const existingUser = users.find(u => u.username === newUser.username);
    if (existingUser) {
      toast({
        title: t('admin.users.error_title', 'Ошибка'),
        description: t('admin.users.error_username_exists'),
        variant: "destructive"
      });
      return;
    }

    const userToCreate = {
      id: Date.now().toString(),
      ...newUser
    };

    const updatedUsers = [...users, userToCreate];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    setNewUser({ username: '', password: '', name: '', role: 'customer' });
    toast({
      title: t('admin.users.success_title', 'Успешно'),
      description: t('admin.users.create_success')
    });
  };

  const handleDeleteUser = (userId) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    toast({
      title: t('admin.users.success_title', 'Успешно'),
      description: t('admin.users.delete_success')
    });
  };

  const handleCreatePromoCode = () => {
    if (!newPromoCode.code || !newPromoCode.discount || !newPromoCode.maxUses) {
      toast({
        title: t('admin.promocodes.error_title', 'Ошибка'),
        description: t('admin.users.error_fill_fields'),
        variant: "destructive"
      });
      return;
    }
    const promoCodeData = {
      code: newPromoCode.code.toUpperCase(),
      discount: parseFloat(newPromoCode.discount),
      type: newPromoCode.type,
      maxUses: parseInt(newPromoCode.maxUses),
      usedCount: 0
    };
    addPromoCode(promoCodeData);
    setNewPromoCode({ code: '', discount: '', type: 'percentage', maxUses: '' });
  };

  const handleSaveSettings = () => {
    localStorage.setItem('siteSettings', JSON.stringify(siteSettings));
    toast({
      title: t('admin.settings.success_title', 'Успешно'),
      description: t('admin.settings.save_success')
    });
  };

  const handleSavePricing = () => {
    updatePricingRules(tempPricingRules);
    setEditingPricing(false);
     toast({ // Kullanıcıya geri bildirim
      title: t('toast.pricing_updated_title'),
      description: t('toast.pricing_updated_description'),
    });
  };

  const handleAddPricingRule = () => {
    setTempPricingRules([...tempPricingRules, { minDistance: 0, maxDistance: 0, price: 0 }]);
  };

  const handleUpdatePricingRule = (index, field, value) => {
    const updated = [...tempPricingRules];
    updated[index][field] = parseFloat(value) || 0;
    setTempPricingRules(updated);
  };

  const handleDeletePricingRule = (index) => {
    const updated = tempPricingRules.filter((_, i) => i !== index);
    setTempPricingRules(updated);
  };

  const handleSendNotification = () => {
    if (!notificationData.title || !notificationData.message) {
      toast({
        title: t('admin.notifications.error_title', 'Ошибка'),
        description: t('admin.users.error_fill_fields'),
        variant: "destructive"
      });
      return;
    }
    sendNotification(notificationData.targetRole, notificationData.title, notificationData.message, {}, 'info');
    setNotificationData({ targetRole: 'all', title: '', message: '' });
    toast({
      title: t('admin.notifications.success_title', 'Успешно'),
      description: t('admin.notifications.send_success')
    });
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.price, 0);
  const customerCount = users.filter(u => u.role === 'customer').length;
  const courierCount = users.filter(u => u.role === 'courier').length;
  const activeOrders = orders.filter(o => ['pending', 'accepted', 'in-transit'].includes(o.status)).length;

  return (
    <>
      <Helmet>
        <title>{t('admin.dashboard.helmet_title', 'Админ Панель - Система Управления Курьерами')}</title>
        <meta name="description" content={t('admin.dashboard.helmet_description', 'Управляйте и контролируйте курьерскую систему')} />
      </Helmet>

      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{t('admin.dashboard.title')}</h1>
              <p className="text-gray-300">{t('admin.dashboard.description')}</p>
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
                    <p className="text-sm text-gray-300">{t('admin.stats.total_orders')}</p>
                    <p className="text-2xl font-bold text-white">{orders.length}</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="glass-effect border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">{t('admin.stats.active_orders')}</p>
                    <p className="text-2xl font-bold text-white">{activeOrders}</p>
                  </div>
                  <Truck className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="glass-effect border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">{t('admin.stats.total_revenue')}</p>
                    <p className="text-2xl font-bold text-white">{totalRevenue} {t('currency.rub', 'RUB')}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="glass-effect border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">{t('admin.stats.users')}</p>
                    <p className="text-2xl font-bold text-white">{customerCount + courierCount}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="users" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6 bg-white/10">
                <TabsTrigger value="users">{t('admin.tabs.users')}</TabsTrigger>
                <TabsTrigger value="orders">{t('admin.tabs.orders')}</TabsTrigger>
                <TabsTrigger value="pricing">{t('admin.tabs.pricing')}</TabsTrigger>
                <TabsTrigger value="promocodes">{t('admin.tabs.promocodes')}</TabsTrigger>
                <TabsTrigger value="notifications">{t('admin.tabs.notifications')}</TabsTrigger>
                <TabsTrigger value="settings">{t('admin.tabs.settings')}</TabsTrigger>
              </TabsList>

              <TabsContent value="users">
                <Card className="glass-effect border-white/20">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-white">{t('admin.users.manage_title')}</CardTitle>
                        <CardDescription className="text-gray-300">{t('admin.users.manage_description')}</CardDescription>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="bg-gradient-to-r from-blue-500 to-purple-600">
                            <Plus className="w-4 h-4 mr-2" />{t('admin.users.new_user_button')}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-900 border-white/20">
                          <DialogHeader>
                            <DialogTitle className="text-white">{t('admin.users.new_user_dialog_title')}</DialogTitle>
                            <DialogDescription className="text-gray-300">{t('admin.users.new_user_dialog_description')}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-white">{t('admin.users.username_label')}</Label>
                              <Input value={newUser.username} onChange={(e) => setNewUser({...newUser, username: e.target.value})} className="bg-white/10 border-white/20 text-white"/>
                            </div>
                            <div>
                              <Label className="text-white">{t('admin.users.password_label')}</Label>
                              <Input type="password" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} className="bg-white/10 border-white/20 text-white"/>
                            </div>
                            <div>
                              <Label className="text-white">{t('admin.users.name_label')}</Label>
                              <Input value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} className="bg-white/10 border-white/20 text-white"/>
                            </div>
                            <div>
                              <Label className="text-white">{t('admin.users.role_label')}</Label>
                              <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})} className="w-full p-2 rounded bg-white/10 border border-white/20 text-white">
                                <option value="customer">{t('admin.users.role_customer')}</option>
                                <option value="courier">{t('admin.users.role_courier')}</option>
                                <option value="admin">{t('admin.users.role_admin')}</option>
                              </select>
                            </div>
                            <Button onClick={handleCreateUser} className="w-full bg-gradient-to-r from-blue-500 to-purple-600">{t('admin.users.create_button')}</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {users.map((u) => (
                        <div key={u.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                          <div>
                            <h3 className="font-semibold text-white">{u.name}</h3>
                            <p className="text-sm text-gray-300">@{u.username}</p>
                            <span className={`inline-block px-2 py-1 rounded text-xs ${ u.role === 'admin' ? 'bg-red-500/20 text-red-300' : u.role === 'courier' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300' }`}>
                              {u.role === 'admin' ? t('admin.users.role_admin') : u.role === 'courier' ? t('admin.users.role_courier') : t('admin.users.role_customer')}
                            </span>
                            {u.role === 'courier' && (<p className="text-xs text-gray-400 mt-1">{t('admin.users.average_rating')}: {getAverageRating(u.id)}/5</p>)}
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(u.id)} disabled={u.id === '1'}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="promocodes">
                <Card className="glass-effect border-white/20">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-white">{t('admin.promocodes.manage_title')}</CardTitle>
                        <CardDescription className="text-gray-300">{t('admin.promocodes.manage_description')}</CardDescription>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="bg-gradient-to-r from-purple-500 to-pink-600">
                            <Tag className="w-4 h-4 mr-2" />{t('admin.promocodes.new_button')}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-900 border-white/20">
                          <DialogHeader>
                            <DialogTitle className="text-white">{t('admin.promocodes.new_dialog_title')}</DialogTitle>
                            <DialogDescription className="text-gray-300">{t('admin.promocodes.new_dialog_description')}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-white">{t('admin.promocodes.code_label')}</Label>
                              <Input value={newPromoCode.code} onChange={(e) => setNewPromoCode({...newPromoCode, code: e.target.value})} className="bg-white/10 border-white/20 text-white" placeholder="WELCOME10"/>
                            </div>
                            <div>
                              <Label className="text-white">{t('admin.promocodes.discount_label')}</Label>
                              <Input type="number" value={newPromoCode.discount} onChange={(e) => setNewPromoCode({...newPromoCode, discount: e.target.value})} className="bg-white/10 border-white/20 text-white" placeholder="10"/>
                            </div>
                            <div>
                              <Label className="text-white">{t('admin.promocodes.type_label')}</Label>
                              <select value={newPromoCode.type} onChange={(e) => setNewPromoCode({...newPromoCode, type: e.target.value})} className="w-full p-2 rounded bg-white/10 border border-white/20 text-white">
                                <option value="percentage">{t('admin.promocodes.type_percentage')}</option>
                                <option value="fixed">{t('admin.promocodes.type_fixed')}</option>
                              </select>
                            </div>
                            <div>
                              <Label className="text-white">{t('admin.promocodes.max_uses_label')}</Label>
                              <Input type="number" value={newPromoCode.maxUses} onChange={(e) => setNewPromoCode({...newPromoCode, maxUses: e.target.value})} className="bg-white/10 border-white/20 text-white" placeholder="100"/>
                            </div>
                            <Button onClick={handleCreatePromoCode} className="w-full bg-gradient-to-r from-purple-500 to-pink-600">{t('admin.promocodes.create_button')}</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {promoCodes.map((promo) => (
                        <div key={promo.code} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                          <div>
                            <h3 className="font-semibold text-white">{promo.code}</h3>
                            <p className="text-sm text-gray-300">
                              {promo.type === 'percentage' ? `${t('admin.promocodes.type_percentage_short', '%')}${promo.discount} ${t('admin.promocodes.discount_text', 'скидка')}` : `${promo.discount} ${t('admin.promocodes.currency_rub', 'RUB')} ${t('admin.promocodes.discount_text', 'скидка')}`}
                            </p>
                            <p className="text-xs text-gray-400">{t('admin.promocodes.usage')}: {promo.usedCount}/{promo.maxUses}</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => deletePromoCode(promo.code)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card className="glass-effect border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2"><Palette className="w-5 h-5" />{t('admin.settings.title')}</CardTitle>
                    <CardDescription className="text-gray-300">{t('admin.settings.description')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-white">{t('admin.settings.site_name_label')}</Label>
                          <Input value={siteSettings.siteName} onChange={(e) => setSiteSettings({...siteSettings, siteName: e.target.value})} className="bg-white/10 border-white/20 text-white" placeholder={t('admin.settings.site_name_placeholder', 'Система Курьеров')}/>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">{t('admin.settings.primary_color_label')}</Label>
                          <div className="flex gap-2">
                            <Input type="color" value={siteSettings.primaryColor} onChange={(e) => setSiteSettings({...siteSettings, primaryColor: e.target.value})} className="w-16 h-10 bg-white/10 border-white/20"/>
                            <Input value={siteSettings.primaryColor} onChange={(e) => setSiteSettings({...siteSettings, primaryColor: e.target.value})} className="flex-1 bg-white/10 border-white/20 text-white"/>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">{t('admin.settings.logo_label')}</Label>
                        <div className="flex items-center gap-4">
                          {siteSettings.siteLogo && (<img src={siteSettings.siteLogo} alt={t('admin.settings.logo_alt', 'Логотип сайта')} className="w-16 h-16 object-contain bg-white/10 rounded"/>)}
                          <Button variant="outline" className="bg-white/10 border-white/20"><Upload className="w-4 h-4 mr-2" />{t('admin.settings.upload_logo_button')}</Button>
                        </div>
                      </div>
                      <Button onClick={handleSaveSettings} className="bg-gradient-to-r from-blue-500 to-purple-600">{t('admin.settings.save_button')}</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="orders">
                <Card className="glass-effect border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">{t('order.manage_title', 'Управление Заказами')}</CardTitle>
                    <CardDescription className="text-gray-300">{t('order.manage_description', 'Просмотр и управление всеми заказами')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="p-4 bg-white/5 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-white">{t('order.id', {id: order.id})}</h3>
                              <p className="text-sm text-gray-300">{order.description}</p>
                              <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString('ru-RU')}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-white">{order.price} {t('currency.rub', 'RUB')}</p>
                              <span className={`inline-block px-2 py-1 rounded text-xs ${ order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' : order.status === 'accepted' ? 'bg-blue-500/20 text-blue-300' : order.status === 'in-transit' ? 'bg-orange-500/20 text-orange-300' : 'bg-green-500/20 text-green-300' }`}>
                                {t(`order.status.${order.status}`)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pricing">
                <Card className="glass-effect border-white/20">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-white">{t('admin.pricing.title')}</CardTitle>
                      <Button onClick={() => setEditingPricing(!editingPricing)} className="bg-gradient-to-r from-green-500 to-blue-600">
                        {editingPricing ? t('admin.pricing.save_button') : t('admin.pricing.edit_button')}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tempPricingRules.map((rule, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                          <div className="flex-1">
                            <Label className="text-white">{t('admin.pricing.min_dist_label')}</Label>
                            <Input type="number" value={rule.minDistance} onChange={(e) => handleUpdatePricingRule(index, 'minDistance', e.target.value)} disabled={!editingPricing} className="bg-white/10 border-white/20 text-white"/>
                          </div>
                          <div className="flex-1">
                            <Label className="text-white">{t('admin.pricing.max_dist_label')}</Label>
                            <Input type="number" value={rule.maxDistance} onChange={(e) => handleUpdatePricingRule(index, 'maxDistance', e.target.value)} disabled={!editingPricing} className="bg-white/10 border-white/20 text-white"/>
                          </div>
                          <div className="flex-1">
                            <Label className="text-white">{t('admin.pricing.price_label')}</Label>
                            <Input type="number" value={rule.price} onChange={(e) => handleUpdatePricingRule(index, 'price', e.target.value)} disabled={!editingPricing} className="bg-white/10 border-white/20 text-white"/>
                          </div>
                          {editingPricing && (<Button variant="destructive" size="sm" onClick={() => handleDeletePricingRule(index)}><Trash2 className="w-4 h-4" /></Button>)}
                        </div>
                      ))}
                      {editingPricing && (
                        <Button onClick={handleAddPricingRule} className="w-full bg-gradient-to-r from-blue-500 to-purple-600">
                          <Plus className="w-4 h-4 mr-2" />{t('admin.pricing.add_rule_button')}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <Card className="glass-effect border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">{t('admin.notifications.title')}</CardTitle>
                    <CardDescription className="text-gray-300">{t('admin.notifications.description')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-white">{t('admin.notifications.target_label')}</Label>
                        <select value={notificationData.targetRole} onChange={(e) => setNotificationData({...notificationData, targetRole: e.target.value})} className="w-full p-2 rounded bg-white/10 border border-white/20 text-white">
                          <option value="all">{t('admin.notifications.target_all')}</option>
                          <option value="customer">{t('admin.notifications.target_customers')}</option>
                          <option value="courier">{t('admin.notifications.target_couriers')}</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-white">{t('admin.notifications.title_label')}</Label>
                        <Input value={notificationData.title} onChange={(e) => setNotificationData({...notificationData, title: e.target.value})} className="bg-white/10 border-white/20 text-white"/>
                      </div>
                      <div>
                        <Label className="text-white">{t('admin.notifications.message_label')}</Label>
                        <textarea value={notificationData.message} onChange={(e) => setNotificationData({...notificationData, message: e.target.value})} className="w-full p-2 rounded bg-white/10 border border-white/20 text-white resize-none" rows={4}/>
                      </div>
                      <Button onClick={handleSendNotification} className="w-full bg-gradient-to-r from-blue-500 to-purple-600">{t('admin.notifications.send_button')}</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
