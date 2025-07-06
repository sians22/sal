import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, RefreshControl, Button as NativeButton } from 'react-native';
import { supabase } from '../../lib/supabaseClient';
import { useAuthCourier } from '../../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';

// Sipariş durumlarını Rusça'ya çevirecek bir helper fonksiyon
const translateStatus = (status) => {
  const statusMap = {
    'new': 'Новый',
    'preparing': 'Готовится',
    'ready_for_pickup': 'Готов к выдаче',
    'courier_assigned': 'Курьер назначен',
    'on_the_way': 'В пути',
    'delivered': 'Доставлен',
    'cancelled': 'Отменен'
  };
  return statusMap[status] || status;
};

const OrderCard = ({ order, onPress, onAccept, onReject, canAccept }) => (
  <View style={styles.card}>
    <TouchableOpacity onPress={() => onPress(order)}>
      <Text style={styles.cardTitle}>Sipariş ID: {order.order_id}</Text>
      <Text>Müşteri Adresi: {order.delivery_address}</Text>
      <Text>İşletme: {order.Предприятия?.name || 'Bilinmiyor'}</Text>
      <Text>Durum: <Text style={styles.statusText}>{translateStatus(order.order_status)}</Text></Text>
      <Text>Tutar: {order.total_amount?.toFixed(2)} TL</Text>
      {/* Kurye kazancı eklenebilir */}
    </TouchableOpacity>
    {canAccept && order.order_status === 'ready_for_pickup' && !order.courier_user_id && (
      <View style={styles.actionButtons}>
        <NativeButton title="Kabul Et" onPress={() => onAccept(order.order_id)} color="green" />
        {/* <NativeButton title="Reddet" onPress={() => onReject(order.order_id)} color="red" /> */}
      </View>
    )}
  </View>
);

const OrderListScreen = ({ navigation }) => {
  const { user, session, isCourier } = useAuthCourier();
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationErrorMsg, setLocationErrorMsg] = useState(null);
  const [availabilityStatus, setAvailabilityStatus] = useState('offline'); // 'online', 'offline', 'on_delivery'

  // Konum izni ve mevcut konumu alma
  const requestLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocationErrorMsg('Konum izni reddedildi.');
      Alert.alert('İzin Gerekli', 'Kurye olarak çalışabilmek için konum izni vermeniz gerekmektedir.');
      return false;
    }
    try {
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
      setLocationErrorMsg(null);
      // Kuryenin konumunu Supabase'e kaydet
      if (user && currentLocation.coords) {
        updateCourierLocation(currentLocation.coords.latitude, currentLocation.coords.longitude);
      }
      return true;
    } catch (e) {
      setLocationErrorMsg('Konum alınamadı.');
      console.error("Error getting location:", e);
      return false;
    }
  };

  // Kurye konumunu Supabase'e güncelleme
  const updateCourierLocation = async (latitude, longitude) => {
    if (!user) return;
    try {
      const { error: updateError } = await supabase
        .from('Курьеры_Детали')
        .update({
            current_latitude: latitude,
            current_longitude: longitude,
            // updated_at: new Date() // Trigger hallediyor
        })
        .eq('user_id', user.id);
      if (updateError) throw updateError;
      console.log('Courier location updated:', latitude, longitude);
    } catch (err) {
      console.error('Error updating courier location:', err);
    }
  };

  // Kurye müsaitlik durumunu güncelleme
  const updateAvailabilityStatus = async (status) => {
    if (!user) return;
    setAvailabilityStatus(status); // UI'ı hemen güncelle
    try {
      const { error: updateError } = await supabase
        .from('Курьеры_Детали')
        .update({ availability_status: status })
        .eq('user_id', user.id);
      if (updateError) throw updateError;
      console.log('Courier availability updated:', status);
      if (status === 'online') {
        await requestLocation(); // Online olunca konumu al/güncelle
      }
    } catch (err) {
      console.error('Error updating courier availability:', err);
      Alert.alert('Hata', 'Müsaitlik durumu güncellenemedi.');
    }
  };

  // Periyodik konum güncelleme (kurye online iken)
  useEffect(() => {
    let locationInterval;
    if (availabilityStatus === 'online' && user) {
      requestLocation(); // İlk konumu hemen al
      locationInterval = setInterval(async () => {
        console.log("Attempting periodic location update...");
        await requestLocation();
      }, 30000); // 30 saniyede bir
    }
    return () => {
      if (locationInterval) clearInterval(locationInterval);
    };
  }, [availabilityStatus, user]);


  const fetchOrders = useCallback(async () => {
    if (!user || !isCourier) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Kuryeye uygun (henüz atanmamış ve hazır) siparişler
      const { data: available, error: availableError } = await supabase
        .from('Заказы')
        .select(`*, Предприятия (business_id, name)`)
        .eq('order_status', 'ready_for_pickup')
        .is('courier_user_id', null) // Henüz kurye atanmamış
        .order('created_at', { ascending: true });
      if (availableError) throw availableError;
      setAvailableOrders(available || []);

      // Kuryenin aldığı (aktif) siparişler
      const { data: mine, error: mineError } = await supabase
        .from('Заказы')
        .select(`*, Предприятия (business_id, name)`)
        .eq('courier_user_id', user.id)
        .not('order_status', 'in', ['delivered', 'cancelled']) // Teslim edilmiş veya iptal edilmişleri gösterme
        .order('created_at', { ascending: false });
      if (mineError) throw mineError;
      setMyOrders(mine || []);

    } catch (err) {
      console.error('Error fetching courier orders:', err);
      setError(err.message || 'Siparişler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, isCourier]);

  useFocusEffect(
    useCallback(() => {
      if (user && isCourier) {
        fetchOrders();
        // Kurye detaylarından müsaitlik durumunu çek
        supabase.from('Курьеры_Детали').select('availability_status').eq('user_id', user.id).single()
          .then(({data, error}) => {
            if (data) setAvailabilityStatus(data.availability_status);
            if (error) console.error("Error fetching availability status:", error);
          });
      } else if (!loading && !session) {
          navigation.navigate('CourierLogin');
      }
    }, [user, isCourier, fetchOrders, loading, session, navigation])
  );

  // Realtime sipariş güncellemeleri
  useEffect(() => {
    if (!user || !isCourier) return;

    const ordersSubscription = supabase
      .channel('public:Заказы:courier')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'Заказы' },
        (payload) => {
          console.log('Sipariş değişikliği (Kurye):', payload);
          // Basitçe listeyi yeniden çek veya daha akıllı güncelleme yap
          fetchOrders();
        }
      ).subscribe((status, err) => {
        if (status === 'SUBSCRIBED') console.log('Kurye siparişleri için Realtime bağlandı!');
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') console.error('Realtime hatası (Kurye Siparişleri):', err || status);
      });

    return () => {
      supabase.removeChannel(ordersSubscription);
    };
  }, [user, isCourier, fetchOrders]);

  const handleAcceptOrder = async (orderId) => {
    if (!user) return;
    try {
      const { error: updateError } = await supabase
        .from('Заказы')
        .update({ courier_user_id: user.id, order_status: 'courier_assigned' })
        .eq('order_id', orderId)
        .is('courier_user_id', null); // Başka bir kurye kapmadıysa

      if (updateError) throw updateError;
      Alert.alert('Başarılı', 'Sipariş kabul edildi.');
      fetchOrders(); // Listeyi yenile
      navigation.navigate('OrderDetail', { orderId }); // Kabul edilen siparişin detayına git
    } catch (err) {
      console.error('Error accepting order:', err);
      Alert.alert('Hata', 'Sipariş kabul edilirken bir sorun oluştu: ' + err.message);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, [fetchOrders]);

  if (loading && !refreshing && myOrders.length === 0 && availableOrders.length === 0) {
    return <View style={styles.centered}><ActivityIndicator size="large" /><Text>Siparişler Yükleniyor...</Text></View>;
  }
   if (!user && !loading) {
    return (
      <View style={styles.centered}>
        <Text>Siparişleri görmek için lütfen giriş yapın.</Text>
        <NativeButton title="Giriş Yap" onPress={() => navigation.navigate('CourierLogin')} />
      </View>
    );
  }
  if (!isCourier && user && !loading) {
     return <View style={styles.centered}><Text>Bu alanı görüntüleme yetkiniz yok.</Text></View>;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Durumunuz: </Text>
        <TouchableOpacity
            style={[styles.statusButton, availabilityStatus === 'online' && styles.onlineButton]}
            onPress={() => updateAvailabilityStatus(availabilityStatus === 'online' ? 'offline' : 'online')}>
            <Text style={styles.statusButtonText}>
                {availabilityStatus === 'online' ? 'Çevrimiçi (Online)' : 'Çevrimdışı (Offline)'}
            </Text>
        </TouchableOpacity>
      </View>
      {locationErrorMsg && <Text style={styles.locationError}>{locationErrorMsg}</Text>}
      {/* location && <Text>Konum: {location.latitude}, {location.longitude}</Text> */}

      <Text style={styles.header}>Aktif Siparişlerim ({myOrders.length})</Text>
      {myOrders.length === 0 && !loading && <Text style={styles.emptyText}>Şu anda aktif siparişiniz bulunmuyor.</Text>}
      <FlatList
        data={myOrders}
        keyExtractor={(item) => `my-${item.order_id.toString()}`}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={(selectedOrder) => navigation.navigate('OrderDetail', { orderId: selectedOrder.order_id })}
            canAccept={false} // Zaten kabul edilmiş
          />
        )}
        listEmptyComponent={!loading && myOrders.length === 0 ? null : null}
      />

      <Text style={styles.header}>Alınabilir Siparişler ({availableOrders.length})</Text>
      {availabilityStatus !== 'online' && <Text style={styles.infoText}>Yeni siparişleri görmek için çevrimiçi olun.</Text>}
      {availabilityStatus === 'online' && availableOrders.length === 0 && !loading && <Text style={styles.emptyText}>Şu anda alınabilir yeni sipariş bulunmuyor.</Text>}
      {availabilityStatus === 'online' && (
        <FlatList
          data={availableOrders}
          keyExtractor={(item) => `available-${item.order_id.toString()}`}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onPress={(selectedOrder) => navigation.navigate('OrderDetail', { orderId: selectedOrder.order_id })}
              onAccept={handleAcceptOrder}
              canAccept={true}
            />
          )}
          listEmptyComponent={!loading && availableOrders.length === 0 ? null : null}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8', paddingHorizontal:5 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10, paddingHorizontal: 10,},
  card: { backgroundColor: 'white', borderRadius: 8, padding: 15, marginBottom: 10, marginHorizontal:5, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2},
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  statusText: { fontWeight: 'bold' },
  errorText: { color: 'red', textAlign: 'center', margin:10 },
  emptyText: { textAlign: 'center', marginVertical: 15, color: '#666', paddingHorizontal: 10,},
  infoText: { textAlign: 'center', marginVertical: 10, color: 'blue', paddingHorizontal: 10,},
  actionButtons: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, paddingTop:10, borderTopWidth:1, borderTopColor:'#eee' },
  statusContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderBottomWidth:1, borderBottomColor:'#eee', marginBottom:10},
  statusLabel: { fontSize: 16, marginRight: 10 },
  statusButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, backgroundColor: '#ccc' },
  onlineButton: { backgroundColor: 'green' },
  statusButtonText: { color: 'white', fontWeight: 'bold' },
  locationError: { color: 'orange', textAlign: 'center', marginBottom: 10}
});

export default OrderListScreen;
