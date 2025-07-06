import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Button as NativeButton, ScrollView, Linking } from 'react-native';
import { supabase } from '../../lib/supabaseClient';
import { useAuthCourier } from '../../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
// react-native-maps kurulumu bir sonraki adımda yapılacak
// import MapView, { Marker } from 'react-native-maps';

// Sipariş durumlarını Rusça'ya çevirecek bir helper fonksiyon
const translateStatus = (status) => {
  const statusMap = { /* ... OrderListScreen'deki gibi ... */ };
  return statusMap[status] || status;
};


const OrderDetailScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const { user } = useAuthCourier();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrderDetail = useCallback(async () => {
    if (!orderId || !user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('Заказы')
        .select(`
          *,
          Предприятия (business_id, name, address, latitude, longitude, phone_number),
          Позиции_Заказа (
            *,
            Продукты (product_id, name, price)
          ),
          Клиент:customer_user_id (user_id, email, first_name, last_name, phone_number)
        `)
        .eq('order_id', orderId)
        // .eq('courier_user_id', user.id) // Sadece kuryenin kendi siparişini görmesi için RLS ile de sağlanabilir
        .single();

      if (fetchError) throw fetchError;
      setOrder(data);
      if (data) {
        navigation.setOptions({ title: `Sipariş #${data.order_id}` });
      }
    } catch (err) {
      console.error('Error fetching order detail:', err);
      setError(err.message || 'Sipariş detayı yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [orderId, user, navigation]);

  useFocusEffect(fetchOrderDetail);

  // Sipariş detayındaki değişiklikleri dinle
  useEffect(() => {
    if (!orderId) return;
    const orderDetailSubscription = supabase
      .channel(`public:Заказы:order_id=eq.${orderId}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'Заказы', filter: `order_id=eq.${orderId}`},
        payload => {
          console.log('Order detail updated (Realtime):', payload.new);
          setOrder(prevOrder => ({ ...prevOrder, ...payload.new }));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(orderDetailSubscription);
    };
  }, [orderId]);

  const handleUpdateOrderStatus = async (newStatus) => {
    if (!order || !user || order.courier_user_id !== user.id) {
        Alert.alert("Hata", "Bu sipariş üzerinde işlem yapma yetkiniz yok.");
        return;
    }
    setUpdatingStatus(true);
    try {
        const updates = { order_status: newStatus };
        if (newStatus === 'delivered') {
            updates.actual_delivery_time = new Date().toISOString();
            updates.payment_status = 'paid'; // Kapıda ödeme ise teslimatta 'paid' yap
        }

        const { error: updateError } = await supabase
            .from('Заказы')
            .update(updates)
            .eq('order_id', order.order_id)
            .eq('courier_user_id', user.id); // Güvenlik için tekrar kontrol

        if (updateError) throw updateError;

        setOrder(prevOrder => ({ ...prevOrder, ...updates }));
        Alert.alert("Başarılı", `Sipariş durumu "${translateStatus(newStatus)}" olarak güncellendi.`);
        if (newStatus === 'delivered') {
            navigation.goBack(); // Teslim edildiyse listeye dön
        }
    } catch (err) {
        console.error("Error updating order status:", err);
        Alert.alert("Hata", "Sipariş durumu güncellenirken bir sorun oluştu: " + err.message);
    } finally {
        setUpdatingStatus(false);
    }
  };

  const openMapForAddress = (latitude, longitude, label) => {
    if (!latitude || !longitude) {
        Alert.alert("Konum Yok", "Bu adres için harita konumu bulunmuyor.");
        return;
    }
    const scheme = Platform.OS === 'ios' ? 'maps://0,0?q=' : 'geo:0,0?q=';
    const latLng = `${latitude},${longitude}`;
    const url = Platform.OS === 'ios' ? `${scheme}${label}@${latLng}` : `${scheme}${latLng}(${label})`;
    Linking.openURL(url).catch(err => Alert.alert("Harita Açılamadı", "Harita uygulaması açılamadı."));
  };


  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" /><Text>Sipariş Detayı Yükleniyor...</Text></View>;
  }
  if (error) {
    return <View style={styles.centered}><Text style={styles.errorText}>Hata: {error}</Text></View>;
  }
  if (!order) {
    return <View style={styles.centered}><Text>Sipariş bulunamadı veya erişim yetkiniz yok.</Text></View>;
  }

  const business = order.Предприятия;
  const customer = order.Клиент;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sipariş Bilgileri</Text>
        <Text>ID: {order.order_id}</Text>
        <Text>Durum: <Text style={styles.statusText}>{translateStatus(order.order_status)}</Text></Text>
        <Text>Toplam Tutar: {order.total_amount?.toFixed(2)} TL</Text>
        <Text>Ödeme Yöntemi: {order.payment_method === 'cash_on_delivery' ? 'Kapıda Nakit' : 'Online Ödeme'}</Text>
        <Text>Ödeme Durumu: {order.payment_status}</Text>
        <Text>Sipariş Tarihi: {new Date(order.created_at).toLocaleString('tr-TR')}</Text>
      </View>

      {business && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İşletme Bilgileri (Alınacak Yer)</Text>
          <Text>Adı: {business.name}</Text>
          <Text>Adres: {business.address}</Text>
          {business.phone_number && <Text>Telefon: {business.phone_number}</Text>}
          {business.latitude && business.longitude && (
            <NativeButton title="Haritada Göster" onPress={() => openMapForAddress(business.latitude, business.longitude, business.name)} />
          )}
          {/* <MapView initialRegion={...}><Marker coordinate={...} /></MapView> */}
        </View>
      )}

      {customer && (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Müşteri Bilgileri (Teslimat Adresi)</Text>
            <Text>Ad Soyad: {customer.first_name || ''} {customer.last_name || ''}</Text>
            <Text>Adres: {order.delivery_address}</Text>
            <Text>Telefon: {order.contact_phone || customer.phone_number}</Text>
            {order.delivery_latitude && order.delivery_longitude && (
                 <NativeButton title="Haritada Göster" onPress={() => openMapForAddress(order.delivery_latitude, order.delivery_longitude, 'Müşteri Adresi')} />
            )}
            {/* <MapView initialRegion={...}><Marker coordinate={...} /></MapView> */}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sipariş İçeriği</Text>
        {order.Позиции_Заказа?.map(item => (
          <View key={item.order_item_id} style={styles.orderItem}>
            <Text>{item.Продукты?.name || 'Ürün Adı Yok'} (x{item.quantity})</Text>
            <Text>{(item.price_per_unit * item.quantity).toFixed(2)} TL</Text>
          </View>
        ))}
      </View>

      {/* Kurye Sipariş Durum Güncelleme Butonları */}
      {order.courier_user_id === user?.id && (
        <View style={styles.actionSection}>
            {order.order_status === 'courier_assigned' && (
                 <NativeButton title={updatingStatus ? "Güncelleniyor..." : "Siparişi İşletmeden Aldım"} onPress={() => handleUpdateOrderStatus('on_the_way')} disabled={updatingStatus} />
            )}
            {order.order_status === 'on_the_way' && (
                 <NativeButton title={updatingStatus ? "Güncelleniyor..." : "Müşteriye Teslim Ettim"} onPress={() => handleUpdateOrderStatus('delivered')} disabled={updatingStatus} color="green"/>
            )}
            {/* İptal vb. diğer durumlar için butonlar eklenebilir */}
        </View>
      )}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  section: { backgroundColor: 'white', padding: 15, marginVertical: 8, marginHorizontal:10, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  statusText: { fontWeight: 'bold'},
  orderItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth:1, borderBottomColor:'#eee'},
  errorText: { color: 'red', textAlign: 'center' },
  actionSection: { padding: 20, borderTopWidth:1, borderTopColor:'#eee', marginTop:10},
});

// Sipariş durumları için translateStatus fonksiyonunu tekrar tanımla (veya global bir helper'a taşı)
translateStatus = (status) => {
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

export default OrderDetailScreen;
