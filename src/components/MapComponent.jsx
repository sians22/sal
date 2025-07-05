import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

const MapComponent = ({ onLocationSelect, selectedLocation, placeholder, apiKey }) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    // Load Yandex Maps API
    if (!window.ymaps) {
      const script = document.createElement('script');
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey || 'your-api-key'}&lang=tr_TR`;
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
        center: [41.0082, 28.9784], // Istanbul coordinates
        zoom: 10,
        controls: ['zoomControl', 'fullscreenControl']
      });

      setMapInstance(map);

      // Add click event listener
      map.events.add('click', (e) => {
        if (isSelecting) {
          const coords = e.get('coords');
          const location = { lat: coords[0], lng: coords[1] };
          onLocationSelect(location);
          setIsSelecting(false);
          
          // Add marker
          const marker = new window.ymaps.Placemark(coords, {}, {
            preset: 'islands#redDotIcon'
          });
          map.geoObjects.add(marker);
          
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
  }, [mapLoaded, isSelecting, onLocationSelect, t]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          
          // Center map on current location if map is loaded
          if (mapInstance) {
            mapInstance.setCenter([location.lat, location.lng]);
          }
        },
        (error) => {
          console.log('Location not available:', error);
        }
      );
    }
  }, [mapInstance]);

  const useCurrentLocation = () => {
    if (currentLocation) {
      onLocationSelect(currentLocation);
      
      // Add marker for current location
      if (mapInstance) {
        const marker = new window.ymaps.Placemark([currentLocation.lat, currentLocation.lng], {
          balloonContent: 'Current Location'
        }, {
          preset: 'islands#blueDotIcon'
        });
        mapInstance.geoObjects.add(marker);
        mapInstance.setCenter([currentLocation.lat, currentLocation.lng]);
      }
      
      toast({
        title: t('map.current_location_used'),
        description: t('map.current_location_description'),
      });
    } else {
      toast({
        title: t('map.current_location_error'),
        description: t('map.current_location_error_description'),
        variant: "destructive",
      });
    }
  };

  const clearSelection = () => {
    if (mapInstance) {
      mapInstance.geoObjects.removeAll();
    }
    onLocationSelect(null);
    setIsSelecting(false);
  };

  if (!mapLoaded) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button variant="outline" disabled className="flex-1">
            <MapPin className="w-4 h-4 mr-2" />
            {t('map.select_on_map')}
          </Button>
          <Button variant="outline" disabled>
            <Navigation className="w-4 h-4 mr-2" />
            {t('map.use_current_location')}
          </Button>
        </div>
        <div className="h-64 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={isSelecting ? "destructive" : "outline"}
          onClick={() => setIsSelecting(!isSelecting)}
          className="flex-1"
        >
          <MapPin className="w-4 h-4 mr-2" />
          {isSelecting ? t('map.cancel_selection') : t('map.select_on_map')}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={useCurrentLocation}
        >
          <Navigation className="w-4 h-4 mr-2" />
          {t('map.use_current_location')}
        </Button>

        {selectedLocation && (
          <Button
            type="button"
            variant="outline"
            onClick={clearSelection}
            size="icon"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div 
        ref={mapRef}
        className={`h-64 border-2 rounded-lg overflow-hidden ${
          isSelecting ? 'border-blue-500 border-dashed' : 'border-gray-200'
        }`}
        style={{ cursor: isSelecting ? 'crosshair' : 'default' }}
      >
        {isSelecting && (
          <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center pointer-events-none z-10">
            <div className="bg-white px-4 py-2 rounded-lg shadow-lg">
              <p className="text-sm text-gray-700">
                {t('map.selecting_location')}
              </p>
            </div>
          </div>
        )}
      </div>

      {selectedLocation && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">
                {t('map.location_selected')}:
              </p>
              <p className="text-xs text-green-600">
                Lat: {selectedLocation.lat.toFixed(4)}, Lng: {selectedLocation.lng.toFixed(4)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;