import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuthAdmin } from './contexts/AuthContext';

// Sayfaları import et (henüz oluşturulmadılar, sadece yer tutucu)
// import AdminLoginScreen from './pages/AdminLoginScreen';
// import DashboardLayout from './components/layout/DashboardLayout'; // Ana dashboard layout'u
// import OrderManagementScreen from './pages/OrderManagementScreen';
// import ProductManagementScreen from './pages/ProductManagementScreen';
// import SettingsScreen from './pages/SettingsScreen';

// Geçici yer tutucu bileşenler
const PlaceholderComponent = ({ title }) => (
  <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
    <h2>{title}</h2>
    <p>Bu bölüm veya sayfa henüz geliştirilmedi.</p>
  </div>
);

const AdminLoginScreen = () => {
  const { login, loading, authError } = useAuthAdmin();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Başarılı giriş sonrası yönlendirme AppNavigator'da (veya ProtectedRoute'da) ele alınacak
    } catch (error) {
      console.error("Login failed:", error);
      // Hata mesajı kullanıcıya gösterilebilir
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <h2>Yönetim Paneli Girişi</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '300px' }}>
        <input
          type="email"
          placeholder="E-posta (admin@example.com)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Şifre (password)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
        </button>
        {authError && <p style={{ color: 'red' }}>{authError}</p>}
      </form>
    </div>
  );
};

const DashboardLayout = () => {
  const { logout, user } = useAuthAdmin();
  return (
    <div>
      <header style={{ padding: '10px', backgroundColor: '#f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
        <h1>Yönetim Paneli</h1>
        {user && (
          <div>
            <span>Merhaba, {user.email}</span>
            <button onClick={logout} style={{ marginLeft: '10px' }}>Çıkış Yap</button>
          </div>
        )}
      </header>
      <nav style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
        {/* Navigasyon linkleri buraya eklenecek (NavLink ile) */}
        {/* Örnek: <NavLink to="/orders">Sipariş Yönetimi</NavLink> */}
        <PlaceholderComponent title="Navigasyon Alanı" />
      </nav>
      <main style={{ padding: '20px' }}>
        <Outlet /> {/* İç içe route'lar burada render edilecek */}
      </main>
      <footer style={{ padding: '10px', backgroundColor: '#f0f0f0', textAlign: 'center', marginTop: '20px' }}>
        <p>&copy; 2024 Ugur Sipariş Yönetim Sistemi</p>
      </footer>
    </div>
  );
};

const OrderManagementScreen = () => <PlaceholderComponent title="Sipariş Yönetimi" />;
const ProductManagementScreen = () => <PlaceholderComponent title="Ürün Yönetimi" />;
const SettingsScreen = () => <PlaceholderComponent title="Ayarlar" />;
const DashboardHomeScreen = () => <PlaceholderComponent title="Dashboard Ana Sayfa" />;


// Korumalı Rota Bileşeni
const ProtectedRoute = ({ children }) => {
  const { session, loading, isAdminOrOwner } = useAuthAdmin();

  if (loading) {
    return <div>Yükleniyor...</div>; // Veya bir spinner bileşeni
  }

  if (!session || !session.user) {
    return <Navigate to="/login" replace />;
  }

  // if (!isAdminOrOwner) { // Gerçek rol kontrolü aktif edildiğinde
  //   // İsteğe bağlı: Rolü uygun değilse log atıp login'e yönlendir veya özel bir "Yetkisiz Erişim" sayfası göster
  //   console.warn("Yetkisiz kullanıcı dashboard'a erişmeye çalıştı:", session.user.email);
  //   // Belki burada supabase.auth.signOut() da çağrılabilir.
  //   return <Navigate to="/login" replace />;
  // }

  return children ? children : <Outlet />; // children veya Outlet render et
};


function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLoginScreen />} />
      <Route
        path="/*" // Diğer tüm yolları yakala
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* DashboardLayout içindeki <Outlet /> tarafından render edilecek alt yollar */}
        <Route index element={<DashboardHomeScreen />} /> {/* Ana dashboard yolu */}
        <Route path="orders" element={<OrderManagementScreen />} />
        <Route path="products" element={<ProductManagementScreen />} />
        <Route path="settings" element={<SettingsScreen />} />
        {/* Diğer dashboard sayfaları buraya eklenebilir */}
        <Route path="*" element={<Navigate to="/" replace />} /> {/* Eşleşmeyen dashboard yolları için ana sayfaya yönlendir */}
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
