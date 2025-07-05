import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/components/ui/use-toast';

const OrderContext = createContext();

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [pricingRules, setPricingRules] = useState([
    { minDistance: 0, maxDistance: 3, price: 10 },
    { minDistance: 3, maxDistance: 10, price: 15 },
    { minDistance: 10, maxDistance: 20, price: 25 },
    { minDistance: 20, maxDistance: 50, price: 40 },
  ]);
  const [promoCodes, setPromoCodes] = useState([
    { code: 'WELCOME10', discount: 10, type: 'percentage', maxUses: 100, usedCount: 0 },
    { code: 'FIRST5', discount: 5, type: 'fixed', maxUses: 50, usedCount: 0 },
  ]);
  const [ratings, setRatings] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    const savedOrders = localStorage.getItem('orders');
    const savedPricing = localStorage.getItem('pricingRules');
    const savedPromoCodes = localStorage.getItem('promoCodes');
    const savedRatings = localStorage.getItem('ratings');
    
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
    
    if (savedPricing) {
      setPricingRules(JSON.parse(savedPricing));
    }
    
    if (savedPromoCodes) {
      setPromoCodes(JSON.parse(savedPromoCodes));
    }
    
    if (savedRatings) {
      setRatings(JSON.parse(savedRatings));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('pricingRules', JSON.stringify(pricingRules));
  }, [pricingRules]);

  useEffect(() => {
    localStorage.setItem('promoCodes', JSON.stringify(promoCodes));
  }, [promoCodes]);

  useEffect(() => {
    localStorage.setItem('ratings', JSON.stringify(ratings));
  }, [ratings]);

  const calculateDistance = async (from, to) => {
    if (!from || !to) return 0;

    // Yandex Maps API'si henüz yüklenmediyse bekle
    if (!window.ymaps || typeof window.ymaps.route !== 'function') {
      console.warn("Yandex Maps API not loaded yet for distance calculation or route function unavailable.");
      // Alternatif olarak Haversine kullanılabilir veya hata döndürülebilir
      // Şimdilik Haversine ile devam edelim, ancak ideal olan API'nin yüklenmesini beklemek
      const R = 6371; // Radius of the Earth in km
      const dLat = (to.lat - from.lat) * Math.PI / 180;
      const dLon = (to.lng - from.lng) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const haversineDistance = R * c;
      console.warn(`Falling back to Haversine distance: ${haversineDistance.toFixed(2)} km`);
      return haversineDistance;
    }

    try {
      const route = await window.ymaps.route([
        [from.lat, from.lng],
        [to.lat, to.lng]
      ]);
      const distanceInMeters = route.getLength();
      return distanceInMeters / 1000; // Kilometreye çevir
    } catch (error) {
      console.error("Error calculating distance with Yandex Maps API:", error);
      toast({
        title: "Mesafe Hesaplama Hatası",
        description: "Yandex Maps API ile mesafe hesaplanırken bir sorun oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
      // Hata durumunda Haversine formülü ile fallback yapılabilir veya 0 döndürülebilir.
      const R = 6371;
      const dLat = (to.lat - from.lat) * Math.PI / 180;
      const dLon = (to.lng - from.lng) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const haversineDistance = R * c;
      console.warn(`Falling back to Haversine distance due to API error: ${haversineDistance.toFixed(2)} km`);
      return haversineDistance;
    }
  };

  const calculatePrice = (distance, promoCode = null) => {
    const rule = pricingRules
      .sort((a,b) => a.minDistance - b.minDistance)
      .find(r => distance >= r.minDistance && distance < r.maxDistance);
    
    let basePrice = rule ? rule.price : 0;
    
    if (!rule) {
      const maxRule = pricingRules.reduce((max, r) => r.maxDistance > max.maxDistance ? r : max, pricingRules[0]);
      basePrice = maxRule ? maxRule.price : 0;
    }

    // Apply promo code discount
    if (promoCode) {
      const promo = promoCodes.find(p => p.code === promoCode && p.usedCount < p.maxUses);
      if (promo) {
        if (promo.type === 'percentage') {
          basePrice = basePrice * (1 - promo.discount / 100);
        } else {
          basePrice = Math.max(0, basePrice - promo.discount);
        }
      }
    }

    return Math.round(basePrice * 100) / 100;
  };

  const calculateEstimatedTime = (distance) => {
    // Base time: 15 minutes for pickup + 2 minutes per km
    const baseTime = 15;
    const timePerKm = 2;
    const estimatedMinutes = baseTime + (distance * timePerKm);
    
    const hours = Math.floor(estimatedMinutes / 60);
    const minutes = Math.round(estimatedMinutes % 60);
    
    if (hours > 0) {
      return `${hours} saat ${minutes} dakika`;
    }
    return `${minutes} dakika`;
  };

  const createOrder = async (orderData) => {
    const distance = await calculateDistance(orderData.pickupLocation, orderData.deliveryLocation);

    if (distance === null || typeof distance === 'undefined') {
        toast({
            title: "Sipariş Oluşturulamadı",
            description: "Konumlar arası mesafe hesaplanırken bir sorun oluştu. Lütfen tekrar deneyin.",
            variant: "destructive",
        });
        return null;
    }

    const price = calculatePrice(distance, orderData.promoCode);
    const estimatedTime = calculateEstimatedTime(distance);
    
    const newOrder = {
      id: Date.now().toString(),
      ...orderData,
      distance: Math.round(distance * 100) / 100,
      price,
      estimatedTime,
      status: 'pending',
      createdAt: new Date().toISOString(),
      courierId: null,
      courierName: null,
      rating: null,
      ratingComment: null,
    };

    setOrders(prev => [newOrder, ...prev]);
    
    if (orderData.promoCode) {
      const promoIndex = promoCodes.findIndex(p => p.code === orderData.promoCode);
      if (promoIndex !== -1) {
        const updatedPromoCodes = [...promoCodes];
        updatedPromoCodes[promoIndex].usedCount += 1;
        setPromoCodes(updatedPromoCodes);
      }
    }
    
    toast({
      title: t('toast.order_created'),
      description: t('toast.order_created_description', { id: newOrder.id, price: price }),
    });

    return newOrder;
  };

  const acceptOrder = (orderId, courierId, courierName) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'accepted', courierId, courierName, acceptedAt: new Date().toISOString() }
        : order
    ));
    
    toast({
      title: t('toast.order_accepted'),
      description: t('toast.order_accepted_description', { id: orderId }),
    });
  };

  const updateOrderStatus = (orderId, status) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status, updatedAt: new Date().toISOString() }
        : order
    ));
    
    const statusMessages = {
      'in-transit': t('toast.order_status_in_transit'),
      'delivered': t('toast.order_status_delivered'),
    };
    
    toast({
      title: t('toast.order_updated'),
      description: statusMessages[status] || t('toast.order_status_updated', { status }),
    });
  };

  const rateOrder = (orderId, rating, comment) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, rating, ratingComment: comment, ratedAt: new Date().toISOString() }
        : order
    ));

    const newRating = {
      id: Date.now().toString(),
      orderId,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };

    setRatings(prev => [newRating, ...prev]);
    
    toast({
      title: "Değerlendirme Gönderildi",
      description: "Siparişiniz başarıyla değerlendirildi.",
    });
  };

  const updatePricingRules = (newRules) => {
    setPricingRules(newRules);
    toast({
      title: "Fiyatlandırma Güncellendi",
      description: "Fiyatlandırma kuralları başarıyla güncellendi.",
    });
  };

  const addPromoCode = (promoCode) => {
    setPromoCodes(prev => [...prev, { ...promoCode, usedCount: 0 }]);
    toast({
      title: "Promosyon Kodu Eklendi",
      description: "Yeni promosyon kodu başarıyla eklendi.",
    });
  };

  const deletePromoCode = (code) => {
    setPromoCodes(prev => prev.filter(p => p.code !== code));
    toast({
      title: "Promosyon Kodu Silindi",
      description: "Promosyon kodu başarıyla silindi.",
    });
  };

  const validatePromoCode = (code) => {
    const promo = promoCodes.find(p => p.code === code);
    if (!promo) return { valid: false, message: "Geçersiz promosyon kodu" };
    if (promo.usedCount >= promo.maxUses) return { valid: false, message: "Promosyon kodu kullanım limiti doldu" };
    return { valid: true, promo };
  };

  const getOrderHistory = (userId, role) => {
    if (role === 'customer') {
      return orders.filter(order => order.userId === userId);
    } else if (role === 'courier') {
      return orders.filter(order => order.courierId === userId);
    }
    return orders;
  };

  const getAverageRating = (courierId) => {
    const courierOrders = orders.filter(order => order.courierId === courierId && order.rating);
    if (courierOrders.length === 0) return 0;
    
    const totalRating = courierOrders.reduce((sum, order) => sum + order.rating, 0);
    return Math.round((totalRating / courierOrders.length) * 10) / 10;
  };

  const value = {
    orders,
    pricingRules,
    promoCodes,
    ratings,
    createOrder,
    acceptOrder,
    updateOrderStatus,
    rateOrder,
    updatePricingRules,
    addPromoCode,
    deletePromoCode,
    validatePromoCode,
    calculateDistance,
    calculatePrice,
    calculateEstimatedTime,
    getOrderHistory,
    getAverageRating,
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};