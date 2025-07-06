# Ugur - Sipariş Yönetim ve Teslimat Sistemi

Bu proje, müşteri, kurye ve işletme arasında sorunsuz bir iletişim ve iş akışı sağlayacak bir sipariş yönetim ve teslimat sistemi geliştirmeyi amaçlamaktadır. Proje, Supabase'i ana backend platformu olarak kullanmaktadır.

## Proje Bileşenleri

-   **Backend (Supabase):** Veritabanı (PostgreSQL), Kimlik Doğrulama (Auth), Anlık Veri (Realtime), Depolama (Storage) ve Sunucusuz Fonksiyonlar (Edge Functions) Supabase üzerinden yönetilir.
    -   `ugur/backend/`: Supabase client ile etkileşim kurabilecek yardımcı Node.js script'leri veya Supabase Edge Functions için bir geliştirme alanı (isteğe bağlı).
    -   `ugur/docs/database_schema.sql`: Supabase veritabanı için temel şema (manuel olarak Supabase projesine uygulanır).
-   **Mobile App (Müşteri):** `ugur/mobile-app/ugur-mobile-customer/` (React Native - Expo)
-   **Mobile App (Kurye):** `ugur/mobile-app/ugur-mobile-courier/` (React Native - Expo)
-   **Admin Panel (Web):** `ugur/admin-panel/ugur-admin-panel/` (React - Vite)
-   **Docs:** `ugur/docs/` Proje genel dokümantasyonunu içerir.

## Kurulum ve Geliştirme

Her bir client bileşeninin (`ugur-mobile-customer`, `ugur-mobile-courier`, `ugur-admin-panel`) kendi `README.md` dosyasında detaylı kurulum ve geliştirme talimatları bulunacaktır.

**Genel Supabase Kurulumu (Manuel Adımlar):**
1.  Supabase.com üzerinde bir proje oluşturun.
2.  `ugur/docs/database_schema.sql` dosyasındaki tabloları (Пользователи hariç) ve fonksiyonları Supabase SQL editörü üzerinden projenize aktarın. `*_user_id` foreign key'lerini `auth.users(id)`'ye referans verecek şekilde (UUID) güncellemeyi unutmayın.
3.  Gerekli Row Level Security (RLS) politikalarını Supabase tablolarınız için tanımlayın.
4.  Supabase projenizin API URL'ini ve `anon key`'ini alın. Bu anahtarları ilgili client uygulamalarının `.env` dosyalarına (`SUPABASE_URL`/`VITE_SUPABASE_URL` ve `SUPABASE_ANON_KEY`/`VITE_SUPABASE_ANON_KEY`) ekleyin.
5.  Eğer online ödeme (Stripe vb.) kullanılacaksa, ödeme ağ geçidi hesabınızı oluşturun ve API anahtarlarınızı alın. Publishable key'i client `.env` dosyalarına, Secret Key'i ise Supabase Edge Function ortam değişkenlerine ekleyin.

## Dağıtım Notları
(Bir önceki adımdaki içerik burada yer alacak)
### Supabase Backend
-   Supabase projeniz zaten bulutta çalışmaktadır.
-   **Ortam Yönetimi:** Geliştirme, staging ve production için ayrı Supabase projeleri kullanmanız önerilir.
-   **Veritabanı Değişiklikleri:** Şema değişiklikleri (migration'lar) dikkatli bir şekilde yönetilmeli ve canlı ortama kontrollü aktarılmalıdır (Supabase CLI veya manuel script'lerle).
-   **Edge Functions:** `supabase/functions/` altındaki fonksiyonlar Supabase CLI ile (`supabase functions deploy <function_name>`) dağıtılır. Ortam değişkenleri Supabase proje ayarlarından yönetilir.

### Mobil Uygulamalar (Müşteri & Kurye - Expo)
-   **Expo Application Services (EAS):** App Store ve Google Play Store için build ve submit işlemleri EAS CLI kullanılarak yapılır.
-   **Yapılandırma:** Her mobil uygulama projesindeki `eas.json` dosyası, build profillerini (development, preview, production) ve ortam değişkenlerini tanımlar. `EXPO_PUBLIC_` önekli ortam değişkenleri build sırasında EAS Secrets veya `eas.json` içindeki `env` alanından alınır.
-   **Build:** `eas build -p android --profile <profile_name>` veya `eas build -p ios --profile <profile_name>`
-   **Submit:** `eas submit -p android` veya `eas submit -p ios`
-   **OTA Güncellemeleri:** `eas update` ile JavaScript tabanlı güncellemeler mağazaya yeni sürüm göndermeden yapılabilir.

### Web Admin Paneli (React - Vite)
-   **Build:** `npm run build` (veya `vite build`) komutu ile `dist` klasöründe statik dosyalar oluşturulur.
-   **Hosting:** Vercel, Netlify, AWS Amplify, Google Firebase Hosting gibi platformlarda barındırılabilir.
    -   Git deponuz bu platformlara bağlanarak otomatik CI/CD sağlanabilir.
    -   Ortam değişkenleri (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) hosting platformunun arayüzünden ayarlanır.

Detaylı dağıtım talimatları için her bir alt projenin kendi `README.md` dosyasına bakınız.

## Bakım ve İzleme

Uygulamaların canlı ortamda sağlıklı ve performanslı çalışmasını sağlamak için düzenli bakım ve izleme önemlidir.

### Supabase Backend
-   **Supabase Dashboard:** Kullanım istatistikleri, API çağrıları, veritabanı metrikleri, Auth logları ve Edge Function logları düzenli olarak izlenmelidir.
-   **Veritabanı:** Otomatik yedeklemeler kontrol edilmeli, yavaş sorgular ve indeks performansı gözden geçirilmelidir.
-   **Güvenlik:** RLS politikaları, API anahtarları ve genel proje güvenlik ayarları periyodik olarak incelenmelidir.
-   **Kotalar:** Supabase projenizin kullanım kotaları takip edilmelidir.

### Client Uygulamaları (Mobil & Web)
-   **Hata İzleme (Error Tracking):**
    -   **Sentry ([https://sentry.io/](https://sentry.io/))** veya benzeri bir araçla client tarafı hataları (JavaScript hataları, çökmeler) ve performans sorunları izlenmelidir.
    -   Source map'lerin Sentry'ye yüklenmesi, hataların okunabilir koda eşlenmesi için önemlidir.
-   **Performans İzleme:** Sentry APM, Flipper (React Native geliştirme), tarayıcı geliştirici araçları (Web) gibi araçlarla uygulama performansı takip edilmelidir.
-   **Analitik:** Kullanıcı davranışlarını anlamak için PostHog, Mixpanel, Google Analytics (web) gibi analitik araçları entegre edilebilir.
-   **Bağımlılık Yönetimi:** Kullanılan kütüphanelerin güncel ve güvenli sürümleri takip edilmeli, düzenli olarak güncellemeler yapılmalı ve test edilmelidir.
-   **Kullanıcı Geri Bildirimleri:** Mağaza yorumları, destek talepleri ve diğer kanallardan gelen kullanıcı geri bildirimleri dikkate alınmalıdır.

Detaylı bakım ve izleme talimatları için her bir alt projenin kendi `README.md` dosyasına ve ilgili servislerin (Supabase, Sentry vb.) dokümantasyonlarına bakınız.
