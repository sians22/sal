import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Users, Package, Truck, Settings, LogOut, Bell, Plus, Edit, Trash2, DollarSign, Tag, Palette, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { toast } from '@/components/ui/use-toast';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { orders, pricingRules, updatePricingRules, promoCodes, addPromoCode, deletePromoCode, getOrderHistory, getAverageRating } = useOrders();
  const { getUnreadCount, sendNotification } = useNotifications();
  
  const [users, setUsers] = useState([]);
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'Kurye Sistemi',
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
    }
    
    setTempPricingRules([...pricingRules]);
  }, [pricingRules]);

  const handleCreateUser = () => {
    if (!newUser.username || !newUser.password || !newUser.name) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun",
        variant: "destructive"
      });
      return;
    }

    const existingUser = users.find(u => u.username === newUser.username);
    if (existingUser) {
      toast({
        title: "Hata",
        description: "Bu kullanıcı adı zaten kullanılıyor",
        variant: "destructive"
      });
      return;
    }

    const user = {
      id: Date.now().toString(),
      ...newUser
    };

    const updatedUsers = [...users, user];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    setNewUser({
      username: '',
      password: '',
      name: '',
      role: 'customer'
    });

    toast({
      title: "Başarılı",
      description: "Kullanıcı başarıyla oluşturuldu"
    });
  };

  const handleDeleteUser = (userId) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    toast({
      title: "Başarılı",
      description: "Kullanıcı başarıyla silindi"
    });
  };

  const handleCreatePromoCode = () => {
    if (!newPromoCode.code || !newPromoCode.discount || !newPromoCode.maxUses) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun",
        variant: "destructive"
      });
      return;
    }

    const promoCode = {
      code: newPromoCode.code.toUpperCase(),
      discount: parseFloat(newPromoCode.discount),
      type: newPromoCode.type,
      maxUses: parseInt(newPromoCode.maxUses),
      usedCount: 0
    };

    addPromoCode(promoCode);
    
    setNewPromoCode({
      code: '',
      discount: '',
      type: 'percentage',
      maxUses: ''
    });
  };

  const handleSaveSettings = () => {
    localStorage.setItem('siteSettings', JSON.stringify(siteSettings));
    toast({
      title: "Başarılı",
      description: "Site ayarları güncellendi"
    });
  };

  const handleSavePricing = () => {
    updatePricingRules(tempPricingRules);
    setEditingPricing(false);
  };

  const handleAddPricingRule = () => {
    setTempPricingRules([
      ...tempPricingRules,
      { minDistance: 0, maxDistance: 0, price: 0 }
    ]);
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
        title: "Hata",
        description: "Lütfen başlık ve mesaj alanlarını doldurun",
        variant: "destructive"
      });
      return;
    }

    sendNotification(
      notificationData.targetRole,
      notificationData.title,
      notificationData.message,
      'info'
    );

    setNotificationData({
      targetRole: 'all',
      title: '',
      message: ''
    });

    toast({
      title: "Başarılı",
      description: "Bildirim gönderildi"
    });
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.price, 0);
  const customerCount = users.filter(u => u.role === 'customer').length;
  const courierCount = users.filter(u => u.role === 'courier').length;
  const activeOrders = orders.filter(o => ['pending', 'accepted', 'in-transit'].includes(o.status)).length;

  return (
    <>
      <Helmet>
        <title>Admin Paneli - Kurye Yönetim Sistemi</title>
        <meta name="description" content="Kurye sistemini yönetin ve kontrol edin" />
      </Helmet>

      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Admin Paneli</h1>
              <p className="text-gray-300">Sistem yönetimi ve kontrol paneli</p>
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
                Çıkış
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
                    <p className="text-sm text-gray-300">Toplam Sipariş</p>
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
                    <p className="text-sm text-gray-300">Aktif Siparişler</p>
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
                    <p className="text-sm text-gray-300">Toplam Gelir</p>
                    <p className="text-2xl font-bold text-white">{totalRevenue} TL</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Kullanıcılar</p>
                    <p className="text-2xl font-bold text-white">{customerCount + courierCount}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="users" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6 bg-white/10">
                <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
                <TabsTrigger value="orders">Siparişler</TabsTrigger>
                <TabsTrigger value="pricing">Fiyatlandırma</TabsTrigger>
                <TabsTrigger value="promocodes">Promosyon Kodları</TabsTrigger>
                <TabsTrigger value="notifications">Bildirimler</TabsTrigger>
                <TabsTrigger value="settings">Ayarlar</TabsTrigger>
              </TabsList>

              {/* Users Tab */}
              <TabsContent value="users">
                <Card className="glass-effect border-white/20">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-white">Kullanıcı Yönetimi</CardTitle>
                        <CardDescription className="text-gray-300">
                          Sistem kullanıcılarını yönetin
                        </CardDescription>
                      </div>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="bg-gradient-to-r from-blue-500 to-purple-600">
                            <Plus className="w-4 h-4 mr-2" />
                            Yeni Kullanıcı
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-900 border-white/20">
                          <DialogHeader>
                            <DialogTitle className="text-white">Yeni Kullanıcı Oluştur</DialogTitle>
                            <DialogDescription className="text-gray-300">
                              Yeni kullanıcı bilgilerini girin
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div>
                              <Label className="text-white">Kullanıcı Adı</Label>
                              <Input
                                value={newUser.username}
                                onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                                className="bg-white/10 border-white/20 text-white"
                              />
                            </div>
                            
                            <div>
                              <Label className="text-white">Şifre</Label>
                              <Input
                                type="password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                className="bg-white/10 border-white/20 text-white"
                              />
                            </div>
                            
                            <div>
                              <Label className="text-white">Ad Soyad</Label>
                              <Input
                                value={newUser.name}
                                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                                className="bg-white/10 border-white/20 text-white"
                              />
                            </div>
                            
                            <div>
                              <Label className="text-white">Rol</Label>
                              <select
                                value={newUser.role}
                                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                                className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
                              >
                                <option value="customer">Müşteri</option>
                                <option value="courier">Kurye</option>
                                <option value="admin">Admin</option>
                              </select>
                            </div>
                            
                            <Button onClick={handleCreateUser} className="w-full bg-gradient-to-r from-blue-500 to-purple-600">
                              Kullanıcı Oluştur
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {users.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                          <div>
                            <h3 className="font-semibold text-white">{user.name}</h3>
                            <p className="text-sm text-gray-300">@{user.username}</p>
                            <span className={`inline-block px-2 py-1 rounded text-xs ${
                              user.role === 'admin' ? 'bg-red-500/20 text-red-300' :
                              user.role === 'courier' ? 'bg-blue-500/20 text-blue-300' :
                              'bg-green-500/20 text-green-300'
                            }`}>
                              {user.role === 'admin' ? 'Admin' : user.role === 'courier' ? 'Kurye' : 'Müşteri'}
                            </span>
                            {user.role === 'courier' && (
                              <p className="text-xs text-gray-400 mt-1">
                                Ortalama Puan: {getAverageRating(user.id)}/5
                              </p>
                            )}
                          </div>
                          
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.id === '1'} // Admin kullanıcısını silmeyi engelle
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Promo Codes Tab */}
              <TabsContent value="promocodes">
                <Card className="glass-effect border-white/20">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-white">Promosyon Kodları</CardTitle>
                        <CardDescription className="text-gray-300">
                          Promosyon kodlarını yönetin
                        </CardDescription>
                      </div>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="bg-gradient-to-r from-purple-500 to-pink-600">
                            <Tag className="w-4 h-4 mr-2" />
                            Yeni Promosyon Kodu
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-900 border-white/20">
                          <DialogHeader>
                            <DialogTitle className="text-white">Yeni Promosyon Kodu</DialogTitle>
                            <DialogDescription className="text-gray-300">
                              Promosyon kodu bilgilerini girin
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div>
                              <Label className="text-white">Kod</Label>
                              <Input
                                value={newPromoCode.code}
                                onChange={(e) => setNewPromoCode({...newPromoCode, code: e.target.value})}
                                className="bg-white/10 border-white/20 text-white"
                                placeholder="WELCOME10"
                              />
                            </div>
                            
                            <div>
                              <Label className="text-white">İndirim</Label>
                              <Input
                                type="number"
                                value={newPromoCode.discount}
                                onChange={(e) => setNewPromoCode({...newPromoCode, discount: e.target.value})}
                                className="bg-white/10 border-white/20 text-white"
                                placeholder="10"
                              />
                            </div>
                            
                            <div>
                              <Label className="text-white">İndirim Türü</Label>
                              <select
                                value={newPromoCode.type}
                                onChange={(e) => setNewPromoCode({...newPromoCode, type: e.target.value})}
                                className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
                              >
                                <option value="percentage">Yüzde (%)</option>
                                <option value="fixed">Sabit Tutar (TL)</option>
                              </select>
                            </div>
                            
                            <div>
                              <Label className="text-white">Maksimum Kullanım</Label>
                              <Input
                                type="number"
                                value={newPromoCode.maxUses}
                                onChange={(e) => setNewPromoCode({...newPromoCode, maxUses: e.target.value})}
                                className="bg-white/10 border-white/20 text-white"
                                placeholder="100"
                              />
                            </div>
                            
                            <Button onClick={handleCreatePromoCode} className="w-full bg-gradient-to-r from-purple-500 to-pink-600">
                              Promosyon Kodu Oluştur
                            </Button>
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
                              {promo.type === 'percentage' ? `%${promo.discount} indirim` : `${promo.discount} TL indirim`}
                            </p>
                            <p className="text-xs text-gray-400">
                              Kullanım: {promo.usedCount}/{promo.maxUses}
                            </p>
                          </div>
                          
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deletePromoCode(promo.code)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings">
                <Card className="glass-effect border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      Site Ayarları
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Site görünümünü ve ayarlarını özelleştirin
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-white">Site Adı</Label>
                          <Input
                            value={siteSettings.siteName}
                            onChange={(e) => setSiteSettings({...siteSettings, siteName: e.target.value})}
                            className="bg-white/10 border-white/20 text-white"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-white">Ana Renk</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={siteSettings.primaryColor}
                              onChange={(e) => setSiteSettings({...siteSettings, primaryColor: e.target.value})}
                              className="w-16 h-10 bg-white/10 border-white/20"
                            />
                            <Input
                              value={siteSettings.primaryColor}
                              onChange={(e) => setSiteSettings({...siteSettings, primaryColor: e.target.value})}
                              className="flex-1 bg-white/10 border-white/20 text-white"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-white">Site Logosu</Label>
                        <div className="flex items-center gap-4">
                          {siteSettings.siteLogo && (
                            <img 
                              src={siteSettings.siteLogo} 
                              alt="Site Logo" 
                              className="w-16 h-16 object-contain bg-white/10 rounded"
                            />
                          )}
                          <Button variant="outline" className="bg-white/10 border-white/20">
                            <Upload className="w-4 h-4 mr-2" />
                            Logo Yükle
                          </Button>
                        </div>
                      </div>
                      
                      <Button onClick={handleSaveSettings} className="bg-gradient-to-r from-blue-500 to-purple-600">
                        Ayarları Kaydet
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders">
                <Card className="glass-effect border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">Sipariş Yönetimi</CardTitle>
                    <CardDescription className="text-gray-300">
                      Tüm siparişleri görüntüleyin ve yönetin
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="p-4 bg-white/5 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-white">Sipariş #{order.id}</h3>
                              <p className="text-sm text-gray-300">{order.description}</p>
                              <p className="text-xs text-gray-400">
                                {new Date(order.createdAt).toLocaleString('tr-TR')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-white">{order.price} TL</p>
                              <span className={`inline-block px-2 py-1 rounded text-xs ${
                                order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                                order.status === 'accepted' ? 'bg-blue-500/20 text-blue-300' :
                                order.status === 'in-transit' ? 'bg-orange-500/20 text-orange-300' :
                                'bg-green-500/20 text-green-300'
                              }`}>
                                {order.status === 'pending' ? 'Bekliyor' :
                                 order.status === 'accepted' ? 'Kabul Edildi' :
                                 order.status === 'in-transit' ? 'Yolda' : 'Teslim Edildi'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pricing Tab */}
              <TabsContent value="pricing">
                <Card className="glass-effect border-white/20">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-white">Fiyatlandırma Kuralları</CardTitle>
                      <Button 
                        onClick={() => setEditingPricing(!editingPricing)}
                        className="bg-gradient-to-r from-green-500 to-blue-600"
                      >
                        {editingPricing ? 'Kaydet' : 'Düzenle'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tempPricingRules.map((rule, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                          <div className="flex-1">
                            <Label className="text-white">Min Mesafe (km)</Label>
                            <Input
                              type="number"
                              value={rule.minDistance}
                              onChange={(e) => handleUpdatePricingRule(index, 'minDistance', e.target.value)}
                              disabled={!editingPricing}
                              className="bg-white/10 border-white/20 text-white"
                            />
                          </div>
                          <div className="flex-1">
                            <Label className="text-white">Max Mesafe (km)</Label>
                            <Input
                              type="number"
                              value={rule.maxDistance}
                              onChange={(e) => handleUpdatePricingRule(index, 'maxDistance', e.target.value)}
                              disabled={!editingPricing}
                              className="bg-white/10 border-white/20 text-white"
                            />
                          </div>
                          <div className="flex-1">
                            <Label className="text-white">Fiyat (TL)</Label>
                            <Input
                              type="number"
                              value={rule.price}
                              onChange={(e) => handleUpdatePricingRule(index, 'price', e.target.value)}
                              disabled={!editingPricing}
                              className="bg-white/10 border-white/20 text-white"
                            />
                          </div>
                          {editingPricing && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeletePricingRule(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      
                      {editingPricing && (
                        <Button onClick={handleAddPricingRule} className="w-full bg-gradient-to-r from-blue-500 to-purple-600">
                          <Plus className="w-4 h-4 mr-2" />
                          Yeni Kural Ekle
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications">
                <Card className="glass-effect border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">Bildirim Gönder</CardTitle>
                    <CardDescription className="text-gray-300">
                      Kullanıcılara bildirim gönderin
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-white">Hedef Kitle</Label>
                        <select
                          value={notificationData.targetRole}
                          onChange={(e) => setNotificationData({...notificationData, targetRole: e.target.value})}
                          className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
                        >
                          <option value="all">Tüm Kullanıcılar</option>
                          <option value="customer">Müşteriler</option>
                          <option value="courier">Kuryeler</option>
                        </select>
                      </div>
                      
                      <div>
                        <Label className="text-white">Başlık</Label>
                        <Input
                          value={notificationData.title}
                          onChange={(e) => setNotificationData({...notificationData, title: e.target.value})}
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-white">Mesaj</Label>
                        <textarea
                          value={notificationData.message}
                          onChange={(e) => setNotificationData({...notificationData, message: e.target.value})}
                          className="w-full p-2 rounded bg-white/10 border border-white/20 text-white resize-none"
                          rows={4}
                        />
                      </div>
                      
                      <Button onClick={handleSendNotification} className="w-full bg-gradient-to-r from-blue-500 to-purple-600">
                        Bildirim Gönder
                      </Button>
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
