import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabaseClient'; // Supabase client'ımızı import ediyoruz

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  // Yönetim paneline özel roller (örneğin 'admin', 'business_owner')
  const [isAdminOrOwner, setIsAdminOrOwner] = useState(false);

  useEffect(() => {
    setLoading(true);
    const getSession = async () => {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error.message);
        setAuthError(error.message);
      }
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);
      // Kullanıcı rolünü kontrol et (Supabase'deki user_metadata veya özel bir tablodan)
      // Bu kısım, Supabase'de kullanıcı rollerini nasıl sakladığınıza bağlı olarak değişir.
      // Örnek: user.app_metadata.roles veya user.user_metadata.role
      // Veya ayrı bir 'profiles' tablosundan rol çekilebilir.
      // Şimdilik, giriş yapan herkesin admin/owner olduğunu varsayalım (test için).
      // Gerçekte burada rol kontrolü yapılmalı.
      if (currentUser) {
        // Örnek rol kontrolü (Supabase trigger ile 'role' alanı users tablosuna eklendiyse):
        // const { data: profile, error: profileError } = await supabase
        //   .from('Пользователи') // veya 'profiles'
        //   .select('role')
        //   .eq('user_id', currentUser.id) // auth.users.id'ye eşit user_id'li profil
        //   .single();
        // if (profile && (profile.role === 'admin' || profile.role === 'business_owner')) {
        //   setIsAdminOrOwner(true);
        // } else {
        //   setIsAdminOrOwner(false);
        //   // Eğer rol uygun değilse logout yapılabilir veya hata mesajı gösterilebilir.
        // }
        setIsAdminOrOwner(true); // GEÇİCİ: Herkesi admin/owner say
      } else {
        setIsAdminOrOwner(false);
      }
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth event (Admin Panel):', event, newSession);
        setSession(newSession);
        const currentUser = newSession?.user ?? null;
        setUser(currentUser);
        setAuthError(null);

        if (currentUser) {
          // Rol kontrolünü tekrar yap
          // const { data: profile, error: profileError } = await supabase
          //   .from('Пользователи') // veya 'profiles'
          //   .select('role')
          //   .eq('user_id', currentUser.id)
          //   .single();
          // if (profile && (profile.role === 'admin' || profile.role === 'business_owner')) {
          //   setIsAdminOrOwner(true);
          // } else {
          //   setIsAdminOrOwner(false);
          //   // supabase.auth.signOut(); // Rol uygun değilse otomatik çıkış
          // }
           setIsAdminOrOwner(true); // GEÇİCİ: Herkesi admin/owner say
        } else {
          setIsAdminOrOwner(false);
        }
        setLoading(false);
      }
    );

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const handleLogin = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) {
        console.error('Admin Login error:', error.message);
        setAuthError(error.message);
        throw error;
      }
      // onAuthStateChange halledecek
      return data;
    } catch (error) {
      setAuthError(error.message || 'Giriş sırasında bir hata oluştu.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Yönetim panelinden direkt kullanıcı kaydı genellikle olmaz,
  // ama gerekirse eklenebilir veya admin tarafından kullanıcı oluşturma fonksiyonu olabilir.
  // const handleRegister = async (...) => { ... };

  const handleLogout = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Admin Logout error:', error.message);
        setAuthError(error.message);
        throw error;
      }
      // onAuthStateChange halledecek
    } catch (error) {
      setAuthError(error.message || 'Çıkış sırasında bir hata oluştu.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    authError,
    setAuthError,
    isAdminOrOwner, // Rol kontrolü için
    login: handleLogin,
    logout: handleLogout,
    isLoggedIn: !!session?.user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthAdmin = () => { // Hook adını farklılaştırdım
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthAdmin must be used within an AuthProvider (Admin)');
  }
  return context;
};
