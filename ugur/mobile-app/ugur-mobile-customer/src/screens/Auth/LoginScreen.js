import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext'; // Müşteri AuthContext
import { supabase } from '../../lib/supabaseClient'; // Direkt supabase client da kullanılabilir veya AuthContext üzerinden

const LoginScreen = ({ navigation }) => {
  const { login, loading, authError, setAuthError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginPress = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen e-posta ve şifrenizi girin.');
      return;
    }
    try {
      await login(email, password);
      // Başarılı giriş sonrası AppNavigator otomatik olarak MainStack'e yönlendirecek.
      // navigation.navigate('AnaEkran'); // Veya spesifik bir ekrana yönlendirme
    } catch (error) {
      // authError state'i zaten AuthContext içinde set ediliyor.
      // Alert.alert('Giriş Başarısız', authError || error.message);
      console.log("Login screen error:", authError || error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Müşteri Girişi</Text>
      <TextInput
        style={styles.input}
        placeholder="E-posta (customer@example.com)"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Şifre (password)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#888"
      />
      {authError && <Text style={styles.errorText}>{authError}</Text>}
      <Button title={loading ? "Giriş Yapılıyor..." : "Giriş Yap"} onPress={handleLoginPress} disabled={loading} />
      <Button
        title="Hesabınız yok mu? Kayıt Olun"
        onPress={() => navigation.navigate('Register')} // RegisterScreen'e yönlendir
        color="#841584"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default LoginScreen;
