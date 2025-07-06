# Ugur - Kurye Mobil Uygulaması (React Native - Expo)

Bu, Ugur Sipariş Yönetim ve Teslimat Sistemi'nin kurye tarafı mobil uygulamasıdır.

## Başlangıç

1.  **Bağımlılıkları Yükle:**
    ```bash
    npm install
    # veya
    yarn install
    ```

2.  **Ortam Değişkenleri:**
    Proje kök dizininde `.env` adında bir dosya oluşturun ve aşağıdaki değişkenleri kendi Supabase anahtarlarınızla doldurun:
    ```env
    SUPABASE_URL=YOUR_SUPABASE_URL_HERE
    SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY_HERE
    ```
    Referans için `.env.example` dosyasına bakabilirsiniz. `SUPABASE_URL` ve `SUPABASE_ANON_KEY` için `EXPO_PUBLIC_` öneki, EAS Build ile build alırken kullanılacaksa `.env` dosyasında da bu şekilde (`EXPO_PUBLIC_SUPABASE_URL` vb.) tanımlanabilir ve `supabaseClient.js` içinde `@env` ile çağrılırken bu isimle çağrılır.

3.  **Uygulamayı Çalıştırma (Geliştirme Modu):**
    ```bash
    npm start
    # veya
    yarn start
    ```
    Bu, Expo Geliştirme Sunucusu'nu başlatacaktır. Expo Go uygulaması ile QR kodu okutarak veya hesapla giriş yaparak Android veya iOS cihazınızda/emülatörünüzde uygulamayı açabilirsiniz.

## Testler
Testleri çalıştırmak için (test altyapısı kurulduktan sonra):
```bash
npm test
```
(Not: Bu proje için test altyapısı henüz tam olarak kurulup çalıştırılamamıştır. Müşteri mobil uygulaması için yapılanlara benzer adımlar izlenebilir.)

## Dağıtım (Deployment)

Bu Expo projesi, Expo Application Services (EAS) kullanılarak App Store ve Google Play Store'a dağıtılabilir. Detaylar için ana projenin (`../../README.md`) "Dağıtım Notları" bölümüne ve `eas.json` dosyasına bakınız. Temel adımlar:
1.  EAS CLI Kurulumu ve Giriş (`npm install -g eas-cli`, `eas login`)
2.  `eas.json` Yapılandırması (Ortam değişkenleri için EAS Secrets kullanımı önerilir)
3.  Build Alma (`eas build -p <platform> --profile <profile_name>`)
4.  Mağazaya Gönderme (`eas submit -p <platform>`)
5.  OTA Güncellemeleri (`eas update`)

Daha fazla bilgi için [Expo EAS Dokümantasyonuna](https://docs.expo.dev/eas/) bakınız.

## Bakım ve İzleme

### Hata İzleme (Error Tracking)
Uygulamada oluşabilecek hataları ve çökmeleri izlemek için **Sentry** gibi bir araç kullanılması şiddetle tavsiye edilir.

**Sentry Entegrasyonu (Temel Adımlar):**
1.  **Sentry Hesabı ve Projesi:** [Sentry.io](https://sentry.io/) adresinden bir hesap oluşturun ve projeniz için yeni bir "React Native" projesi oluşturun. Size bir DSN anahtarı verilecektir.
2.  **SDK Kurulumu:**
    ```bash
    npm install @sentry/react-native
    # veya
    npx expo install @sentry/react-native # Expo projeleri için önerilen
    ```
3.  **Yapılandırma:**
    `App.js` (veya uygulamanızın giriş noktası) dosyasının en üstüne Sentry'yi başlatma kodunu ekleyin:
    ```javascript
    import * as Sentry from '@sentry/react-native';

    Sentry.init({
      dsn: 'YOUR_SENTRY_DSN_HERE', // Sentry projenizden aldığınız DSN
      debug: __DEV__, // Geliştirme modunda debug loglarını açar
      enableInExpoDevelopment: true, // Expo Go'da da çalışmasını sağlar
    });

    // Uygulamanızın geri kalanı...
    ```
    `YOUR_SENTRY_DSN_HERE` kısmını kendi DSN anahtarınızla değiştirin. Bu anahtarı `.env` dosyasına koyup `@env` ile çekmek daha güvenlidir (`SENTRY_DSN` veya `EXPO_PUBLIC_SENTRY_DSN`).
4.  **Source Maps Yükleme (EAS Build):**
    Hataların okunabilir olması için source map'lerin Sentry'ye yüklenmesi gerekir. EAS Build kullanıyorsanız, `sentry-expo` paketi ve `eas.json` içindeki build hook'ları ile bu otomatikleştirilebilir. Detaylar için Sentry ve Expo dokümantasyonuna bakın.

### Performans İzleme
Sentry APM veya React Native Flipper gibi araçlarla uygulama performansı izlenebilir.

### Analitik
Kullanıcı davranışlarını anlamak için analitik araçları (PostHog, Mixpanel vb.) entegre edilebilir.

### Bağımlılık Güncellemeleri
`npm outdated` veya `yarn outdated` komutlarıyla bağımlılıkları düzenli olarak kontrol edin ve güvenlik güncellemelerini yapın.
