import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = 'Supabase URL veya Anon Key eksik. Lütfen .env dosyanızı VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY değişkenleriyle yapılandırın.';
  console.error(errorMessage);
  // Geliştirme aşamasında bir uyarı gösterebilir veya uygulamayı durdurabilirsiniz.
  // alert(errorMessage);
  // throw new Error(errorMessage); // Bu, uygulamanın çökmesine neden olur.
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Supabase client'ının düzgün başlatıldığını kontrol etmek için bir log (isteğe bağlı)
// console.log('Supabase client initialized for Admin Panel with URL:', supabaseUrl ? 'Loaded' : 'NOT LOADED');

// Eğer VITE_SUPABASE_URL veya VITE_SUPABASE_ANON_KEY tanımsızsa, supabase nesnesi yine de oluşturulur
// ancak istek yapmaya çalıştığında hata verir. Bu yüzden yukarıdaki kontrol önemlidir.
/*
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!supabase) {
  console.error('Admin Paneli: Supabase client başlatılamadı. Lütfen .env dosyasındaki VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY değerlerini kontrol edin.');
}
*/
