import 'react-native-gesture-handler'; // En üste import edilmeli (React Navigation için)
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import { CartProvider } from './src/contexts/CartContext';
import AppNavigator from './src/navigation/AppNavigator';
import { StripeProvider } from '@stripe/stripe-react-native';
import { STRIPE_PUBLISHABLE_KEY } from '@env'; // .env dosyasından gelecek

// Supabase client'ın erken başlatılması için (eğer gerekirse)
// import './src/lib/supabaseClient';

export default function App() {
  // STRIPE_PUBLISHABLE_KEY'in yüklenip yüklenmediğini kontrol etmek iyi bir pratik olabilir.
  if (!STRIPE_PUBLISHABLE_KEY) {
    // Geliştirme ortamında bir uyarı gösterilebilir.
    // Üretimde bu anahtarın kesinlikle olması gerekir.
    console.warn("Stripe Publishable Key bulunamadı. Lütfen .env dosyanızı kontrol edin.");
  }

  return (
    <StripeProvider
      publishableKey={STRIPE_PUBLISHABLE_KEY || "dummy_pk_for_dev_if_not_set"} // Anahtar yoksa geçici bir değer veya hata yönetimi
      merchantIdentifier="merchant.com.ugur.app" // Apple Pay için (isteğe bağlı, gerekmiyorsa kaldırılabilir)
      // urlScheme="your-url-scheme" // Derin bağlantılar için (isteğe bağlı)
    >
      <AuthProvider>
        <CartProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </CartProvider>
      </AuthProvider>
    </StripeProvider>
  );
}
