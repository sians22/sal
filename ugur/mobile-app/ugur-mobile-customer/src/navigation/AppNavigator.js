import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext'; // AuthContext'ten oturum durumunu alacağız

// Ekranları import et (henüz oluşturulmadılar, sadece yer tutucu)
// Auth Ekranları
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';

// Ana Uygulama Ekranları
import BusinessListScreen from '../screens/Main/BusinessListScreen';
import BusinessDetailScreen from '../screens/Main/BusinessDetailScreen';
import CartScreen from '../screens/Main/CartScreen';
import CheckoutScreen from '../screens/Main/CheckoutScreen';
import OrderHistoryScreen from '../screens/Main/OrderHistoryScreen';
import ProfileScreen from '../screens/Main/ProfileScreen';

// Geçici yer tutucu ekranlar (dosyaları daha sonra oluşturulacak)
const PlaceholderScreen = ({ route }) => {
  const { View, Text, StyleSheet } = require('react-native');
  return (
    <View style={styles.container}>
      <Text>Ekran: {route.name}</Text>
      <Text>Bu ekran henüz geliştirilmedi.</Text>
    </View>
  );
};
const styles = require('react-native').StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});


const AuthStack = createStackNavigator();
const MainStack = createStackNavigator(); // Sipariş akışı ve diğer ana ekranlar için

const AuthScreens = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

// Ana uygulama ekranları için bir stack (daha sonra tab navigator da eklenebilir)
const MainScreens = () => (
  <MainStack.Navigator initialRouteName="BusinessList">
    <MainStack.Screen
      name="BusinessList"
      component={BusinessListScreen}
      options={{ title: 'İşletmeler' }} // Rusça: Предприятия
    />
    <MainStack.Screen
      name="BusinessDetail"
      component={BusinessDetailScreen}
      options={{ title: 'İşletme Detayı' }} // Rusça: Детали Предприятия
    />
    <MainStack.Screen
      name="Cart"
      component={CartScreen}
      options={{ title: 'Sepetim' }} // Rusça: Моя Корзина
    />
    <MainStack.Screen
      name="Checkout"
      component={CheckoutScreen}
      options={{ title: 'Siparişi Tamamla' }} // Rusça: Оформление Заказа
    />
    <MainStack.Screen
      name="OrderHistory"
      component={OrderHistoryScreen}
      options={{ title: 'Sipariş Geçmişim' }} // Rusça: История Заказов
    />
    <MainStack.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ title: 'Profilim' }} // Rusça: Мой Профиль
    />
    {/* Diğer ana uygulama ekranları buraya eklenebilir */}
  </MainStack.Navigator>
);


export default function AppNavigator() {
  const { session, loading } = useAuth(); // AuthContext'ten session ve yükleme durumunu al

  if (loading) {
    // Yükleme ekranı gösterilebilir (isteğe bağlı)
    // Şimdilik null dönüyoruz veya basit bir View
    const { View, Text, ActivityIndicator } = require('react-native');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {session && session.user ? <MainScreens /> : <AuthScreens />}
    </NavigationContainer>
  );
}

// Yer tutucu ekranları Auth ve Main stack'lerine atayalım (gerçekleri oluşturulana kadar)
// Eğer ekran dosyaları hemen oluşturulmayacaksa bu satırlar aktif edilebilir.
// Şu an için yukarıda import edilen gerçek ekran isimlerini kullanıyoruz.
// LoginScreen = LoginScreen || (props => <PlaceholderScreen {...props} />);
// RegisterScreen = RegisterScreen || (props => <PlaceholderScreen {...props} />);
// BusinessListScreen = BusinessListScreen || (props => <PlaceholderScreen {...props} />);
// BusinessDetailScreen = BusinessDetailScreen || (props => <PlaceholderScreen {...props} />);
// CartScreen = CartScreen || (props => <PlaceholderScreen {...props} />);
// CheckoutScreen = CheckoutScreen || (props => <PlaceholderScreen {...props} />);
// OrderHistoryScreen = OrderHistoryScreen || (props => <PlaceholderScreen {...props} />);
// ProfileScreen = ProfileScreen || (props => <PlaceholderScreen {...props} />);

// Gerçek ekran dosyalarını oluşturana kadar bu atamaları yapalım:
LoginScreen = LoginScreen.default || (props => <PlaceholderScreen {...props} route={{name: "LoginScreen"}} />);
RegisterScreen = RegisterScreen.default || (props => <PlaceholderScreen {...props} route={{name: "RegisterScreen"}} />);
BusinessListScreen = BusinessListScreen.default || (props => <PlaceholderScreen {...props} route={{name: "BusinessListScreen"}} />);
BusinessDetailScreen = BusinessDetailScreen.default || (props => <PlaceholderScreen {...props} route={{name: "BusinessDetailScreen"}} />);
CartScreen = CartScreen.default || (props => <PlaceholderScreen {...props} route={{name: "CartScreen"}} />);
CheckoutScreen = CheckoutScreen.default || (props => <PlaceholderScreen {...props} route={{name: "CheckoutScreen"}} />);
OrderHistoryScreen = OrderHistoryScreen.default || (props => <PlaceholderScreen {...props} route={{name: "OrderHistoryScreen"}} />);
ProfileScreen = ProfileScreen.default || (props => <PlaceholderScreen {...props} route={{name: "ProfileScreen"}} />);
