import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, RefreshControl, Button as NativeButton, Platform } from 'react-native';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

// Sipariş durumlarını Rusça'ya çevirecek bir helper fonksiyon
const translateStatus = (status) => {
  const statusMap = { /* ... önceki gibi ... */ };
  return statusMap[status] || status;
};

const OrderCard = ({ order, onPress, onReview }) => {
  const isDelivered = order.order_status === 'delivered';
  // const hasReview = order.Отзывы && order.Отзывы.length > 0; // Eğer siparişe bağlı yorumları çekiyorsak

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => onPress(order)}>
        <Text style={styles.cardTitle}>Sipariş ID: {order.order_id}</Text>
        <Text>İşletme: {order.Предприятия?.name || 'Bilinmiyor'}</Text>
        <Text>Durum: <Text style={styles.statusText}>{translateStatus(order.order_status)}</Text></Text>
        <Text>Tutar: {order.total_amount?.toFixed(2)} TL</Text>
        <Text>Tarih: {new Date(order.created_at).toLocaleString('tr-TR')}</Text>
      </TouchableOpacity>
      {isDelivered && ( // Sadece teslim edilmişse ve yorum yapılmamışsa göster (hasReview kontrolü eklenebilir)
        <View style={styles.reviewButtonContainer}>
          <NativeButton title="Siparişi Değerlendir" onPress={() => onReview(order)} color="#007bff" />
        </View>
      )}
    </View>
  );
};


const OrderHistoryScreen = ({ navigation }) => {
  const { user, session } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!user) { setLoading(false); setRefreshing(false); return; }
    setLoading(true); setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('Заказы')
        .select(`
          *,
          Предприятия (business_id, name),
          Отзывы (review_id)
        `) // Yorum var mı diye kontrol için Отзывы'dan review_id çekebiliriz
        .eq('customer_user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Siparişler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      if (user) { fetchOrders(); }
      else if (!loading && !session) { navigation.navigate('Login'); }
    }, [user, fetchOrders, loading, session, navigation])
  );

  useEffect(() => { // Realtime subscription
    if (!user) return;
    const ordersSubscription = supabase
      .channel(`public:Заказы:customer_user_id=eq.${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Заказы', filter: `customer_user_id=eq.${user.id}`},
        (payload) => {
          console.log('Sipariş değişikliği (Müşteri):', payload);
          fetchOrders(); // En basit güncelleme
        }
      ).subscribe();
    return () => { supabase.removeChannel(ordersSubscription); };
  }, [user, fetchOrders]);

  const handleReviewOrder = async (orderToReview) => {
    if (!user) {
      Alert.alert("Hata", "Değerlendirme yapmak için giriş yapmalısınız.");
      return;
    }

    // Check if a review already exists for this order by this user
    const { data: existingReviews, error: reviewCheckError } = await supabase
        .from('Отзывы')
        .select('review_id')
        .eq('order_id', orderToReview.order_id)
        .eq('customer_user_id', user.id)
        .limit(1);

    if (reviewCheckError) {
        Alert.alert("Hata", "Yorum kontrol edilirken bir sorun oluştu.");
        console.error("Review check error:", reviewCheckError);
        return;
    }

    if (existingReviews && existingReviews.length > 0) {
        Alert.alert("Bilgi", "Bu sipariş için zaten bir değerlendirme yapmışsınız.");
        return;
    }

    // Basit Alert.prompt (iOS only) veya custom modal ile puan ve yorum al
    // Android için custom modal/ekran gerekir.
    // Bu kısım daha sonra geliştirilecek bir Modal component ile değiştirilmeli.
    Alert.prompt(
      'Siparişi Değerlendir',
      `Lütfen ${orderToReview.order_id} ID'li siparişinizi değerlendirin (Puan 1-5):`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Gönder',
          onPress: async (ratingInput) => {
            const ratingScore = parseInt(ratingInput, 10);
            if (isNaN(ratingScore) || ratingScore < 1 || ratingScore > 5) {
              Alert.alert('Hata', 'Lütfen 1 ile 5 arasında geçerli bir puan girin.');
              return;
            }
            // Yorum almak için ikinci bir prompt veya daha iyi bir UI
            Alert.prompt(
                'Yorumunuz (İsteğe Bağlı)',
                'Sipariş hakkındaki yorumlarınızı alabilir miyiz?',
                [
                    {text: 'Atla', onPress: () => submitReview(orderToReview, ratingScore, ''), style: 'cancel'},
                    {text: 'Yorumla Gönder', onPress: (commentInput) => submitReview(orderToReview, ratingScore, commentInput)}
                ],
                'plain-text', // Yorum için
                '' // Default comment
            );
          },
        },
      ],
      'plain-text', // Puan için
      '', // Default rating
      'numeric' // Klavye tipi
    );
  };

  const submitReview = async (reviewedOrder, ratingScore, comment) => {
    try {
      const reviewData = {
        order_id: reviewedOrder.order_id,
        customer_user_id: user.id,
        courier_user_id: reviewedOrder.courier_user_id, // Eğer kurye de değerlendirilecekse
        target_business_id: reviewedOrder.business_id,
        rating_score: ratingScore,
        comment: comment || null,
        review_type: 'order_experience', // veya 'courier_service' vs.
      };

      const { error: insertError } = await supabase.from('Отзывы').insert([reviewData]);
      if (insertError) throw insertError;

      Alert.alert('Teşekkürler!', 'Değerlendirmeniz başarıyla gönderildi.');
      fetchOrders(); // Listeyi yenileyerek "Değerlendir" butonunu gizleyebiliriz (eğer yorum yapıldıysa)
    } catch (err) {
      console.error('Error submitting review:', err);
      Alert.alert('Hata', 'Değerlendirmeniz gönderilirken bir sorun oluştu: ' + err.message);
    }
  };

  const onRefresh = useCallback(() => { setRefreshing(true); fetchOrders(); }, [fetchOrders]);

  if (loading && !refreshing && orders.length === 0) {
    return <View style={styles.centered}><ActivityIndicator size="large" /><Text>Sipariş Geçmişi Yükleniyor...</Text></View>;
  }
  if (error) {
    return <View style={styles.centered}><Text style={styles.errorText}>Hata: {error}</Text><NativeButton title="Yeniden Dene" onPress={fetchOrders} /></View>;
  }
  if (!user && !loading) {
    return (<View style={styles.centered}><Text>Sipariş geçmişinizi görmek için lütfen giriş yapın.</Text><NativeButton title="Giriş Yap" onPress={() => navigation.navigate('Login')} /></View>);
  }
  if (orders.length === 0 && !loading) {
    return (<View style={styles.centered}><Text>Henüz hiç sipariş vermediniz.</Text><NativeButton title="Alışverişe Başla" onPress={() => navigation.navigate('BusinessList')} /></View>);
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.order_id.toString()}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={(selectedOrder) => {
              Alert.alert("Sipariş Detayı", `Sipariş ID: ${selectedOrder.order_id}\nDurum: ${translateStatus(selectedOrder.order_status)}\nTutar: ${selectedOrder.total_amount} TL`);
            }}
            onReview={handleReviewOrder}
          />
        )}
        ListHeaderComponent={<Text style={styles.header}>Sipariş Geçmişim</Text>}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', paddingVertical: 20, color: '#333' },
  listContainer: { paddingHorizontal: 10, paddingBottom: 20 },
  card: { backgroundColor: 'white', borderRadius: 8, padding: 15, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  statusText: { fontWeight: 'bold' },
  errorText: { color: 'red', fontSize: 16, textAlign: 'center' },
  reviewButtonContainer: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#eee' },
});

// translateStatus'ı global scope'a almak veya import/export etmek daha iyi olur.
// Şimdilik OrderCard içinde bırakmıştık, burada da kullanılıyor.
translateStatus = (status) => {
    const statusMap = {
      'new': 'Новый', 'preparing': 'Готовится', 'ready_for_pickup': 'Готов к выдаче',
      'courier_assigned': 'Курьер назначен', 'on_the_way': 'В пути',
      'delivered': 'Доставлен', 'cancelled': 'Отменен'
    };
    return statusMap[status] || status;
};

export default OrderHistoryScreen;
