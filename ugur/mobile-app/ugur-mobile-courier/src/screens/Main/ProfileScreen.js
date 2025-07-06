import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, Switch } from 'react-native';
import { useAuthCourier } from '../../contexts/AuthContext'; // Kurye AuthContext
import { supabase } from '../../lib/supabaseClient';
import { useFocusEffect } from '@react-navigation/native';

const ProfileScreen = ({ navigation }) => {
  const { user, session, logout, updateUserProfile: updateAuthUser, loading: authLoading, authError, setAuthError } = useAuthCourier();

  const [firstName, setFirstName] = useState(user?.user_metadata?.first_name || '');
  const [lastName, setLastName] = useState(user?.user_metadata?.last_name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || user?.user_metadata?.phone_number || '');
  const [email, setEmail] = useState(user?.email || '');

  const [vehicleType, setVehicleType] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState('offline'); // 'online', 'offline', 'on_delivery'

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Kurye detaylarını (araç tipi, müsaitlik durumu) Supabase'den çek
  const fetchCourierDetails = useCallback(async () => {
    if (!user) {
      setLoadingProfile(false);
      return;
    }
    setLoadingProfile(true);
    try {
      const { data, error } = await supabase
        .from('Курьеры_Детали')
        .select('vehicle_type, availability_status')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116: No rows found (henüz profil yoksa)
        throw error;
      }
      if (data) {
        setVehicleType(data.vehicle_type || '');
        setAvailabilityStatus(data.availability_status || 'offline');
      }
    } catch (err) {
      console.error("Error fetching courier details:", err);
      // Alert.alert('Hata', 'Kurye detayları yüklenemedi.');
    } finally {
      setLoadingProfile(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setFirstName(user.user_metadata?.first_name || '');
      setLastName(user.user_metadata?.last_name || '');
      setPhoneNumber(user.phone || user.user_metadata?.phone_number || '');
      setEmail(user.email || '');
      fetchCourierDetails();
    }
  }, [user, fetchCourierDetails]);

  useFocusEffect(fetchCourierDetails); // Ekran focus olduğunda kurye detaylarını tekrar çek

  const handleUpdateProfile = async () => {
    if (!firstName.trim() || !lastName.trim() || !phoneNumber.trim() || !vehicleType.trim()) {
      Alert.alert('Hata', 'Ad, soyad, telefon ve araç tipi boş bırakılamaz.');
      return;
    }
    setSaving(true);
    setAuthError(null);
    try {
      // 1. Auth user metadata güncelle (isim, soyisim, telefon)
      await updateAuthUser({
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber // user_metadata'ya da kopyala
          // Eğer ana phone alanı güncellenecekse: phone: phoneNumber (SMS onayı gerektirebilir)
      });

      // 2. 'Курьеры_Детали' tablosunu güncelle veya oluştur (upsert)
      const { error: upsertError } = await supabase
        .from('Курьеры_Детали')
        .upsert({
            user_id: user.id, // Eşleştirme için
            vehicle_type: vehicleType,
            availability_status: availabilityStatus, // Müsaitlik durumu da buradan güncellenebilir
            // current_latitude, current_longitude: OrderListScreen'de güncelleniyor
            // average_rating: backend'den hesaplanacak
         }, {
            onConflict: 'user_id' // Eğer user_id varsa güncelle, yoksa ekle
         });

      if (upsertError) throw upsertError;

      Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.');
      setIsEditing(false);
    } catch (error) {
      console.error("Courier Profile update error:", error);
      Alert.alert('Güncelleme Başarısız', authError || error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvailabilityChange = async (newStatus) => {
    if (!user) return;
    setAvailabilityStatus(newStatus ? 'online' : 'offline'); // Switch true ise 'online'
    setSaving(true);
    try {
      const { error: updateError } = await supabase
        .from('Курьеры_Детали')
        .update({ availability_status: newStatus ? 'online' : 'offline' })
        .eq('user_id', user.id);

      if (updateError) { // Eğer kayıt yoksa ve update hata verirse, upsert deneyebiliriz.
          if (updateError.code === '23503' || updateError.message.includes('violates foreign key constraint')) { // Örnek hata kodu/mesajı
             // Bu durum, Курьеры_Детали'de user_id için kayıt olmadığını gösterebilir. upsert ile ekle.
             await supabase.from('Курьеры_Детали').upsert({user_id: user.id, availability_status: newStatus ? 'online' : 'offline'}, {onConflict: 'user_id'});
          } else {
            throw updateError;
          }
      }
      console.log("Courier availability updated to:", newStatus ? 'online' : 'offline');
    } catch (err) {
      console.error("Error updating availability:", err);
      Alert.alert("Hata", "Müsaitlik durumu güncellenemedi.");
      setAvailabilityStatus(!newStatus ? 'online' : 'offline'); // Başarısız olursa eski değere dön
    } finally {
        setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (authLoading || loadingProfile) {
    return <View style={styles.centered}><Text>Yükleniyor...</Text></View>;
  }

  if (!session || !user) {
    return (
      <View style={styles.centered}>
        <Text>Profilinizi görmek için lütfen giriş yapın.</Text>
        <Button title="Giriş Yap" onPress={() => navigation.navigate('CourierLogin')} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Kurye Profilim</Text>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>E-posta:</Text>
        <TextInput style={[styles.input, styles.disabledInput]} value={email} editable={false} />
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Ad:</Text>
        <TextInput style={isEditing ? styles.input : [styles.input, styles.disabledInput]} value={firstName} onChangeText={setFirstName} editable={isEditing}/>
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Soyad:</Text>
        <TextInput style={isEditing ? styles.input : [styles.input, styles.disabledInput]} value={lastName} onChangeText={setLastName} editable={isEditing}/>
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Telefon Numarası:</Text>
        <TextInput style={isEditing ? styles.input : [styles.input, styles.disabledInput]} value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" editable={isEditing}/>
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Araç Tipi:</Text>
        <TextInput style={isEditing ? styles.input : [styles.input, styles.disabledInput]} value={vehicleType} onChangeText={setVehicleType} editable={isEditing} placeholder="örn: Motorsiklet, Bisiklet"/>
      </View>

      <View style={[styles.fieldContainer, styles.switchContainer]}>
        <Text style={styles.label}>Çalışma Durumu (Müsaitlik):</Text>
        <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={availabilityStatus === 'online' ? "#f5dd4b" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={(value) => handleAvailabilityChange(value)}
            value={availabilityStatus === 'online'}
            disabled={saving}
        />
        <Text style={styles.availabilityText}>{availabilityStatus === 'online' ? 'Çevrimiçi (Online)' : 'Çevrimdışı (Offline)'}</Text>
      </View>

      {authError && <Text style={styles.errorText}>{authError}</Text>}

      {isEditing ? (
        <View style={styles.buttonGroup}>
          <Button title={saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"} onPress={handleUpdateProfile} disabled={saving || authLoading} color="green" />
          <Button title="İptal" onPress={() => { setIsEditing(false); setAuthError(null); fetchCourierDetails(); /* Formu resetle */ }} color="gray" />
        </View>
      ) : (
        <Button title="Profili Düzenle" onPress={() => setIsEditing(true)} />
      )}

      <View style={{ marginTop: 30, marginBottom: 20 }}>
        <Button title="Çıkış Yap" onPress={handleLogout} color="red" disabled={authLoading} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  fieldContainer: { marginBottom: 15 },
  label: { fontSize: 16, color: '#555', marginBottom: 5 },
  input: { width: '100%', height: 50, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, fontSize: 16, color: '#333' },
  disabledInput: { backgroundColor: '#e9ecef', color: '#777' },
  switchContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  availabilityText: { fontSize: 16, marginLeft:10, fontWeight: '500' },
  buttonGroup: { marginTop: 10, marginBottom:10 },
  errorText: { color: 'red', textAlign: 'center', marginVertical: 10 },
});

export default ProfileScreen;
