import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Benzersiz ID'ler için

const STORAGE_KEY = 'userFavoriteAddresses';

const AddressContext = createContext();

export const useAddresses = () => {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error('useAddresses must be used within an AddressProvider');
  }
  return context;
};

export const AddressProvider = ({ children }) => {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // localStorage'dan adresleri yükle
  useEffect(() => {
    try {
      const savedAddresses = localStorage.getItem(STORAGE_KEY);
      if (savedAddresses) {
        setAddresses(JSON.parse(savedAddresses));
      }
    } catch (error) {
      console.error("Error loading addresses from localStorage:", error);
      setAddresses([]); // Hata durumunda boş dizi ile başla
    }
    setIsLoading(false);
  }, []);

  // Adresler değiştiğinde localStorage'ı güncelle
  useEffect(() => {
    if (!isLoading) { // Sadece ilk yükleme bittikten sonra kaydet
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
      } catch (error) {
        console.error("Error saving addresses to localStorage:", error);
      }
    }
  }, [addresses, isLoading]);

  const addAddress = (addressData) => {
    // addressData: { name: string, addressString: string, coordinates: { lat: number, lng: number } }
    if (!addressData || !addressData.name || !addressData.addressString || !addressData.coordinates) {
      console.error("Invalid address data for addAddress:", addressData);
      // İsteğe bağlı: kullanıcıya bir hata mesajı gösterilebilir
      return null;
    }
    const newAddress = {
      id: uuidv4(),
      ...addressData
    };
    setAddresses(prevAddresses => [...prevAddresses, newAddress]);
    return newAddress;
  };

  const updateAddress = (addressId, updatedData) => {
    // updatedData: { name?: string, addressString?: string, coordinates?: { lat: number, lng: number } }
    setAddresses(prevAddresses =>
      prevAddresses.map(addr =>
        addr.id === addressId ? { ...addr, ...updatedData } : addr
      )
    );
    const updatedAddr = addresses.find(addr => addr.id === addressId);
    return updatedAddr ? { ...updatedAddr, ...updatedData } : null;
  };

  const deleteAddress = (addressId) => {
    setAddresses(prevAddresses => prevAddresses.filter(addr => addr.id !== addressId));
  };

  const getAddresses = () => {
    return addresses;
  };

  const getAddressById = (addressId) => {
    return addresses.find(addr => addr.id === addressId);
  };

  const value = {
    addresses,
    isLoadingAddresses: isLoading, // Yüklenme durumunu dışa aktar
    addAddress,
    updateAddress,
    deleteAddress,
    getAddresses,
    getAddressById,
  };

  return (
    <AddressContext.Provider value={value}>
      {!isLoading && children} {/* Yüklenme bitene kadar çocukları render etme (isteğe bağlı) */}
    </AddressContext.Provider>
  );
};
