import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext'; // Müşteri AuthContext

const RegisterScreen = ({ navigation }) => {
  const { register, loading, authError, setAuthError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleRegisterPress = async () => {
    if (!email || !password || !firstName || !lastName || !phoneNumber) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }
    // Diğer doğrulamalar (örn: email formatı, şifre gücü) eklenebilir.

    setAuthError(null); // Önceki hataları temizle
    try {
      await register(email, password, {
        firstName,
        lastName,
        phoneNumber
        // role: 'customer' // AuthContext içinde veya Supabase trigger ile yönetilebilir
      });
      // Başarılı kayıt sonrası kullanıcıya bilgi verilebilir.
      // Supabase email onayı gerektiriyorsa, kullanıcı hemen giriş yapamaz.
      Alert.alert('Kayıt Başarılı', 'Lütfen e-postanızı kontrol ederek hesabınızı onaylayın (eğer gerekiyorsa) ve ardından giriş yapın.');
      navigation.navigate('Login'); // Login ekranına yönlendir
    } catch (error) {
      // authError state'i zaten AuthContext içinde set ediliyor.
      // Alert.alert('Kayıt Başarısız', authError || error.message);
      console.log("Register screen error:", authError || error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Müşteri Kayıt Ol</Text>
      <TextInput
        style={styles.input}
        placeholder="Adınız"
        value={firstName}
        onChangeText={setFirstName}
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Soyadınız"
        value={lastName}
        onChangeText={setLastName}
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="E-posta"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Telefon Numarası"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Şifre (en az 6 karakter)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Şifre Tekrar"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        placeholderTextColor="#888"
      />
      {authError && <Text style={styles.errorText}>{authError}</Text>}
      <Button title={loading ? "Kayıt Olunuyor..." : "Kayıt Ol"} onPress={handleRegisterPress} disabled={loading} />
      <Button
        title="Zaten hesabınız var mı? Giriş Yapın"
        onPress={() => navigation.navigate('Login')}
        color="#841584"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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

export default RegisterScreen;
