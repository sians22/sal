import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigation, MapPin, Clock, Package, User, Phone, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import GoogleMapComponent from './GoogleMapComponent';
import { useTranslation } from 'react-i18next';
import { toast } from '@/components/ui/use-toast';

const CourierRouteView = ({ order, onStatusUpdate, onNavigate }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          
          // Set route points: current location -> pickup -> delivery
          if (order.pickupLocation && order.deliveryLocation) {
            setRoutePoints([
              location,
              order.pickupLocation,
              order.deliveryLocation
            ]);
          }
        },
        (error) => {
          console.error('Error getting current location:', error);
          toast({
            title: t('courier.location_error_title'),
            description: t('courier.location_error_description'),
            variant: "destructive",
          });
        }
      );
    }

    // Watch for location changes
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentLocation(location);
        
        // Update route points with new current location
        if (order.pickupLocation && order.deliveryLocation) {
          setRoutePoints([
            location,
            order.pickupLocation,
            order.deliveryLocation
          ]);
        }
      },
      (error) => {
        console.error('Error watching location:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [order.pickupLocation, order.deliveryLocation, t]);

  const handleStatusUpdate = (newStatus) => {
    onStatusUpdate(order.id, newStatus);
    
    let message = '';
    switch (newStatus) {
      case 'in-transit':
        message = t('courier.status_update_pickup_complete');
        break;
      case 'delivered':
        message = t('courier.status_update_delivery_complete');
        break;
      default:
        message = t('courier.status_updated');
    }
    
    toast({
      title: t('courier.status_updated_title'),
      description: message,
    });
  };

  const handleNavigate = () => {
    if (!currentLocation) {
      toast({
        title: t('courier.navigation_error_title'),
        description: t('courier.navigation_error_description'),
        variant: "destructive",
      });
      return;
    }

    setIsNavigating(true);
    
    // Determine destination based on order status
    let destination;
    if (order.status === 'accepted') {
      destination = order.pickupLocation;
    } else if (order.status === 'in-transit') {
      destination = order.deliveryLocation;
    }

    if (destination) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat},${currentLocation.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`;
      window.open(url, '_blank');
    }

    setTimeout(() => setIsNavigating(false), 1000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-blue-500';
      case 'in-transit': return 'bg-yellow-500';
      case 'delivered': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getNextAction = () => {
    switch (order.status) {
      case 'accepted':
        return {
          action: 'in-transit',
          label: t('courier.action_pickup_complete'),
          description: t('courier.action_pickup_complete_desc'),
          icon: Package
        };
      case 'in-transit':
        return {
          action: 'delivered',
          label: t('courier.action_delivery_complete'),
          description: t('courier.action_delivery_complete_desc'),
          icon: Package
        };
      default:
        return null;
    }
  };

  const nextAction = getNextAction();

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass-effect border-white/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {t('order.id', { id: order.id })}
                </CardTitle>
                <CardDescription className="text-gray-300">
                  {order.description || t('order.no_description')}
                </CardDescription>
              </div>
              <Badge className={`${getStatusColor(order.status)} text-white`}>
                {t(`order.status.${order.status}`)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{order.customerName}</span>
                </div>
                {order.customerPhone && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{order.customerPhone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{order.estimatedTime}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-400">
                  <span className="text-lg font-bold">{order.price} {t('currency.try', 'TRY')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Navigation className="w-4 h-4" />
                  <span className="text-sm">{order.distance} {t('unit.km', 'km')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Truck className="w-4 h-4" />
                  <span className="text-sm">{t('courier.assigned_to', { name: order.courierName })}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Route Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-effect border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              {t('courier.route_title')}
            </CardTitle>
            <CardDescription className="text-gray-300">
              {t('courier.route_description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GoogleMapComponent
              showRoute={true}
              routePoints={routePoints}
              currentLocation={currentLocation}
              height="500px"
              onLocationSelect={() => {}} // Read-only for courier view
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Location Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Pickup Location */}
        <Card className="glass-effect border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-500" />
              {t('order.pickup_location')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 text-sm">
              {order.pickupLocation?.addressString || 
               `${order.pickupLocation?.lat?.toFixed(4)}, ${order.pickupLocation?.lng?.toFixed(4)}`}
            </p>
          </CardContent>
        </Card>

        {/* Delivery Location */}
        <Card className="glass-effect border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500" />
              {t('order.delivery_location')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 text-sm">
              {order.deliveryLocation?.addressString || 
               `${order.deliveryLocation?.lat?.toFixed(4)}, ${order.deliveryLocation?.lng?.toFixed(4)}`}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Button
          onClick={handleNavigate}
          disabled={isNavigating || !currentLocation}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Navigation className="w-4 h-4 mr-2" />
          {isNavigating ? t('courier.navigating') : t('courier.navigate')}
        </Button>

        {nextAction && (
          <Button
            onClick={() => handleStatusUpdate(nextAction.action)}
            className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          >
            <nextAction.icon className="w-4 h-4 mr-2" />
            {nextAction.label}
          </Button>
        )}
      </motion.div>

      {/* Status Update Info */}
      {nextAction && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 text-blue-800">
            <nextAction.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{nextAction.description}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CourierRouteView;