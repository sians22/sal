import 'react-native-url-polyfill/auto'; // Supabase için gerekli
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

// Supabase URL ve Anon Key'in .env dosyasından geldiğini kontrol edelim
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  const errorMessage = 'Supabase URL veya Anon Key eksik. Lütfen .env dosyanızı kontrol edin.';
  console.error(errorMessage);
  // Geliştirme aşamasında bir uyarı gösterebilir veya uygulamayı durdurabilirsiniz.
  // import { Alert } from 'react-native';
  // Alert.alert('Yapılandırma Hatası', errorMessage);
  // throw new Error(errorMessage); // Bu, uygulamanın çökmesine neden olur.
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Mobil uygulamalar için genellikle false
  },
});

// Supabase client'ının düzgün başlatıldığını kontrol etmek için bir log (isteğe bağlı)
// console.log('Supabase client initialized for Courier App with URL:', SUPABASE_URL ? 'Loaded' : 'NOT LOADED');

// Eğer SUPABASE_URL veya SUPABASE_ANON_KEY tanımsızsa, supabase nesnesi yine de oluşturulur
// ancak istek yapmaya çalıştığında hata verir. Bu yüzden yukarıdaki kontrol önemlidir.
/*
export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

if (!supabase) {
  console.error('Kurye Uygulaması: Supabase client başlatılamadı. Lütfen .env dosyasındaki SUPABASE_URL ve SUPABASE_ANON_KEY değerlerini kontrol edin.');
}
*/
