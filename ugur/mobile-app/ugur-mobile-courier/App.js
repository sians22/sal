import 'react-native-gesture-handler'; // En üste import edilmeli (React Navigation için)
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext'; // Kurye AuthContext'i
import AppNavigator from './src/navigation/AppNavigator'; // Bu dosyayı birazdan oluşturacağız

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
