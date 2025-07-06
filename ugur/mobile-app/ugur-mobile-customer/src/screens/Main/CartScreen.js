import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button as NativeButton, Alert } from 'react-native';
import { useCart } from '../../contexts/CartContext'; // Sepet context'i

const CartItemCard = ({ item, onUpdateQuantity, onRemoveItem }) => (
  <View style={styles.cartItemCard}>
    <View style={styles.itemInfo}>
      <Text style={styles.itemTitle}>{item.product.name}</Text>
      <Text style={styles.itemPrice}>{item.product.price} TL x {item.quantity}</Text>
      <Text style={styles.itemTotal}>Toplam: {(item.product.price * item.quantity).toFixed(2)} TL</Text>
    </View>
    <View style={styles.itemActions}>
      <TouchableOpacity onPress={() => onUpdateQuantity(item.product.product_id, item.quantity - 1)} style={styles.actionButton}>
        <Text style={styles.actionButtonText}>-</Text>
      </TouchableOpacity>
      <Text style={styles.quantityText}>{item.quantity}</Text>
      <TouchableOpacity onPress={() => onUpdateQuantity(item.product.product_id, item.quantity + 1)} style={styles.actionButton}>
        <Text style={styles.actionButtonText}>+</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onRemoveItem(item.product.product_id)} style={[styles.actionButton, styles.removeButton]}>
        <Text style={[styles.actionButtonText, styles.removeButtonText]}>Kaldır</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const CartScreen = ({ navigation }) => {
  const { cartItems, updateItemQuantity, removeItemFromCart, getCartTotal, clearCart, getItemCount } = useCart();

  if (getItemCount() === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyCartText}>Sepetiniz şu anda boş.</Text>
        <NativeButton title="Alışverişe Devam Et" onPress={() => navigation.navigate('BusinessList')} />
      </View>
    );
  }

  const handleCheckout = () => {
    // Checkout ekranına yönlendir ve sepet bilgilerini ilet (veya context'ten erişilecek)
    navigation.navigate('Checkout');
  };

  const handleClearCart = () => {
    Alert.alert(
      "Sepeti Temizle",
      "Sepetinizdeki tüm ürünleri silmek istediğinizden emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        { text: "Evet, Sil", onPress: () => clearCart(), style: "destructive" }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.product.product_id.toString()}
        renderItem={({ item }) => (
          <CartItemCard
            item={item}
            onUpdateQuantity={updateItemQuantity}
            onRemoveItem={removeItemFromCart}
          />
        )}
        ListHeaderComponent={<Text style={styles.header}>Sepetim</Text>}
        ListFooterComponent={
          <View style={styles.footerContainer}>
            <Text style={styles.totalText}>Toplam Tutar: {getCartTotal().toFixed(2)} TL</Text>
            <NativeButton title="Siparişi Tamamla" onPress={handleCheckout} color="#28a745" />
            <View style={{marginTop: 10}}>
              <NativeButton title="Sepeti Temizle" onPress={handleClearCart} color="#dc3545" />
            </View>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />
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
  emptyCartText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 20,
    color: '#333',
  },
  listContainer: {
    paddingHorizontal: 10,
  },
  cartItemCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemInfo: {
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 14,
    color: '#555',
    marginVertical: 3,
  },
  itemTotal: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 5,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    marginTop:10,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 5,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  removeButton: {
    backgroundColor: '#ffdddd',
  },
  removeButtonText: {
    color: '#dc3545',
    fontSize: 13,
  },
  footerContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'white',
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 15,
  },
});

export default CartScreen;
