import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Button as NativeButton } from 'react-native';
import { supabase } from '../../lib/supabaseClient';
import { useCart } from '../../contexts/CartContext'; // Sepet context'i

// Örnek ürün kartı bileşeni
const ProductCard = ({ product, onAddToCart }) => (
  <View style={styles.productCard}>
    <View style={styles.productInfo}>
      <Text style={styles.productTitle}>{product.name || 'Ürün Adı Yok'}</Text>
      <Text style={styles.productDescription}>{product.description || 'Açıklama yok'}</Text>
      <Text style={styles.productPrice}>{product.price ? `${product.price} TL` : 'Fiyat Belirtilmemiş'}</Text>
    </View>
    <NativeButton title="Sepete Ekle" onPress={() => onAddToCart(product)} color="#007bff" />
  </View>
);

const BusinessDetailScreen = ({ route, navigation }) => {
  const { businessId, businessName } = route.params;
  const { addItemToCart, getItemCount } = useCart(); // Sepet fonksiyonlarını al
  const [products, setProducts] = useState([]);
  const [businessDetails, setBusinessDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    navigation.setOptions({ title: businessName || 'İşletme Detayı' });

    const fetchBusinessDetailsAndProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // İşletme detaylarını çek
        const { data: businessData, error: businessError } = await supabase
          .from('Предприятия')
          .select('*')
          .eq('business_id', businessId)
          .single();

        if (businessError) throw businessError;
        setBusinessDetails(businessData);

        // İşletmeye ait ürünleri çek
        const { data: productsData, error: productsError } = await supabase
          .from('Продукты')
          .select('*')
          .eq('business_id', businessId)
          .eq('is_available', true); // Sadece mevcut ürünleri listele

        if (productsError) throw productsError;
        setProducts(productsData || []);

      } catch (err) {
        console.error('Error fetching business details or products:', err);
        setError(err.message || 'Veriler yüklenirken bir hata oluştu.');
        Alert.alert('Hata', 'İşletme detayları veya ürünler yüklenirken bir sorun oluştu.');
      } finally {
        setLoading(false);
      }
    };

    if (businessId) {
      fetchBusinessDetailsAndProducts();
    } else {
      setError('İşletme ID bulunamadı.');
      setLoading(false);
    }

    // Ürünlerdeki değişiklikler için Realtime (Opsiyonel)
    /*
    const productChannel = supabase
      .channel(`public:Продукты:business_id=eq.${businessId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'Продукты', filter: `business_id=eq.${businessId}` },
        payload => {
          console.log('Products change received!', payload);
          fetchBusinessDetailsAndProducts(); // Listeyi yeniden yükle
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(productChannel);
    };
    */

  }, [businessId, businessName, navigation]);

  const handleAddToCart = (product) => {
    addItemToCart(product, 1);
    Alert.alert('Sepete Eklendi', `${product.name} sepetinize eklendi.`);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Hata: {error}</Text>
      </View>
    );
  }

  if (!businessDetails) {
     return (
      <View style={styles.centered}>
        <Text>İşletme bilgileri bulunamadı.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.businessTitle}>{businessDetails.name}</Text>
        <Text style={styles.businessAddress}>{businessDetails.address}</Text>
        {/* Diğer işletme bilgileri eklenebilir */}
      </View>

      <Text style={styles.productsHeader}>Ürünler</Text>
      {products.length === 0 ? (
        <Text style={styles.noProductsText}>Bu işletmede şu anda mevcut ürün bulunmamaktadır.</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.product_id.toString()}
          renderItem={({ item }) => <ProductCard product={item} onAddToCart={handleAddToCart} />}
          contentContainerStyle={styles.listContainer}
        />
      )}
       <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <Text style={styles.cartButtonText}>Sepete Git ({getItemCount()})</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  businessTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  businessAddress: {
    fontSize: 14,
    color: '#666',
  },
  productsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  noProductsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 80, // Sepete git butonu için boşluk
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productInfo: {
    flex: 1,
    marginRight: 10,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  productDescription: {
    fontSize: 13,
    color: '#777',
    marginVertical: 3,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  cartButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cartButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BusinessDetailScreen;
