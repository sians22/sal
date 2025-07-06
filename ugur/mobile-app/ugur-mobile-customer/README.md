# Ugur - Müşteri Mobil Uygulaması (React Native - Expo)

Bu, Ugur Sipariş Yönetim ve Teslimat Sistemi'nin müşteri tarafı mobil uygulamasıdır.

## Başlangıç

1.  **Bağımlılıkları Yükle:**
    ```bash
    npm install
    # veya
    yarn install
    ```

2.  **Ortam Değişkenleri:**
    Proje kök dizininde `.env` adında bir dosya oluşturun ve aşağıdaki değişkenleri kendi Supabase ve Stripe (eğer kullanılıyorsa) anahtarlarınızla doldurun:
    ```env
    SUPABASE_URL=YOUR_SUPABASE_URL_HERE
    SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY_HERE
    STRIPE_PUBLISHABLE_KEY=YOUR_STRIPE_PUBLISHABLE_KEY_HERE
    ```
    Referans için `.env.example` dosyasına bakabilirsiniz. `STRIPE_PUBLISHABLE_KEY` için `EXPO_PUBLIC_` öneki, EAS Build ile build alırken kullanılacaksa `.env` dosyasında da bu şekilde (`EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`) tanımlanabilir ve `supabaseClient.js` veya `App.js` içinde `@env` ile çağrılırken bu isimle çağrılır. Mevcut `App.js` `@env` den `STRIPE_PUBLISHABLE_KEY` olarak bekliyor, bu tutarlılık sağlanmalı.

3.  **Uygulamayı Çalıştırma (Geliştirme Modu):**
    ```bash
    npm start
    # veya
    yarn start
    ```
    Bu, Expo Geliştirme Sunucusu'nu başlatacaktır. Ardından Expo Go uygulamasını kullanarak (QR kodu okutarak veya hesapla giriş yaparak) Android veya iOS cihazınızda/emülatörünüzde uygulamayı açabilirsiniz.

## Testler
Testleri çalıştırmak için:
```bash
npm test
```
(Not: Test altyapısı kuruldu ancak sandbox ortamındaki kısıtlamalar nedeniyle çalıştırılamadı. Yerel ortamda denenmesi gerekmektedir.)

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
      // Diğer konfigürasyonlar...
    });

    // Uygulamanızın geri kalanı...
    ```
    `YOUR_SENTRY_DSN_HERE` kısmını kendi DSN anahtarınızla değiştirin. Bu anahtarı `.env` dosyasına koyup `@env` ile çekmek daha güvenlidir (`SENTRY_DSN` veya `EXPO_PUBLIC_SENTRY_DSN`).
4.  **Source Maps Yükleme (EAS Build):**
    Hataların okunabilir olması için source map'lerin Sentry'ye yüklenmesi gerekir. EAS Build kullanıyorsanız, bu genellikle build hook'ları veya Sentry'nin EAS Build için sağladığı eklentilerle otomatikleştirilebilir. Detaylar için Sentry ve Expo dokümantasyonuna bakın.
    Örnek `eas.json` içine build hook eklenebilir:
    ```json
    // eas.json içinde "build" -> "production" (veya diğer profiller) altına:
    "hooks": {
      "postPublish": [
        {
          "file": "sentry-expo/upload-sourcemaps",
          "config": {
            "organization": "your-sentry-organization-slug",
            "project": "your-sentry-project-slug",
            "authToken": "$SENTRY_AUTH_TOKEN" // EAS Secret olarak ayarlanmalı
          }
        }
      ]
    }
    ```
    Ayrıca `sentry-expo` paketinin kurulması gerekir: `npm install sentry-expo`.

### Performans İzleme
Sentry APM veya React Native Flipper gibi araçlarla uygulama performansı izlenebilir.

### Analitik
Kullanıcı davranışlarını anlamak için PostHog, Mixpanel veya Amplitude gibi araçlar entegre edilebilir.

### Bağımlılık Güncellemeleri
`npm outdated` veya `yarn outdated` komutlarıyla bağımlılıkları düzenli olarak kontrol edin ve güvenlik güncellemelerini yapın.
