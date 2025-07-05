import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, X, Search } from 'lucide-react'; // Search ikonu eklendi
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Input bileşeni eklendi
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion'; // Animasyon için eklendi

// Debounce fonksiyonu
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const MapComponent = ({ onLocationSelect, selectedLocation, placeholder, apiKey }) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [placemark, setPlacemark] = useState(null); // Haritadaki mevcut işaretçiyi tutmak için

  // Önceki işaretçiyi kaldırma ve yenisini ekleme fonksiyonu
  const updatePlacemark = (coords, balloonContent = '') => {
    if (!mapInstance) return;
    if (placemark) {
      mapInstance.geoObjects.remove(placemark);
    }
    const newPlacemark = new window.ymaps.Placemark(coords, {
      balloonContent
    }, {
      preset: 'islands#redDotIcon'
    });
    mapInstance.geoObjects.add(newPlacemark);
    setPlacemark(newPlacemark);
  };

  useEffect(() => {
    // Load Yandex Maps API
    if (!window.ymaps) {
      const script = document.createElement('script');
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`; // Dil ru_RU olarak güncellendi
      script.onload = () => {
        window.ymaps.ready(() => {
          setMapLoaded(true);
        });
      };
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, [apiKey]);

  useEffect(() => {
    if (mapLoaded && mapRef.current && !mapInstance) {
      const map = new window.ymaps.Map(mapRef.current, {
        center: selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : [55.751244, 37.618423], // Moskova veya seçili konum
        zoom: 10,
        controls: ['zoomControl', 'fullscreenControl']
      });
      setMapInstance(map);

      if (selectedLocation) {
        // updatePlacemark çağrılmadan önce mapInstance'in set edildiğinden emin olalım
        const initialPlacemark = new window.ymaps.Placemark([selectedLocation.lat, selectedLocation.lng], {
            balloonContent: t('map.location_selected')
        }, {
            preset: 'islands#redDotIcon'
        });
        map.geoObjects.add(initialPlacemark);
        setPlacemark(initialPlacemark);
      }

      map.events.add('click', (e) => {
        if (isSelecting) {
          const coords = e.get('coords');
          const location = { lat: coords[0], lng: coords[1] };
          updatePlacemark(coords, t('map.location_selected'));
          onLocationSelect(location);
          setIsSelecting(false);
          setSearchQuery('');
          setShowSuggestions(false);
          toast({
            title: t('map.location_selected'),
            description: t('map.location_coordinates', { 
              lat: coords[0].toFixed(4), 
              lng: coords[1].toFixed(4) 
            }),
          });
        }
      });
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLoaded, isSelecting, onLocationSelect, t]); // selectedLocation başlangıçta mapInstance'i etkileyebilir, sonra updatePlacemark ile yönetilir.

  const fetchSuggestions = useRef(debounce(async (query) => {
    if (query.length < 3 || !window.ymaps || !mapInstance) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const result = await window.ymaps.suggest(query, {
        results: 5,
        // boundedBy: mapInstance.getBounds() // İsteğe bağlı: arama alanını harita görünümüyle sınırla
      });
      setSuggestions(result || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, 300)).current;

  useEffect(() => {
    fetchSuggestions(searchQuery);
  }, [searchQuery, fetchSuggestions]);

  useEffect(() => {
    if (mapInstance && selectedLocation && typeof selectedLocation.lat === 'number' && typeof selectedLocation.lng === 'number') {
      const newCoords = [selectedLocation.lat, selectedLocation.lng];
      mapInstance.setCenter(newCoords, 15);
      updatePlacemark(newCoords, selectedLocation.addressString || t('map.location_selected'));
    } else if (mapInstance && !selectedLocation && placemark) {
      mapInstance.geoObjects.remove(placemark);
      setPlacemark(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocation, mapInstance, t]); // updatePlacemark ve placemark bağımlılıktan çıkarıldı döngü riskine karşı

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          onLocationSelect(location);
          if (mapInstance) {
            mapInstance.setCenter([location.lat, location.lng], 15);
            updatePlacemark([location.lat, location.lng], t('map.current_location_used'));
          }
          setSearchQuery('');
          setShowSuggestions(false);
          toast({
            title: t('map.current_location_used'),
            description: t('map.current_location_description'),
          });
        },
        (error) => {
          console.error('Error getting current location:', error);
          toast({
            title: t('map.current_location_error'),
            description: t('map.current_location_error_description'),
            variant: "destructive",
          });
        }
      );
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    setSearchQuery(suggestion.displayName);
    setShowSuggestions(false);
    if (!window.ymaps || !mapInstance) return;

    try {
      const result = await window.ymaps.geocode(suggestion.value);
      const firstGeoObject = result.geoObjects.get(0);
      if (firstGeoObject) {
        const coords = firstGeoObject.geometry.getCoordinates();
        const location = { lat: coords[0], lng: coords[1] };
        mapInstance.setCenter(coords, 15);
        updatePlacemark(coords, suggestion.displayName);
        onLocationSelect(location);
      } else {
        toast({ title: t("map.geocode_error_title", "Ошибка геокодирования"), description: t("map.geocode_error_description", "Не удалось найти координаты для выбранного адреса."), variant: "destructive"});
      }
    } catch (error) {
      console.error("Error geocoding suggestion:", error);
      toast({ title: t("map.geocode_error_title", "Ошибка геокодирования"), description: t("map.geocode_api_error", "Произошла ошибка при обработке адреса."), variant: "destructive"});
    }
  };

  const clearSelection = () => {
    if (mapInstance && placemark) {
      mapInstance.geoObjects.remove(placemark);
      setPlacemark(null);
    }
    onLocationSelect(null);
    setIsSelecting(false);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  if (!mapLoaded) {
    return (
      <div className="space-y-2">
         <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/10 h-10">
            <Search className="w-5 h-5 text-gray-400" />
            <Input disabled placeholder={placeholder || t('map.search_address_placeholder', "Adres arayın...")} className="flex-1 bg-transparent border-none text-white placeholder:text-gray-400 focus:ring-0"/>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled className="flex-1">
            <MapPin className="w-4 h-4 mr-2" />
            {t('map.select_on_map')}
          </Button>
          <Button variant="outline" disabled className="flex-1"> {/* flex-1 eklendi */}
            <Navigation className="w-4 h-4 mr-2" />
            {t('map.use_current_location')}
          </Button>
        </div>
        <div className="h-64 bg-gray-700/30 rounded-lg flex items-center justify-center border-2 border-gray-600">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
            <p className="text-sm text-gray-400">{t('map.loading_map', 'Harita yükleniyor...')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 relative">
      <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/10 focus-within:border-blue-500 transition-colors">
        <Search className="w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder || t('map.search_address_placeholder', "Adres arayın...")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.length > 2 && setShowSuggestions(true)}
          className="flex-1 bg-transparent border-none text-white placeholder:text-gray-400 focus:ring-0 h-auto p-0"
        />
        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              setSearchQuery('');
              setSuggestions([]);
              setShowSuggestions(false);
            }}
            className="h-7 w-7"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-white" />
          </Button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <motion.ul
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute z-20 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1"
          // onMouseLeave={() => setShowSuggestions(false)} // Kullanıcı listeden seçim yaparken kapanmaması için kaldırılabilir veya daha iyi yönetilebilir
        >
          {suggestions.map((item, index) => (
            <li
              key={item.displayName + index}
              onClick={() => handleSuggestionClick(item)}
              onMouseEnter={() => { /* İsteğe bağlı: hover efekti */ }}
              className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-sm text-gray-200"
            >
              {item.displayName}
            </li>
          ))}
        </motion.ul>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          type="button"
          variant={isSelecting ? "destructive" : "outline"}
          onClick={() => {
            setIsSelecting(!isSelecting);
            if (isSelecting) setShowSuggestions(false);
          }}
          className="flex-1"
        >
          <MapPin className="w-4 h-4 mr-2" />
          {isSelecting ? t('map.cancel_selection') : t('map.select_on_map')}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={useCurrentLocation}
          className="flex-1"
        >
          <Navigation className="w-4 h-4 mr-2" />
          {t('map.use_current_location')}
        </Button>

        {selectedLocation && (
          <Button
            type="button"
            variant="destructive"
            onClick={clearSelection}
            size="sm"
            className="flex-grow sm:flex-grow-0"
          >
            <X className="w-4 h-4 mr-1 sm:mr-2" /> {t('map.clear_selection', "Temizle")}
          </Button>
        )}
      </div>

      <div 
        ref={mapRef}
        className={`h-64 border-2 rounded-lg overflow-hidden transition-colors ${
          isSelecting ? 'border-blue-500 border-dashed' : 'border-gray-600'
        }`}
        style={{ cursor: isSelecting ? 'crosshair' : 'default' }}
        onClick={() => { if(!isSelecting && showSuggestions) setShowSuggestions(false); }}
      >
        {isSelecting && (
          <div className="absolute inset-0 bg-blue-900/30 flex items-center justify-center pointer-events-none z-10 backdrop-blur-sm">
            <div className="bg-gray-800/80 px-4 py-2 rounded-lg shadow-lg border border-blue-500">
              <p className="text-sm text-blue-300">
                {t('map.selecting_location')}
              </p>
            </div>
          </div>
        )}
      </div>

      {selectedLocation && !isSelecting && (
        <div className="bg-green-800/40 border border-green-700 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4 text-green-400" />
            <div>
              <p className="text-sm font-medium text-green-300">
                {t('map.location_selected')}:
              </p>
              <p className="text-xs text-green-400">
                {t('map.location_coordinates', { lat: selectedLocation.lat.toFixed(4), lng: selectedLocation.lng.toFixed(4) })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;