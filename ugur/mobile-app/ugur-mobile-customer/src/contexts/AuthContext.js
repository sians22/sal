import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabaseClient'; // Supabase client'ımızı import ediyoruz

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const getSession = async () => {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error.message);
        setAuthError(error.message);
      }
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth event:', event, newSession);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);
        setAuthError(null); // Clear previous errors on new auth state
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
        console.error('Login error:', error.message);
        setAuthError(error.message);
        throw error;
      }
      // setUser(data.user); // onAuthStateChange halledecek
      // setSession(data.session);
      return data;
    } catch (error) {
      setAuthError(error.message || 'Giriş sırasında bir hata oluştu.');
      // setUser(null); // onAuthStateChange halledecek
      // setSession(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (email, password, options = {}) => {
    setLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: { // Kullanıcı kaydı sırasında eklenecek ek bilgiler (metadata)
            first_name: options.firstName,
            last_name: options.lastName,
            phone_number: options.phoneNumber,
            // role: 'customer' // rol Supabase tarafında trigger ile veya doğrudan atanabilir
          }
        }
      });
      if (error) {
        console.error('Register error:', error.message);
        setAuthError(error.message);
        throw error;
      }
      // Supabase'de email onayı açıksa, kullanıcı hemen giriş yapmaz.
      // Onay sonrası onAuthStateChange tetiklenir.
      // setUser(data.user); // onAuthStateChange halledecek
      // setSession(data.session);
      return data;
    } catch (error) {
      setAuthError(error.message || 'Kayıt sırasında bir hata oluştu.');
      // setUser(null); // onAuthStateChange halledecek
      // setSession(null);
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
        console.error('Logout error:', error.message);
        setAuthError(error.message);
        throw error;
      }
      // setUser(null); // onAuthStateChange halledecek
      // setSession(null);
    } catch (error) {
      setAuthError(error.message || 'Çıkış sırasında bir hata oluştu.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcı profil bilgilerini güncellemek için (Supabase user_metadata)
  const updateUserProfile = async (profileData) => {
    setLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: profileData, // Örneğin: { first_name: 'Yeni Ad', last_name: 'Yeni Soyad' }
      });
      if (error) {
        console.error('Profile update error:', error.message);
        setAuthError(error.message);
        throw error;
      }
      // setUser(data.user); // onAuthStateChange halledecek
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
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateUserProfile,
    isLoggedIn: !!session?.user, // Oturum açık mı kontrolü için kolaylık
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
