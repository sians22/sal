import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin, Navigation, X, Search, MyLocation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import APP_CONFIG from '@/config/settings';

// Debounce function for search
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

const GoogleMapComponent = ({ 
  onLocationSelect, 
  selectedLocation, 
  placeholder = "Search for a location...",
  showRoute = false,
  routePoints = [],
  currentLocation = null,
  height = "400px"
}) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchBox, setSearchBox] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [autocompleteService, setAutocompleteService] = useState(null);
  const [geocoder, setGeocoder] = useState(null);
  
  const mapRef = useRef(null);
  const searchInputRef = useRef(null);
  const { t } = useTranslation();

  // Initialize Google Maps API
  useEffect(() => {
    const loader = new Loader({
      apiKey: APP_CONFIG.GOOGLE_MAPS.API_KEY,
      version: 'weekly',
      libraries: APP_CONFIG.GOOGLE_MAPS.LIBRARIES,
    });

    loader.load().then(() => {
      setMapLoaded(true);
      setAutocompleteService(new google.maps.places.AutocompleteService());
      setGeocoder(new google.maps.Geocoder());
    }).catch((error) => {
      console.error('Error loading Google Maps API:', error);
      toast({
        title: t('map.api_error_title', 'Map API Error'),
        description: t('map.api_error_description', 'Failed to load Google Maps API'),
        variant: "destructive",
      });
    });
  }, [t]);

  // Initialize map
  useEffect(() => {
    if (mapLoaded && mapRef.current && !mapInstance) {
      const map = new google.maps.Map(mapRef.current, {
        center: selectedLocation ? 
          { lat: selectedLocation.lat, lng: selectedLocation.lng } : 
          APP_CONFIG.GOOGLE_MAPS.CENTER,
        zoom: APP_CONFIG.GOOGLE_MAPS.ZOOM,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });

      setMapInstance(map);
      setDirectionsService(new google.maps.DirectionsService());
      setDirectionsRenderer(new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#3B82F6',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      }));

      // Add click listener for location selection
      map.addListener('click', (e) => {
        if (isSelecting) {
          const location = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
          };
          addMarker(location, t('map.location_selected'));
          onLocationSelect(location);
          setIsSelecting(false);
          setSearchQuery('');
          setShowSuggestions(false);
        }
      });

      // Initialize search box
      if (searchInputRef.current) {
        const searchBoxInstance = new google.maps.places.SearchBox(searchInputRef.current);
        setSearchBox(searchBoxInstance);

        searchBoxInstance.addListener('places_changed', () => {
          const places = searchBoxInstance.getPlaces();
          if (places.length === 0) return;

          const place = places[0];
          if (!place.geometry || !place.geometry.location) {
            toast({
              title: t('map.no_results_title', 'No Results'),
              description: t('map.no_results_description', 'No location found for this search'),
              variant: "destructive",
            });
            return;
          }

          const location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            addressString: place.formatted_address
          };

          map.setCenter(place.geometry.location);
          map.setZoom(15);
          addMarker(location, place.formatted_address);
          onLocationSelect(location);
          setSearchQuery(place.formatted_address);
          setShowSuggestions(false);
        });
      }
    }
  }, [mapLoaded, isSelecting, onLocationSelect, t]);

  // Update map when selected location changes
  useEffect(() => {
    if (mapInstance && selectedLocation) {
      const position = { lat: selectedLocation.lat, lng: selectedLocation.lng };
      mapInstance.setCenter(position);
      mapInstance.setZoom(15);
      addMarker(position, selectedLocation.addressString || t('map.location_selected'));
    }
  }, [selectedLocation, mapInstance, t]);

  // Handle route display
  useEffect(() => {
    if (showRoute && mapInstance && directionsService && directionsRenderer && routePoints.length >= 2) {
      directionsRenderer.setMap(mapInstance);
      
      const request = {
        origin: routePoints[0],
        destination: routePoints[routePoints.length - 1],
        waypoints: routePoints.slice(1, -1).map(point => ({ location: point })),
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING
      };

      directionsService.route(request, (result, status) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(result);
          
          // Add markers for route points
          routePoints.forEach((point, index) => {
            const marker = new google.maps.Marker({
              position: point,
              map: mapInstance,
              title: index === 0 ? t('map.pickup_location') : 
                     index === routePoints.length - 1 ? t('map.delivery_location') : 
                     t('map.waypoint'),
              icon: {
                url: index === 0 ? 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#10B981"/>
                    <circle cx="12" cy="12" r="4" fill="white"/>
                  </svg>
                `) : index === routePoints.length - 1 ? 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#EF4444"/>
                    <circle cx="12" cy="12" r="4" fill="white"/>
                  </svg>
                `) : 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="8" fill="#3B82F6"/>
                    <circle cx="12" cy="12" r="3" fill="white"/>
                  </svg>
                `),
                scaledSize: new google.maps.Size(24, 24),
                anchor: new google.maps.Point(12, 12)
              }
            });
            setMarkers(prev => [...prev, marker]);
          });
        }
      });
    }
  }, [showRoute, mapInstance, directionsService, directionsRenderer, routePoints, t]);

  // Add current location marker if provided
  useEffect(() => {
    if (mapInstance && currentLocation) {
      const marker = new google.maps.Marker({
        position: currentLocation,
        map: mapInstance,
        title: t('map.current_location'),
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#8B5CF6"/>
              <circle cx="12" cy="12" r="4" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(24, 24),
          anchor: new google.maps.Point(12, 12)
        }
      });
      setMarkers(prev => [...prev, marker]);
    }
  }, [mapInstance, currentLocation, t]);

  const addMarker = (location, title) => {
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);

    const marker = new google.maps.Marker({
      position: location,
      map: mapInstance,
      title: title,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#3B82F6"/>
            <circle cx="12" cy="9" r="2.5" fill="white"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(24, 24),
        anchor: new google.maps.Point(12, 24)
      }
    });

    setMarkers([marker]);
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          if (mapInstance) {
            mapInstance.setCenter(location);
            mapInstance.setZoom(15);
            addMarker(location, t('map.current_location'));
          }
          
          onLocationSelect(location);
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

  const handleSearchInput = useCallback(
    debounce(async (query) => {
      if (query.length < 3 || !autocompleteService) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const result = await autocompleteService.getPlacePredictions({
          input: query,
          types: ['geocode', 'establishment']
        });
        setSuggestions(result.predictions || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300),
    [autocompleteService]
  );

  useEffect(() => {
    handleSearchInput(searchQuery);
  }, [searchQuery, handleSearchInput]);

  const handleSuggestionClick = async (suggestion) => {
    setSearchQuery(suggestion.description);
    setShowSuggestions(false);
    
    if (!geocoder) return;

    try {
      const result = await geocoder.geocode({ placeId: suggestion.place_id });
      if (result.results.length > 0) {
        const place = result.results[0];
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          addressString: place.formatted_address
        };
        
        if (mapInstance) {
          mapInstance.setCenter(place.geometry.location);
          mapInstance.setZoom(15);
          addMarker(location, place.formatted_address);
        }
        
        onLocationSelect(location);
      }
    } catch (error) {
      console.error("Error geocoding suggestion:", error);
      toast({
        title: t("map.geocode_error_title"),
        description: t("map.geocode_error_description"),
        variant: "destructive"
      });
    }
  };

  const clearSelection = () => {
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);
    setSearchQuery('');
    setShowSuggestions(false);
    setIsSelecting(false);
    onLocationSelect(null);
  };

  const startLocationSelection = () => {
    setIsSelecting(true);
    toast({
      title: t('map.select_location_title'),
      description: t('map.select_location_description'),
    });
  };

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <div className="space-y-2">
        <div className="relative">
          <Input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="pr-20"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={useCurrentLocation}
              className="h-8 w-8 p-0"
            >
              <MyLocation className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={startLocationSelection}
              className="h-8 w-8 p-0"
            >
              <MapPin className="w-4 h-4" />
            </Button>
            {selectedLocation && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={clearSelection}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute z-10 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              >
                <div className="font-medium">{suggestion.structured_formatting?.main_text || suggestion.description}</div>
                {suggestion.structured_formatting?.secondary_text && (
                  <div className="text-sm text-gray-500">{suggestion.structured_formatting.secondary_text}</div>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef} 
        style={{ height, width: '100%' }}
        className="rounded-lg border border-gray-200 overflow-hidden"
      />

      {/* Selection Status */}
      {isSelecting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-3"
        >
          <div className="flex items-center gap-2 text-blue-800">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">{t('map.click_to_select')}</span>
          </div>
        </motion.div>
      )}

      {/* Route Information */}
      {showRoute && routePoints.length >= 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-green-50 border border-green-200 rounded-lg p-3"
        >
          <div className="flex items-center gap-2 text-green-800">
            <Navigation className="w-4 h-4" />
            <span className="text-sm font-medium">{t('map.route_displayed')}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GoogleMapComponent;