const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Ortam değişkenlerini .env dosyasından yükle
dotenv.config({ path: '../.env' }); // .env dosyasının backend klasörünün bir üstünde olduğunu varsayıyoruz veya projenin kök dizininde

// Supabase Client'ı oluştur
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Hata: SUPABASE_URL ve SUPABASE_ANON_KEY ortam değişkenleri tanımlanmamış.");
  console.log("Lütfen .env dosyanızı kontrol edin veya oluşturun.");
  console.log("Örnek .env içeriği ugur/backend/.env.example dosyasında bulunabilir.");
  // process.exit(1); // Uygulamayı sonlandırabilir veya development modunda devam edebilir.
}

// Supabase client'ı sadece değişkenler varsa oluştur
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

if (supabase) {
  console.log('Supabase client başarıyla başlatıldı.');
  // Buradan itibaren Supabase client'ını (supabase) kullanarak işlemler yapabilirsiniz.
  // Örneğin, bir tablodan veri çekme:
  /*
  async function getUsers() {
    try {
      const { data, error } = await supabase
        .from('Пользователи') // Supabase'deki tablo adınızla eşleşmeli
        .select('*')
        .limit(5);

      if (error) {
        console.error('Supabase\'den veri çekerken hata:', error);
        return;
      }
      console.log('İlk 5 kullanıcı:', data);
    } catch (err) {
      console.error('Beklenmedik hata:', err);
    }
  }
  // getUsers(); // Test için çağırabilirsiniz
  */
} else {
  console.warn('Supabase client başlatılamadı. Lütfen SUPABASE_URL ve SUPABASE_ANON_KEY değerlerini kontrol edin.');
}


// Eski Express sunucu kodu (Supabase ana backend olacağı için kaldırıldı/yorumlandı):
/*
const express = require('express');
const cors =require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Ugur Backend API Çalışıyor! (Supabase Entegrasyonu ile)');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Sunucuda bir hata oluştu!');
});

app.listen(PORT, () => {
  console.log(`Backend sunucusu (opsiyonel) http://localhost:${PORT} adresinde çalışıyor.`);
});
*/

// Bu dosya, Supabase Edge Functions için bir başlangıç noktası olarak da kullanılabilir
// veya Node.js ile çalıştırılacak yardımcı script'ler içerebilir.
// Şimdilik sadece Supabase client'ın nasıl başlatılacağını gösteriyor.

module.exports = { supabase }; // Eğer başka modüllerden erişmek isterseniz
