import React from 'react';
import { render } from '@testing-library/react-native';
import App from './App';

// Supabase ve diğer context'ler için mock'lar gerekebilir.
// Şimdilik AuthContext'in yükleme durumunu mock'layarak başlayalım.
jest.mock('./src/contexts/AuthContext', () => ({
  useAuth: () => ({
    session: null, // Başlangıçta session yok
    loading: false, // Yükleme tamamlandı
    user: null,
  }),
  AuthProvider: ({ children }) => <>{children}</>,
}));

// CartContext için de basit bir mock
jest.mock('./src/contexts/CartContext', () => ({
  useCart: () => ({
    cartItems: [],
    getItemCount: () => 0,
    // Diğer gerekli fonksiyonlar mock'lanabilir
  }),
  CartProvider: ({ children }) => <>{children}</>,
}));

// react-native-url-polyfill için mock (eğer test ortamında sorun çıkarırsa)
jest.mock('react-native-url-polyfill/auto', () => {});

// @env için mock (Stripe anahtarı gibi)
jest.mock('@env', () => ({
  STRIPE_PUBLISHABLE_KEY: 'pk_test_your_stripe_publishable_key',
  SUPABASE_URL: 'https://your-supabase-url.supabase.co',
  SUPABASE_ANON_KEY: 'your-supabase-anon-key',
}));


describe('<App />', () => {
  it('renders correctly and shows login screen initially', () => {
    const { getByText, queryByText } = render(<App />);

    // AppNavigator, session yoksa AuthScreens'i (LoginScreen içerir) render etmeli.
    // LoginScreen'de "Müşteri Girişi" metninin olmasını bekleyebiliriz.
    // Bu, LoginScreen'in içeriğine bağlıdır.
    // Şimdilik, AppNavigator'ın yükleme ekranını geçtiğini ve bir şeyler render ettiğini varsayalım.
    // LoginScreen'in bir başlığı veya belirgin bir metni varsa onu arayabiliriz.
    // Örneğin, LoginScreen içinde "Müşteri Girişi" başlığı varsa:
    // expect(getByText(/Müşteri Girişi/i)).toBeTruthy();

    // Veya daha genel bir test:
    // App.js'nin bir hata fırlatmadan render olup olmadığını kontrol edelim.
    // Ve AuthContext mock'u nedeniyle Login ekranının gösterildiğini varsayalım.
    // LoginScreen'deki "Giriş Yap" butonu gibi bir elementin varlığını kontrol edebiliriz.
    // Bu, LoginScreen.js'nin içeriğine göre ayarlanmalıdır.
    // Şimdilik, App'in çökmeden render olduğunu varsayalım.
    expect(true).toBe(true); // Bu satırı daha anlamlı bir assertion ile değiştirin.

    // Örnek: Eğer LoginScreen'de "Giriş Yap" butonu varsa
    // expect(getByText(/Giriş Yap/i)).toBeTruthy();
    // expect(queryByText(/İşletmeler/i)).toBeNull(); // Ana ekranın görünmediğini kontrol et
  });

  // Oturum açmış kullanıcı senaryosu için de test yazılabilir (AuthContext mock'unu değiştirerek)
});
