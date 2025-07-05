# 🚚 Kurye Yönetim Sistemi (Courier Management System)

Modern, kapsamlı ve kullanıcı dostu bir kurye yönetim sistemi. Müşteri uygulaması, kurye uygulaması ve admin paneli ile tam entegre çözüm.

## 🌟 Özellikler

### 👥 Müşteri Uygulaması
- **Kullanıcı Girişi**: Admin paneli üzerinden yönetilen güvenli kimlik doğrulama
- **Sipariş Oluşturma**: Yandex Maps entegrasyonu ile konum seçimi
- **Fiyat Hesaplama**: Mesafe bazlı otomatik fiyatlandırma
- **Promosyon Kodları**: İndirim kodları ile fiyat avantajı
- **Gerçek Zamanlı Takip**: Sipariş durumu anlık güncellemeler
- **Sipariş Geçmişi**: Tüm siparişlerin detaylı görüntülenmesi
- **Kurye Değerlendirme**: 5 yıldızlı rating sistemi

### 🚛 Kurye Uygulaması
- **Kurye Girişi**: Güvenli kimlik doğrulama sistemi
- **Yeni Sipariş Bildirimleri**: Anlık push notification
- **Sipariş Kabul Etme**: Tek tıkla sipariş alma
- **Durum Güncelleme**: Sipariş durumunu gerçek zamanlı güncelleme
- **Sipariş Geçmişi**: Tamamlanan siparişlerin görüntülenmesi
- **Performans Takibi**: Ortalama puan ve istatistikler

### ⚙️ Admin Paneli
- **Kullanıcı Yönetimi**: Müşteri ve kurye hesap yönetimi
- **Sipariş Yönetimi**: Tüm siparişlerin merkezi kontrolü
- **Fiyatlandırma**: Mesafe bazlı fiyat kuralları
- **Promosyon Kodları**: İndirim kodları oluşturma ve yönetimi
- **Bildirim Sistemi**: Toplu bildirim gönderimi
- **Site Özelleştirme**: Logo, renk ve tema ayarları
- **İstatistikler**: Detaylı raporlama ve analiz

### 🗺️ Harita Entegrasyonu
- **Yandex Maps API**: Gerçek zamanlı harita servisleri
- **Konum Seçimi**: Alış ve teslimat noktası belirleme
- **Mesafe Hesaplama**: Otomatik rota ve mesafe hesaplama
- **Mevcut Konum**: GPS ile otomatik konum tespiti

## 🛠️ Teknoloji Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Hızlı build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animasyon kütüphanesi
- **React Router** - Sayfa yönlendirme
- **React i18next** - Çoklu dil desteği (Türkçe/Rusça)

### Harita ve Konum
- **Yandex Maps API** - Harita servisleri
- **Geolocation API** - GPS konum tespiti

### UI Bileşenleri
- **Radix UI** - Erişilebilir UI primitives
- **Lucide React** - Modern ikon seti
- **Custom Components** - Özel tasarım bileşenleri

### Veri Yönetimi
- **React Context** - State management
- **LocalStorage** - Veri kalıcılığı
- **Zustand** - Lightweight state management

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+ 
- npm veya yarn
- Yandex Maps API anahtarı

### Adım 1: Projeyi Klonlayın
```bash
git clone <repository-url>
cd kurye-sistemi
```

### Adım 2: Bağımlılıkları Yükleyin
```bash
npm install
```

### Adım 3: Ortam Değişkenlerini Ayarlayın
`.env` dosyası oluşturun:
```env
VITE_YANDEX_MAPS_API_KEY=your-yandex-maps-api-key
VITE_API_BASE_URL=http://localhost:3001/api
```

### Adım 4: Uygulamayı Başlatın
```bash
npm run dev
```

Uygulama `http://localhost:5173` adresinde çalışacaktır.

## 🔑 Yandex Maps API Kurulumu

1. [Yandex Developer Console](https://developer.tech.yandex.ru/) adresine gidin
2. Yeni bir proje oluşturun
3. Maps JavaScript API'yi etkinleştirin
4. API anahtarınızı alın
5. `.env` dosyasına ekleyin

## 👤 Demo Hesaplar

Sistemi test etmek için aşağıdaki demo hesapları kullanabilirsiniz:

### Admin Hesabı
- **Kullanıcı Adı**: `admin`
- **Şifre**: `admin123`

### Müşteri Hesabı
- **Kullanıcı Adı**: `customer`
- **Şifre**: `customer123`

### Kurye Hesabı
- **Kullanıcı Adı**: `courier`
- **Şifre**: `courier123`

## 📱 Mobil Uyumluluk

Sistem tamamen responsive tasarıma sahiptir ve mobil cihazlarda mükemmel çalışır:

- **iOS Safari** - Tam destek
- **Android Chrome** - Tam destek
- **Progressive Web App (PWA)** - Yüklenebilir uygulama
- **Offline Mode** - İnternet bağlantısı olmadan da çalışır

## 🌍 Çoklu Dil Desteği

Sistem Türkçe ve Rusça dillerini destekler:

- **Türkçe** - Varsayılan dil
- **Rusça** - Tam çeviri desteği
- **Dinamik Dil Değiştirme** - Anlık dil değişimi

## 🔧 Konfigürasyon

### Fiyatlandırma Kuralları
```javascript
// src/config/settings.js
DEFAULT_PRICING: [
  { minDistance: 0, maxDistance: 3, price: 10 },
  { minDistance: 3, maxDistance: 10, price: 15 },
  { minDistance: 10, maxDistance: 20, price: 25 },
  { minDistance: 20, maxDistance: 50, price: 40 },
]
```

### Promosyon Kodları
```javascript
DEFAULT_PROMO_CODES: [
  { code: 'WELCOME10', discount: 10, type: 'percentage', maxUses: 100 },
  { code: 'FIRST5', discount: 5, type: 'fixed', maxUses: 50 },
]
```

## 📊 Sipariş Durumları

1. **Bekliyor** - Sipariş oluşturuldu, kurye bekleniyor
2. **Kabul Edildi** - Kurye siparişi kabul etti
3. **Yolda** - Kurye teslimat yolunda
4. **Teslim Edildi** - Sipariş başarıyla teslim edildi

## 🔔 Bildirim Sistemi

- **Push Notifications** - Gerçek zamanlı bildirimler
- **Toast Messages** - Kullanıcı geri bildirimleri
- **Email Notifications** - E-posta bildirimleri (gelecek özellik)

## 🛡️ Güvenlik

- **Güvenli Kimlik Doğrulama** - Şifreli giriş sistemi
- **Rol Tabanlı Erişim** - Kullanıcı yetkilendirme
- **Session Management** - Oturum yönetimi
- **Input Validation** - Veri doğrulama

## 📈 Performans

- **Lazy Loading** - Sayfa yükleme optimizasyonu
- **Code Splitting** - Bundle boyutu optimizasyonu
- **Caching** - Veri önbellekleme
- **Debouncing** - API çağrı optimizasyonu

## 🚀 Production Deployment

### Build
```bash
npm run build
```

### Deploy
```bash
# Netlify
netlify deploy --prod --dir=dist

# Vercel
vercel --prod

# Firebase
firebase deploy
```

## 🔮 Gelecek Özellikler

- [ ] **Backend API** - Node.js/Express backend
- [ ] **Database** - MongoDB/PostgreSQL entegrasyonu
- [ ] **Real-time Chat** - Müşteri-kurye mesajlaşma
- [ ] **Payment Gateway** - Online ödeme sistemi
- [ ] **Analytics Dashboard** - Detaylı analitik
- [ ] **Mobile App** - React Native uygulaması
- [ ] **SMS Notifications** - SMS bildirimleri
- [ ] **Route Optimization** - En uygun rota hesaplama

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

## 📞 İletişim

- **E-posta**: info@kuryesistemi.com
- **Telefon**: +90 xxx xxx xx xx
- **Website**: https://kuryesistemi.com

## 🙏 Teşekkürler

- [Yandex Maps](https://tech.yandex.com/maps/) - Harita servisleri
- [React](https://reactjs.org/) - UI framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Vite](https://vitejs.dev/) - Build tool

---

**Kurye Yönetim Sistemi** - Modern kurye hizmetleri için kapsamlı çözüm 🚚✨ 