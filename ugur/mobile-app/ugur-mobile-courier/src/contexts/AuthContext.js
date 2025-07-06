import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabaseClient'; // Kurye uygulamasının Supabase client'ı

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isCourier, setIsCourier] = useState(false); // Kurye rolü kontrolü

  useEffect(() => {
    setLoading(true);
    const getSession = async () => {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session (Courier):", error.message);
        setAuthError(error.message);
      }
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        // Kurye rolünü doğrula. Bu, Supabase'deki kullanıcı profilinize/metadatasına bağlıdır.
        // Örnek: `currentUser.user_metadata?.role === 'courier'` veya özel bir tablodan çekilebilir.
        // Şimdilik, giriş yapan her kullanıcının kurye olduğunu varsayıyoruz (test için).
        // Gerçek uygulamada bu kontrol Supabase'deki role göre yapılmalıdır.
        // Örneğin, 'profiles' tablosundan rolü çekebilirsiniz:
        /*
        const { data: profile, error: profileError } = await supabase
          .from('Пользователи') // veya 'profiles'
          .select('role')
          .eq('user_id', currentUser.id) // auth.users.id'ye eşit user_id
          .single();
        if (profile && profile.role === 'courier') {
          setIsCourier(true);
        } else {
          setIsCourier(false);
          // Eğer rol kurye değilse otomatik çıkış yapılabilir veya hata gösterilebilir.
          // await supabase.auth.signOut();
        }
        */
        setIsCourier(true); // GEÇİCİ: Herkesi kurye say
      } else {
        setIsCourier(false);
      }
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth event (Courier):', event, newSession);
        setSession(newSession);
        const currentUser = newSession?.user ?? null;
        setUser(currentUser);
        setAuthError(null);

        if (currentUser) {
          // Rol kontrolünü tekrar yap
          /*
          const { data: profile, error: profileError } = await supabase
            .from('Пользователи') // veya 'profiles'
            .select('role')
            .eq('user_id', currentUser.id)
            .single();
          if (profile && profile.role === 'courier') {
            setIsCourier(true);
          } else {
            setIsCourier(false);
            // await supabase.auth.signOut(); // Rol kurye değilse çıkış yap
          }
          */
          setIsCourier(true); // GEÇİCİ: Herkesi kurye say
        } else {
          setIsCourier(false);
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
        console.error('Courier Login error:', error.message);
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

  const handleRegister = async (email, password, options = {}) => {
    setLoading(true);
    setAuthError(null);
    try {
      // Kurye kaydında rolü 'courier' olarak belirtmek önemli.
      // Bu, Supabase trigger'ı ile veya doğrudan user_metadata'ya eklenebilir.
      // Eğer Supabase tarafında bir trigger ile 'profiles' tablosuna rol eklenmiyorsa,
      // burada 'role' metadata olarak gönderilebilir.
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            first_name: options.firstName,
            last_name: options.lastName,
            phone_number: options.phoneNumber,
            role: 'courier', // Kurye rolünü burada belirtiyoruz
            // Kurye için ek metadata: vehicle_type vb.
            // vehicle_type: options.vehicleType
          }
        }
      });
      if (error) {
        console.error('Courier Register error:', error.message);
        setAuthError(error.message);
        throw error;
      }
      // Kayıt sonrası kuryenin onay süreci olabilir.
      // onAuthStateChange halledecek
      return data;
    } catch (error) {
      setAuthError(error.message || 'Kayıt sırasında bir hata oluştu.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Courier Logout error:', error.message);
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

  const updateUserProfile = async (profileData) => {
    setLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: profileData,
      });
      if (error) {
        console.error('Courier Profile update error:', error.message);
        setAuthError(error.message);
        throw error;
      }
      return data.user;
    } catch (error) {
      setAuthError(error.message || 'Profil güncellenirken bir hata oluştu.');
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
    isCourier, // Rol kontrolü için
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateUserProfile,
    isLoggedIn: !!session?.user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthCourier = () => { // Hook adını farklılaştırdım
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthCourier must be used within an AuthProvider (Courier)');
  }
  return context;
};
