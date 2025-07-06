import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { CardField, useStripe, StripeContainer } from '@stripe/stripe-react-native'; // Stripe bileşenleri

const CheckoutScreen = ({ navigation }) => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user, session } = useAuth();
  const { confirmPayment, createPaymentMethod } = useStripe(); // Stripe hook'ları

  const [deliveryAddress, setDeliveryAddress] = useState(user?.user_metadata?.default_address || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || user?.user_metadata?.phone_number || '');
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cardDetails, setCardDetails] = useState(null); // Stripe kart bilgilerinin tamamlanıp tamamlanmadığı

  const processOnlinePaymentAndOrder = async (orderDataForSupabase) => {
    if (!cardDetails?.complete) {
      Alert.alert('Hata', 'Lütfen geçerli kart bilgilerinizi girin.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // 1. Supabase Edge Function'ı çağırarak PaymentIntent oluştur (Stripe Secret Key ile backend'de)
      // Bu fonksiyon sipariş tutarını ve para birimini almalı.
      const { data: paymentIntentResult, error: intentError } = await supabase.functions.invoke(
        'create-payment-intent', // Supabase Edge Function adınız
        {
          body: {
            amount: Math.round(getCartTotal() * 100), // Stripe kuruş cinsinden alır
            currency: 'try', // Para birimi
            customer_email: user.email, // Stripe customer oluşturmak için (opsiyonel)
            // order_id: geçici bir sipariş ID'si veya sepet ID'si gönderilebilir
          }
        }
      );

      if (intentError) throw intentError;
      if (!paymentIntentResult || !paymentIntentResult.clientSecret) {
        throw new Error('PaymentIntent client secret alınamadı.');
      }

      const clientSecret = paymentIntentResult.clientSecret;
      const orderIdForPayment = paymentIntentResult.orderId; // Edge function'dan gelen geçici order_id

      // 2. Kart bilgilerini kullanarak ödemeyi onayla (Client-side)
      const { paymentIntent, error: paymentError } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
        // paymentMethodData: { billingDetails: { name: `${user.user_metadata?.first_name} ${user.user_metadata?.last_name}` } } // Gerekirse
      });

      if (paymentError) {
        console.error('Stripe payment confirmation error:', paymentError);
        Alert.alert('Ödeme Başarısız', paymentError.message || 'Ödeme sırasında bir hata oluştu.');
        // Burada geçici oluşturulan siparişi (eğer varsa) iptal etme/silme mantığı eklenebilir.
        setLoading(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'Succeeded') {
        // 3. Ödeme başarılı, şimdi siparişi Supabase'e kaydet (payment_status: 'paid')
        const finalOrderData = {
          ...orderDataForSupabase,
          payment_status: 'paid',
          // payment_intent_id: paymentIntent.id, // Stripe payment intent ID'sini kaydetmek iyi bir pratik
        };

        await createOrderInSupabase(finalOrderData);

      } else {
        Alert.alert('Ödeme Onaylanmadı', 'Ödeme durumu: ' + paymentIntent?.status);
      }

    } catch (err) {
      console.error('Online payment or order creation error:', err);
      setError(err.message || 'Online ödeme veya sipariş oluşturma sırasında bir hata oluştu.');
      Alert.alert('İşlem Başarısız', err.message || 'Bir sorunla karşılaşıldı.');
    } finally {
      setLoading(false);
    }
  };

  const createOrderInSupabase = async (orderPayload) => {
      // Bu fonksiyon hem online hem de kapıda ödeme için kullanılabilir.
      // Online ödemede payment_status zaten 'paid' olarak gelir.
      setLoading(true); // Bu loading, genel sipariş verme süreci için
      try {
        const { data: newOrder, error: orderError } = await supabase
          .from('Заказы')
          .insert([orderPayload])
          .select()
          .single();

        if (orderError) throw orderError;
        if (!newOrder || !newOrder.order_id) throw new Error('Sipariş ID alınamadı.');

        const orderItemsData = cartItems.map(item => ({
          order_id: newOrder.order_id,
          product_id: item.product.product_id,
          quantity: item.quantity,
          price_per_unit: item.product.price,
          total_price_for_item: item.product.price * item.quantity,
        }));

        const { error: itemsError } = await supabase.from('Позиции_Заказа').insert(orderItemsData);

        if (itemsError) {
          console.error('Sipariş kalemleri eklenirken hata, ana sipariş siliniyor (rollback):', newOrder.order_id);
          await supabase.from('Заказы').delete().eq('order_id', newOrder.order_id);
          throw itemsError;
        }

        Alert.alert('Sipariş Başarılı!', `Siparişiniz alındı. Sipariş ID: ${newOrder.order_id}`);
        clearCart();
        navigation.replace('OrderHistory');
      } catch (err) {
        console.error('Error creating order in Supabase:', err);
        setError(err.message || 'Sipariş Supabase\'e kaydedilirken bir hata oluştu.');
        Alert.alert('Sipariş Kaydı Başarısız', err.message || 'Siparişiniz kaydedilirken bir sorunla karşılaşıldı.');
        // Online ödeme başarılı olduysa ama sipariş kaydı başarısızsa, bu durum ayrıca ele alınmalı (örn: manuel iade süreci).
      } finally {
        setLoading(false);
      }
  };


  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim() || !contactPhone.trim()) {
      Alert.alert('Hata', 'Lütfen teslimat adresi ve iletişim telefonu bilgilerini girin.');
      return;
    }
    if (cartItems.length === 0) { Alert.alert('Hata', 'Sepetiniz boş.'); navigation.navigate('BusinessList'); return; }
    if (!user || !session) { Alert.alert('Hata', 'Sipariş için giriş yapmalısınız.'); navigation.navigate('Login'); return; }

    const orderPayload = {
      customer_user_id: user.id,
      business_id: cartItems.length > 0 ? cartItems[0].product.business_id : null,
      delivery_address: deliveryAddress,
      contact_phone: contactPhone,
      payment_method: paymentMethod,
      payment_status: 'pending', // Online ödeme başarılı olursa 'paid' olacak
      total_amount: getCartTotal(),
      order_status: 'new',
    };

    if (!orderPayload.business_id) {
        Alert.alert('Hata', 'Sipariş verilecek işletme belirlenemedi.');
        return;
    }

    if (paymentMethod === 'online') {
      await processOnlinePaymentAndOrder(orderPayload);
    } else { // Kapıda Ödeme
      await createOrderInSupabase(orderPayload);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Siparişi Tamamla</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Teslimat Bilgileri</Text>
        <TextInput style={styles.input} placeholder="Teslimat Adresi" value={deliveryAddress} onChangeText={setDeliveryAddress} multiline placeholderTextColor="#888"/>
        <TextInput style={styles.input} placeholder="İletişim Telefonu" value={contactPhone} onChangeText={setContactPhone} keyboardType="phone-pad" placeholderTextColor="#888"/>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ödeme Yöntemi</Text>
        <TouchableOpacity style={[styles.paymentOption, paymentMethod === 'cash_on_delivery' && styles.paymentOptionSelected]} onPress={() => setPaymentMethod('cash_on_delivery')}>
            <Text style={paymentMethod === 'cash_on_delivery' ? styles.paymentTextSelected : styles.paymentText}>Kapıda Nakit Ödeme</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.paymentOption, paymentMethod === 'online' && styles.paymentOptionSelected]} onPress={() => setPaymentMethod('online')}>
            <Text style={paymentMethod === 'online' ? styles.paymentTextSelected : styles.paymentText}>Online Kredi/Banka Kartı</Text>
        </TouchableOpacity>
      </View>

      {paymentMethod === 'online' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kart Bilgileri</Text>
          {/* StripeContainer, CardField'in düzgün çalışması için gerekli olabilir bazı durumlarda */}
          {/* <StripeContainer> */}
            <CardField
              postalCodeEnabled={false} // Türkiye için posta kodu genellikle kullanılmaz veya isteğe bağlıdır
              cardStyle={styles.cardField}
              style={styles.cardFieldContainer}
              onCardChange={(details) => {
                setCardDetails(details);
              }}
            />
          {/* </StripeContainer> */}
        </View>
      )}

      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>Sipariş Özeti</Text>
        {cartItems.map(item => (
          <View key={item.product.product_id} style={styles.summaryItem}>
            <Text>{item.product.name} (x{item.quantity})</Text>
            <Text>{(item.product.price * item.quantity).toFixed(2)} TL</Text>
          </View>
        ))}
        <View style={styles.summaryTotal}>
          <Text style={styles.summaryTotalText}>Toplam:</Text>
          <Text style={styles.summaryTotalText}>{getCartTotal().toFixed(2)} TL</Text>
        </View>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Button
        title={loading ? "Sipariş Veriliyor..." : "Sipariş Ver"}
        onPress={handlePlaceOrder}
        disabled={loading || cartItems.length === 0 || (paymentMethod === 'online' && !cardDetails?.complete)}
        color="#28a745"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#f8f8f8' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  section: { marginBottom: 20, backgroundColor: 'white', padding: 15, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#444' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 5, paddingVertical: Platform.OS === 'ios' ? 15 : 10, paddingHorizontal: 15, marginBottom: 10, fontSize: 16 },
  paymentOption: { paddingVertical: 15, paddingHorizontal: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 5, marginBottom: 10 },
  paymentOptionSelected: { borderColor: '#007bff', backgroundColor: '#e7f3ff' },
  paymentText: { fontSize: 16, color: '#333' },
  paymentTextSelected: { fontSize: 16, color: '#007bff', fontWeight: 'bold' },
  cardFieldContainer: { height: 50, marginVertical: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 5 },
  cardField: { width: '100%', height: '100%', color: '#000' /* Kart yazı rengi */ },
  summarySection: { marginTop: 10, marginBottom: 20, backgroundColor: 'white', padding: 15, borderRadius: 8 },
  summaryTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  summaryItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  summaryTotal: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, marginTop: 10, borderTopWidth: 1, borderTopColor: '#eee' },
  summaryTotalText: { fontSize: 18, fontWeight: 'bold' },
  errorText: { color: 'red', textAlign: 'center', marginBottom: 10 },
});

export default CheckoutScreen;
