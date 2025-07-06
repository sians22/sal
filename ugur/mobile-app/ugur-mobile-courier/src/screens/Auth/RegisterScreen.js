import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuthCourier } from '../../contexts/AuthContext'; // Kurye AuthContext

const RegisterScreen = ({ navigation }) => {
  const { register, loading, authError, setAuthError } = useAuthCourier();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [vehicleType, setVehicleType] = useState(''); // Kuryeye özel: Araç Tipi (bisiklet, motor, araba)

  const handleRegisterPress = async () => {
    if (!email || !password || !firstName || !lastName || !phoneNumber || !vehicleType) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }

    setAuthError(null);
    try {
      // Kurye kaydında AuthContext'e vehicleType gibi ek bilgiler de gönderilebilir.
      // Bu bilgiler user_metadata'ya veya 'Курьеры_Детали' tablosuna bir trigger/function ile yazılabilir.
      await register(email, password, {
        firstName,
        lastName,
        phoneNumber,
        role: 'courier', // AuthContext'teki register fonksiyonu bunu dikkate almalı
        vehicle_type: vehicleType // Ek metadata olarak gönderilebilir
      });
      Alert.alert(
        'Kayıt Başvurusu Alındı',
        'Kurye başvurunuz alınmıştır. Onay süreci sonrası bilgilendirileceksiniz. Şimdi giriş ekranına yönlendiriliyorsunuz.'
      );
      navigation.navigate('CourierLogin');
    } catch (error) {
      console.log("Courier Register screen error:", authError || error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Kurye Kayıt Ol</Text>
      <TextInput style={styles.input} placeholder="Adınız" value={firstName} onChangeText={setFirstName} placeholderTextColor="#888"/>
      <TextInput style={styles.input} placeholder="Soyadınız" value={lastName} onChangeText={setLastName} placeholderTextColor="#888"/>
      <TextInput style={styles.input} placeholder="E-posta" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#888"/>
      <TextInput style={styles.input} placeholder="Telefon Numarası" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" placeholderTextColor="#888"/>
      <TextInput style={styles.input} placeholder="Araç Tipi (örn: Motor)" value={vehicleType} onChangeText={setVehicleType} placeholderTextColor="#888"/>
      <TextInput style={styles.input} placeholder="Şifre (en az 6 karakter)" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor="#888"/>
      <TextInput style={styles.input} placeholder="Şifre Tekrar" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry placeholderTextColor="#888"/>

      {authError && <Text style={styles.errorText}>{authError}</Text>}
      <Button title={loading ? "Kayıt Olunuyor..." : "Kayıt Ol"} onPress={handleRegisterPress} disabled={loading} />
      <Button
        title="Zaten hesabınız var mı? Giriş Yapın"
        onPress={() => navigation.navigate('CourierLogin')}
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
