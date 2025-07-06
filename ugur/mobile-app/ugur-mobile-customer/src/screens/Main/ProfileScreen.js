import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext'; // Müşteri AuthContext
import { supabase } from '../../lib/supabaseClient'; // Direkt Supabase client

const ProfileScreen = ({ navigation }) => {
  const { user, session, logout, updateUserProfile, loading: authLoading, authError, setAuthError } = useAuth();

  const [firstName, setFirstName] = useState(user?.user_metadata?.first_name || '');
  const [lastName, setLastName] = useState(user?.user_metadata?.last_name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || user?.user_metadata?.phone_number || '');
  // E-posta genellikle Supabase Auth tarafından yönetilir ve doğrudan değiştirilemez (ayrı bir akış gerektirir)
  const [email, setEmail] = useState(user?.email || '');

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.user_metadata?.first_name || '');
      setLastName(user.user_metadata?.last_name || '');
      // Supabase Auth'dan gelen phone alanı öncelikli, yoksa metadata'dan
      setPhoneNumber(user.phone || user.user_metadata?.phone_number || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!firstName.trim() || !lastName.trim() || !phoneNumber.trim()) {
      Alert.alert('Hata', 'Ad, soyad ve telefon numarası boş bırakılamaz.');
      return;
    }
    setSaving(true);
    setAuthError(null);
    try {
      const updates = {
        data: { // user_metadata altına kaydedilecekler
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber, // Metadata'ya da kopyalayalım
        },
        // Eğer Supabase Auth phone alanını güncellemek isterseniz (SMS onayı gerektirebilir)
        // phone: phoneNumber
      };

      // Eğer telefon numarası Supabase Auth'un ana `phone` alanından farklıysa ve güncellenmek isteniyorsa:
      // Bu işlem genellikle SMS onayı gerektirir ve Supabase'in kendi arayüzü/metotları ile yönetilmelidir.
      // Şimdilik sadece metadata'yı güncelliyoruz.
      // if (user.phone !== phoneNumber) {
      //   updates.phone = phoneNumber; // Bu SMS onayı tetikleyebilir
      // }

      await updateUserProfile(updates.data); // Sadece metadata'yı güncelliyoruz

      // `Пользователи` tablosundaki ek bilgileri güncellemek için (eğer varsa ve AuthContext'te değilse)
      // Bu kısım, veritabanı şemanızda `Пользователи` (veya `profiles`) tablosunda
      // `auth.users.id` ile eşleşen `user_id`'li bir satırınız olduğunu varsayar.
      /*
      const { error: profileUpdateError } = await supabase
        .from('Пользователи') // veya 'profiles'
        .update({
            first_name: firstName,
            last_name: lastName,
            phone_number: phoneNumber,
            // updated_at: new Date().toISOString() // Trigger hallediyor olmalı
        })
        .eq('user_id', user.id); // auth.users.id'ye eşit user_id

      if (profileUpdateError) {
        throw profileUpdateError;
      }
      */

      Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.');
      setIsEditing(false);
    } catch (error) {
      console.error("Profile update error:", error);
      Alert.alert('Güncelleme Başarısız', authError || error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    // AppNavigator zaten Auth ekranlarına yönlendirecek
  };

  if (authLoading && !user) {
    return <View style={styles.centered}><Text>Yükleniyor...</Text></View>;
  }

  if (!session || !user) {
    // Bu durum normalde AppNavigator tarafından yakalanır, ama ekstra kontrol
    return (
      <View style={styles.centered}>
        <Text>Profilinizi görmek için lütfen giriş yapın.</Text>
        <Button title="Giriş Yap" onPress={() => navigation.navigate('Login')} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profilim</Text>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>E-posta:</Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={email}
          editable={false} // E-posta genellikle değiştirilemez
          placeholderTextColor="#888"
        />
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Ad:</Text>
        <TextInput
          style={isEditing ? styles.input : [styles.input, styles.disabledInput]}
          value={firstName}
          onChangeText={setFirstName}
          editable={isEditing}
          placeholderTextColor="#888"
        />
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Soyad:</Text>
        <TextInput
          style={isEditing ? styles.input : [styles.input, styles.disabledInput]}
          value={lastName}
          onChangeText={setLastName}
          editable={isEditing}
          placeholderTextColor="#888"
        />
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Telefon Numarası:</Text>
        <TextInput
          style={isEditing ? styles.input : [styles.input, styles.disabledInput]}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          editable={isEditing}
          placeholderTextColor="#888"
        />
      </View>

      {authError && <Text style={styles.errorText}>{authError}</Text>}

      {isEditing ? (
        <View style={styles.buttonGroup}>
          <Button title={saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"} onPress={handleUpdateProfile} disabled={saving || authLoading} color="green" />
          <Button title="İptal" onPress={() => { setIsEditing(false); setAuthError(null); /* Formu resetle */ }} color="gray" />
        </View>
      ) : (
        <Button title="Profili Düzenle" onPress={() => setIsEditing(true)} />
      )}

      <View style={{ marginTop: 30 }}>
        <Button title="Çıkış Yap" onPress={handleLogout} color="red" disabled={authLoading} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  fieldContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
  },
  disabledInput: {
    backgroundColor: '#e9ecef',
    color: '#777',
  },
  buttonGroup: {
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default ProfileScreen;
