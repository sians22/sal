import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext'; // Oturum açmış kullanıcıyı almak için

// Örnek işletme kartı bileşeni
const BusinessCard = ({ business, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={() => onPress(business)}>
    <Text style={styles.cardTitle}>{business.name || 'İşletme Adı Yok'}</Text>
    <Text style={styles.cardDescription}>{business.description || 'Açıklama yok'}</Text>
    <Text style={styles.cardAddress}>{business.address || 'Adres bilgisi yok'}</Text>
  </TouchableOpacity>
);

const BusinessListScreen = ({ navigation }) => {
  const { user } = useAuth(); // Kullanıcı bilgilerini al
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      setError(null);
      try {
        // Supabase'den 'Предприятия' tablosundaki aktif işletmeleri çek
        // Gerçek RLS politikaları Supabase tarafında uygulanmalı
        const { data, error: fetchError } = await supabase
          .from('Предприятия') // Tablo adı veritabanı şemanızla eşleşmeli
          .select('*')
          .eq('is_active', true); // Sadece aktif işletmeleri listele

        if (fetchError) {
          throw fetchError;
        }
        setBusinesses(data || []);
      } catch (err) {
        console.error('Error fetching businesses:', err);
        setError(err.message || 'İşletmeler yüklenirken bir hata oluştu.');
        Alert.alert('Hata', 'İşletmeler yüklenirken bir sorun oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();

    // Realtime subscription (Opsiyonel: Yeni işletme eklendiğinde veya güncellendiğinde listeyi yenile)
    // Bu, daha karmaşık bir state yönetimi gerektirebilir.
    /*
    const channel = supabase
      .channel('public:Предприятия')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Предприятия' }, payload => {
        console.log('Businesses change received!', payload);
        fetchBusinesses(); // Basitçe listeyi yeniden yükle
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    */

  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>İşletmeler Yükleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Hata: {error}</Text>
        {/* Yeniden deneme butonu eklenebilir */}
      </View>
    );
  }

  if (businesses.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>Gösterilecek aktif işletme bulunamadı.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Hoş Geldiniz, {user?.user_metadata?.first_name || user?.email || 'Kullanıcı'}!</Text>
      <Text style={styles.subHeader}>Sipariş vermek için bir işletme seçin:</Text>
      <FlatList
        data={businesses}
        keyExtractor={(item) => item.business_id.toString()}
        renderItem={({ item }) => (
          <BusinessCard
            business={item}
            onPress={(selectedBusiness) =>
              navigation.navigate('BusinessDetail', { businessId: selectedBusiness.business_id, businessName: selectedBusiness.name })
            }
          />
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f8f8f8',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
    color: '#555',
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  cardAddress: {
    fontSize: 13,
    color: '#888',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});

export default BusinessListScreen;
