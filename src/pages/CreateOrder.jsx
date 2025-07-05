import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Package, Tag, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Link, useNavigate } from 'react-router-dom';
import MapComponent from '@/components/MapComponent';
import { useTranslation } from 'react-i18next';

const CreateOrder = () => {
  const { user } = useAuth();
  const { createOrder, calculateDistance, calculatePrice, calculateEstimatedTime, validatePromoCode } = useOrders();
  const { sendNotification } = useNotifications();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { APP_CONFIG } = await import('@/config/settings');
  
  const [formData, setFormData] = useState({
    description: '',
    pickupLocation: null,
    deliveryLocation: null,
    customerName: user.name,
    customerPhone: '',
    promoCode: '',
  });
  
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  const [originalPrice, setOriginalPrice] = useState(null);
  const [distance, setDistance] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [promoValidation, setPromoValidation] = useState(null);
  const [appliedPromo, setAppliedPromo] = useState(null);

  useEffect(() => {
    if (formData.pickupLocation && formData.deliveryLocation) {
      const dist = calculateDistance(formData.pickupLocation, formData.deliveryLocation);
      const time = calculateEstimatedTime(dist);
      const basePrice = calculatePrice(dist);
      const finalPrice = calculatePrice(dist, appliedPromo?.code);
      
      setDistance(dist);
      setOriginalPrice(basePrice);
      setEstimatedPrice(finalPrice);
      setEstimatedTime(time);
    }
  }, [formData.pickupLocation, formData.deliveryLocation, appliedPromo, calculateDistance, calculatePrice, calculateEstimatedTime]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLocationSelect = (location, type) => {
    setFormData(prev => ({
      ...prev,
      [type]: location
    }));
  };

  const handlePromoCodeApply = () => {
    if (!formData.promoCode.trim()) {
      setPromoValidation({ valid: false, message: "Promosyon kodu girin" });
      return;
    }

    const validation = validatePromoCode(formData.promoCode.toUpperCase());
    setPromoValidation(validation);

    if (validation.valid) {
      setAppliedPromo(validation.promo);
      setFormData(prev => ({ ...prev, promoCode: '' }));
    }
  };

  const handlePromoCodeRemove = () => {
    setAppliedPromo(null);
    setPromoValidation(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.pickupLocation || !formData.deliveryLocation) {
      return;
    }

    const orderData = {
      ...formData,
      customerId: user.id,
      promoCode: appliedPromo?.code || null,
    };

    createOrder(orderData);
    
    sendNotification(
      'courier',
      'notification.new_order',
      'notification.new_order_description',
      { description: formData.description },
      'info'
    );
    
    navigate('/customer');
  };

  return (
    <>
      <Helmet>
        <title>{t('create_order.title')}</title>
        <meta name="description" content={t('create_order.description_meta')} />
      </Helmet>

      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-8"
          >
            <Link to="/customer">
              <Button variant="outline" size="icon" className="bg-white/10 border-white/20">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">{t('create_order.header')}</h1>
              <p className="text-gray-300">{t('create_order.subheader')}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-effect border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {t('create_order.info_header')}
                </CardTitle>
                <CardDescription className="text-gray-300">
                  {t('create_order.info_subheader')}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-white">{t('create_order.description_label')}</Label>
                      <Input
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        placeholder={t('create_order.description_placeholder')}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customerPhone" className="text-white">{t('create_order.phone_label')}</Label>
                      <Input
                        id="customerPhone"
                        name="customerPhone"
                        value={formData.customerPhone}
                        onChange={handleInputChange}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        placeholder={t('create_order.phone_placeholder')}
                        required
                      />
                    </div>
                  </div>

                  {/* Promo Code Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Tag className="w-5 h-5 text-purple-400" />
                      <Label className="text-white">Promosyon Kodu</Label>
                    </div>
                    
                    {appliedPromo ? (
                      <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-300 font-medium">Uygulanan: {appliedPromo.code}</p>
                            <p className="text-green-400 text-sm">
                              {appliedPromo.type === 'percentage' 
                                ? `%${appliedPromo.discount} indirim` 
                                : `${appliedPromo.discount} TL indirim`
                              }
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handlePromoCodeRemove}
                            className="text-green-300 border-green-300 hover:bg-green-500/20"
                          >
                            Kaldır
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          name="promoCode"
                          value={formData.promoCode}
                          onChange={handleInputChange}
                          className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          placeholder="Promosyon kodunuzu girin"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePromoCodeApply}
                          className="bg-purple-500/20 border-purple-500/30 text-purple-300 hover:bg-purple-500/30"
                        >
                          Uygula
                        </Button>
                      </div>
                    )}
                    
                    {promoValidation && !promoValidation.valid && (
                      <p className="text-red-400 text-sm">{promoValidation.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-400" />
                        <Label className="text-white">{t('create_order.pickup_location')}</Label>
                      </div>
                      <MapComponent
                        onLocationSelect={(location) => handleLocationSelect(location, 'pickupLocation')}
                        selectedLocation={formData.pickupLocation}
                        placeholder={t('create_order.select_pickup')}
                        apiKey={APP_CONFIG.YANDEX_MAPS.API_KEY}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-green-400" />
                        <Label className="text-white">{t('create_order.delivery_location')}</Label>
                      </div>
                      <MapComponent
                        onLocationSelect={(location) => handleLocationSelect(location, 'deliveryLocation')}
                        selectedLocation={formData.deliveryLocation}
                        placeholder={t('create_order.select_delivery')}
                        apiKey={APP_CONFIG.YANDEX_MAPS.API_KEY}
                      />
                    </div>
                  </div>

                  {estimatedPrice !== null && distance !== null && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-6 rounded-lg border border-white/20"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-gray-300 mb-2">{t('create_order.estimated_price')}</p>
                          <div className="flex items-center justify-center gap-2">
                            {originalPrice !== estimatedPrice && (
                              <span className="text-gray-400 line-through text-lg">
                                {originalPrice} TL
                              </span>
                            )}
                            <p className="text-3xl font-bold text-white">{estimatedPrice} TL</p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-gray-300 mb-2">{t('order.distance')}</p>
                          <p className="text-2xl font-bold text-white">{distance.toFixed(2)} km</p>
                        </div>
                        
                        <div>
                          <p className="text-gray-300 mb-2 flex items-center justify-center gap-1">
                            <Clock className="w-4 h-4" />
                            Tahmini Süre
                          </p>
                          <p className="text-2xl font-bold text-white">{estimatedTime}</p>
                        </div>
                      </div>
                      
                      {appliedPromo && (
                        <div className="mt-4 text-center">
                          <p className="text-green-400 text-sm">
                            💰 {appliedPromo.code} promosyon kodu uygulandı!
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  <div className="flex gap-4">
                    <Link to="/customer" className="flex-1">
                      <Button type="button" variant="outline" className="w-full bg-white/10 border-white/20">
                        {t('create_order.button.cancel')}
                      </Button>
                    </Link>
                    
                    <Button 
                      type="submit" 
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600"
                      disabled={!formData.pickupLocation || !formData.deliveryLocation}
                    >
                      {t('create_order.button.create')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default CreateOrder;