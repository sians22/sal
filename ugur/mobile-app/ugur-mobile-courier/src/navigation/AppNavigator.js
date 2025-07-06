import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthCourier } from '../contexts/AuthContext'; // Kurye AuthContext'inden oturum durumunu alacağız

// Ekranları import et (henüz oluşturulmadılar, sadece yer tutucu)
// Auth Ekranları
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';

// Ana Uygulama Ekranları (Kurye için)
import OrderListScreen from '../screens/Main/OrderListScreen'; // Sipariş Listesi (Yeni, Aktif)
import OrderDetailScreen from '../screens/Main/OrderDetailScreen'; // Sipariş Detayı
import ProfileScreen from '../screens/Main/ProfileScreen'; // Kurye Profili ve Ayarları
// import MapScreen from '../screens/Main/MapScreen'; // Belki ayrı bir harita ekranı

// Geçici yer tutucu ekranlar (dosyaları daha sonra oluşturulacak)
const PlaceholderScreen = ({ route }) => {
  const { View, Text, StyleSheet } = require('react-native');
  return (
    <View style={styles.container}>
      <Text>Kurye Ekranı: {route.name}</Text>
      <Text>Bu ekran henüz geliştirilmedi.</Text>
    </View>
  );
};
const styles = require('react-native').StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});


const AuthStack = createStackNavigator();
const MainStack = createStackNavigator();

const AuthScreens = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="CourierLogin" component={LoginScreen} />
    <AuthStack.Screen name="CourierRegister" component={RegisterScreen} />
  </AuthStack.Navigator>
);

// Kurye ana uygulama ekranları için bir stack
const MainScreens = () => (
  <MainStack.Navigator initialRouteName="OrderList">
    <MainStack.Screen
      name="OrderList"
      component={OrderListScreen}
      options={{ title: 'Siparişler' }} // Rusça: Заказы
    />
    <MainStack.Screen
      name="OrderDetail"
      component={OrderDetailScreen}
      options={{ title: 'Sipariş Detayı' }} // Rusça: Детали Заказа
    />
    <MainStack.Screen
      name="CourierProfile"
      component={ProfileScreen}
      options={{ title: 'Profilim' }} // Rusça: Мой Профиль
    />
    {/*
    <MainStack.Screen
      name="DeliveryMap"
      component={MapScreen}
      options={{ title: 'Teslimat Haritası' }} // Rusça: Карта Доставки
    />
    */}
  </MainStack.Navigator>
);


export default function AppNavigator() {
  const { session, loading, isCourier } = useAuthCourier(); // Kurye AuthContext'i

  if (loading) {
    const { View, Text, ActivityIndicator } = require('react-native');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Yükleniyor... (Kurye)</Text>
      </View>
    );
  }

  // Sadece session varsa VE kullanıcı gerçekten bir kurye ise MainScreens'e yönlendir.
  // isCourier kontrolü AuthContext içinde yapılmalı.
  return (
    <NavigationContainer>
      {session && session.user && isCourier ? <MainScreens /> : <AuthScreens />}
    </NavigationContainer>
  );
}

// Gerçek ekran dosyalarını oluşturana kadar bu atamaları yapalım:
LoginScreen = LoginScreen.default || (props => <PlaceholderScreen {...props} route={{name: "CourierLoginScreen"}} />);
RegisterScreen = RegisterScreen.default || (props => <PlaceholderScreen {...props} route={{name: "CourierRegisterScreen"}} />);
OrderListScreen = OrderListScreen.default || (props => <PlaceholderScreen {...props} route={{name: "OrderListScreen"}} />);
OrderDetailScreen = OrderDetailScreen.default || (props => <PlaceholderScreen {...props} route={{name: "OrderDetailScreen"}} />);
ProfileScreen = ProfileScreen.default || (props => <PlaceholderScreen {...props} route={{name: "CourierProfileScreen"}} />);
// MapScreen = MapScreen.default || (props => <PlaceholderScreen {...props} route={{name: "MapScreen"}} />);
