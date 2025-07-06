# Ugur - İşletme/Yönetim Paneli (React + Vite)

Bu, Ugur Sipariş Yönetim ve Teslimat Sistemi'nin işletme ve yönetici tarafı web uygulamasıdır. React ve Vite kullanılarak geliştirilmiştir.

## Özellikler (Planlanan)
- Sipariş yönetimi (yeni siparişleri görüntüleme, onaylama, durum güncelleme)
- Ürün yönetimi (ürün ekleme, düzenleme, silme - gelecekte)
- Kurye yönetimi (kurye onayları, atamalar - gelecekte)
- Kullanıcı yönetimi (müşteri ve kurye hesapları - gelecekte)
- Ayarlar ve raporlama (gelecekte)

## Başlangıç

1.  **Bağımlılıkları Yükle:**
    Proje kök dizininde (`ugur/admin-panel/ugur-admin-panel/`) aşağıdaki komutu çalıştırın:
    ```bash
    npm install
    # veya
    yarn install
    ```

2.  **Ortam Değişkenleri:**
    Proje kök dizininde (`ugur/admin-panel/ugur-admin-panel/`) `.env` adında bir dosya oluşturun ve aşağıdaki değişkenleri kendi Supabase anahtarlarınızla doldurun:
    ```env
    VITE_SUPABASE_URL=YOUR_SUPABASE_URL_HERE
    VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY_HERE
    # VITE_SENTRY_DSN=YOUR_SENTRY_DSN_FOR_ADMIN_PANEL (Sentry için)
    ```
    Vite, `VITE_` önekli değişkenleri otomatik olarak `import.meta.env` üzerinden uygulamanıza dahil eder. Referans için `.env.example` dosyasına bakabilirsiniz.

3.  **Uygulamayı Çalıştırma (Geliştirme Modu):**
    ```bash
    npm run dev
    # veya
    yarn dev
    ```
    Bu, Vite geliştirme sunucusunu başlatacaktır. Genellikle `http://localhost:5173` (veya benzeri bir portta) açılır.

## Testler
Test altyapısı (Jest/Vitest, React Testing Library) kurulduktan sonra testleri çalıştırmak için:
```bash
npm test
```
(Not: Bu proje için test kurulumu henüz detaylı yapılmadı. `jest` veya `vitest` ile `@testing-library/react` kullanılabilir.)

## Dağıtım (Deployment)
(Bir önceki adımdaki içerik burada yer alacak)
Bu Vite projesi, statik bir site olarak derlenir ve Vercel, Netlify, AWS Amplify, Google Firebase Hosting gibi çeşitli platformlarda barındırılabilir.
1.  **Projeyi Derleme (Build):** `npm run build`
2.  **Hosting Platformuna Dağıtma:** Git deponuzu platforma bağlayın, build komutunu (`npm run build`) ve yayınlama dizinini (`dist`) ayarlayın. Ortam değişkenlerini (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SENTRY_DSN`) platform üzerinden yapılandırın.

Daha fazla bilgi için seçtiğiniz hosting platformunun dokümantasyonuna başvurun.

## Bakım ve İzleme

### Hata İzleme (Error Tracking)
Uygulamada oluşabilecek hataları izlemek için **Sentry** gibi bir araç kullanılması şiddetle tavsiye edilir.

**Sentry Entegrasyonu (Temel Adımlar - React/Vite için):**
1.  **Sentry Hesabı ve Projesi:** [Sentry.io](https://sentry.io/) adresinden bir hesap oluşturun ve projeniz için yeni bir "React" projesi oluşturun. Size bir DSN anahtarı verilecektir.
2.  **SDK Kurulumu:**
    ```bash
    npm install @sentry/react @sentry/vite-plugin
    # veya
    yarn add @sentry/react @sentry/vite-plugin
    ```
3.  **Yapılandırma (`main.jsx` veya `index.jsx`):**
    Uygulamanızın ana giriş noktası olan `main.jsx` dosyasına Sentry'yi başlatma kodunu ekleyin:
    ```javascript
    // main.jsx
    import React from 'react';
    import ReactDOM from 'react-dom/client';
    import * as Sentry from "@sentry/react";
    import App from './App.jsx';
    import './index.css';
    // ... diğer importlar (QueryClientProvider, BrowserRouter vb.)

    if (import.meta.env.PROD) { // Sadece production build'lerinde Sentry'yi başlat
      Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN, // .env dosyasından VITE_SENTRY_DSN olarak çekilecek
        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration(),
        ],
        tracesSampleRate: 1.0, // Performans izleme için örnekleme oranı
        replaysSessionSampleRate: 0.1, // Session Replay için örnekleme oranı
        replaysOnErrorSampleRate: 1.0, // Hata durumunda Session Replay için
      });
    }

    // ReactDOM.createRoot(...).render(...);
    ```
    `VITE_SENTRY_DSN` değişkenini `.env` dosyanızda tanımlayın.
4.  **Vite Plugin ile Source Maps Yükleme (`vite.config.js`):**
    Hataların okunabilir olması için source map'lerin Sentry'ye yüklenmesi gerekir. `@sentry/vite-plugin` bunu otomatikleştirir.
    ```javascript
    // vite.config.js
    import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';
    import { sentryVitePlugin } from "@sentry/vite-plugin";

    export default defineConfig({
      plugins: [
        react(),
        // Sentry plugin'ini en sona ekleyin
        sentryVitePlugin({
          org: "your-sentry-organization-slug",
          project: "your-sentry-project-slug",
          // Auth token Sentry CLI tarafından ortam değişkeni (SENTRY_AUTH_TOKEN)
          // veya .sentryclirc dosyası üzerinden okunur.
          // CI ortamında SENTRY_AUTH_TOKEN'ı ayarlamanız gerekir.
          authToken: process.env.SENTRY_AUTH_TOKEN, // Güvenlik için ortam değişkeninden alınmalı
          sourcemaps: {
            assets: "./dist/**" // Derlenmiş dosyaların yolu
          }
        })
      ],
      build: {
        sourcemap: true, // Source map oluşturmayı etkinleştir
      }
    });
    ```
    `SENTRY_AUTH_TOKEN`'ı güvenli bir şekilde (örn: CI ortam değişkenleri) sağlamanız gerekir.

### Performans İzleme
Sentry APM veya tarayıcı geliştirici araçları (Lighthouse, Performance tab) ile uygulama performansı izlenebilir.

### Analitik
Kullanıcı davranışlarını anlamak için PostHog, Mixpanel veya Google Analytics gibi araçlar entegre edilebilir.

### Bağımlılık Güncellemeleri
`npm outdated` veya `yarn outdated` komutlarıyla bağımlılıkları düzenli olarak kontrol edin ve güvenlik güncellemelerini yapın.

---
Bu README, React + Vite şablonundan uyarlanmıştır.
Orijinal Vite template README'si için [buraya](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react) bakabilirsiniz.
