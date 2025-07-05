import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useAddresses } from '@/contexts/AddressContext';
import MapComponent from '@/components/MapComponent';
import APP_CONFIG from '@/config/settings'; // API anahtarı için

const AddressFormModal = ({ addressToEdit, closeModal, onSaveSuccess }) => {
  const { t } = useTranslation();
  const { addAddress, updateAddress } = useAddresses();

  const [name, setName] = useState('');
  const [addressString, setAddressString] = useState('');
  const [coordinates, setCoordinates] = useState(null); // { lat, lng }
  const [selectedMapLocation, setSelectedMapLocation] = useState(null); // MapComponent için

  useEffect(() => {
    if (addressToEdit) {
      setName(addressToEdit.name || '');
      setAddressString(addressToEdit.addressString || '');
      setCoordinates(addressToEdit.coordinates || null);
      setSelectedMapLocation(addressToEdit.coordinates ? { lat: addressToEdit.coordinates.lat, lng: addressToEdit.coordinates.lng, addressString: addressToEdit.addressString } : null);
    } else {
      // Yeni adres için state'leri sıfırla (isteğe bağlı, modal her açıldığında sıfırlanabilir)
      setName('');
      setAddressString('');
      setCoordinates(null);
      setSelectedMapLocation(null);
    }
  }, [addressToEdit]);

  const handleLocationSelectFromMap = (location) => {
    if (location && location.lat && location.lng) {
        setCoordinates({ lat: location.lat, lng: location.lng });
        // MapComponent'ten adres dizesi de gelebilir (öneri tıklandığında)
        // Eğer gelmiyorsa veya haritadan direkt seçildiyse, geocode ile al.
        if (location.addressString) {
            setAddressString(location.addressString);
        } else if (window.ymaps && window.ymaps.geocode) {
            window.ymaps.geocode([location.lat, location.lng]).then(res => {
                const firstGeoObject = res.geoObjects.get(0);
                setAddressString(firstGeoObject ? firstGeoObject.getAddressLine() : `${t('address.unnamed_location', 'Adsız Konum')} (${location.lat.toFixed(3)},${location.lng.toFixed(3)})`);
            }).catch(err => {
                console.error("Error geocoding coordinates:", err);
                setAddressString(`${t('address.unnamed_location', 'Adsız Konum')} (${location.lat.toFixed(3)},${location.lng.toFixed(3)})`);
            });
        } else {
            setAddressString(`${t('address.unnamed_location', 'Adsız Konum')} (${location.lat.toFixed(3)},${location.lng.toFixed(3)})`);
        }
        // setSelectedMapLocation, MapComponent'in kendi iç state'i için değil,
        // bu formun MapComponent'e başlangıç konumu vermek için kullandığı state.
        // MapComponent, onLocationSelect ile seçilen konumu zaten dışarı veriyor.
        // Dolayısıyla setSelectedMapLocation'ı burada tekrar set etmek yerine,
        // başlangıçta addressToEdit'ten gelen koordinatlarla set etmek yeterli.
        // Eğer kullanıcı haritada yeni bir yer seçerse, bu fonksiyon tetiklenir ve coordinates/addressString güncellenir.
        // MapComponent'in kendi içindeki işaretçi, kendi tıklama/seçim olaylarıyla yönetilir.
        setSelectedMapLocation({ lat: location.lat, lng: location.lng }); // Bu, haritanın o anki merkezini ve işaretçisini yansıtması için
    } else {
      // Konum null ise (örneğin MapComponent'te seçim temizlendiğinde)
      setCoordinates(null);
      setAddressString('');
      setSelectedMapLocation(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !coordinates || !addressString.trim()) {
      toast({
        title: t('error'), // Genel hata başlığı
        description: t('address.form_validation_error', 'Lütfen tüm zorunlu alanları (isim, adres) doldurun.'),
        variant: 'destructive',
      });
      return;
    }

    const addressData = {
      name: name.trim(),
      addressString: addressString.trim(),
      coordinates,
    };

    let success = false;
    if (addressToEdit) {
      const updated = await updateAddress(addressToEdit.id, addressData);
      if(updated) success = true;
    } else {
      const added = await addAddress(addressData);
      if(added) success = true;
    }

    if (success) {
      toast({
        title: t('success'), // Genel başarı başlığı
        description: addressToEdit
          ? t('address.update_success_message', `Адрес '${name}' успешно обновлен.`)
          : t('address.add_success_message', `Адрес '${name}' успешно добавлен.`),
      });
      if (onSaveSuccess) onSaveSuccess(); // Üst bileşeni haberdar et
      closeModal();
    } else {
       toast({
        title: t('error'),
        description: t('address.save_error_message', 'Adres kaydedilirken bir hata oluştu.'),
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="addressNameModal" className="text-white">{t('address.name_label', 'Adres Adı (Örn: Ev, İş)')}</Label>
        <Input
          id="addressNameModal"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 mt-1"
          placeholder={t('address.name_placeholder', 'Ev, İşyeri vb.')}
          required
        />
      </div>

      <div>
        <Label className="text-white">{t('address.select_on_map_label', 'Haritadan Adres Seçin')}</Label>
        <div className="mt-1">
          <MapComponent
            apiKey={APP_CONFIG.YANDEX_MAPS.API_KEY}
            onLocationSelect={handleLocationSelectFromMap}
            selectedLocation={selectedMapLocation} // MapComponent'in başlangıç konumu için
            placeholder={t('address.map_search_placeholder', 'Adres arayın veya haritadan seçin')}
          />
        </div>
        {addressString && (
          <p className="text-xs text-gray-400 mt-1">
            {t('address.selected_address_preview', 'Seçilen Adres')}: {addressString}
          </p>
        )}
         {coordinates && !addressString && ( // Koordinat var ama adres dizesi yoksa (ilk seçimde olabilir)
          <p className="text-xs text-gray-400 mt-1">
            {t('address.selected_coordinates_preview', 'Seçilen Koordinatlar')}: Lat: {coordinates.lat.toFixed(4)}, Lng: {coordinates.lng.toFixed(4)}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={closeModal} className="bg-white/10 border-white/20">
          {t('cancel', 'Отмена')}
        </Button>
        <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600">
          {addressToEdit ? t('save_changes', 'Сохранить изменения') : t('add_address_button', 'Добавить адрес')}
        </Button>
      </div>
    </form>
  );
};

export default AddressFormModal;
