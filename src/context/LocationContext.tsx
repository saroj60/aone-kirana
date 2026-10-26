import React, { createContext, useContext, useState, useEffect } from 'react';
import { DELIVERY_LOCATIONS } from '../data/mockData';

export interface DeliveryLocation {
  id: string;
  name: string;
  address: string;
  landmark?: string;
  city?: string;
  estTime?: string;
  latitude?: number;
  longitude?: number;
  isCustom?: boolean;
}

export const isRealAddress = (val?: string | null): boolean => {
  if (!val) return false;
  const t = val.trim().toLowerCase();
  if (!t) return false;
  if (t === 'detect your current location' || t === 'set delivery location' || t === 'custom-location') return false;
  return true;
};

export const DEFAULT_UNSET_LOCATION: DeliveryLocation = {
  id: 'custom-location',
  name: '',
  address: '',
  landmark: '',
  city: 'Lalitpur',
  estTime: '30-45 mins'
};

interface LocationContextType {
  selectedLocation: DeliveryLocation;
  setSelectedLocation: (location: DeliveryLocation) => void;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;
  hasUserConfirmedLocation: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLocation, setSelectedLocationState] = useState<DeliveryLocation>(() => {
    const saved = localStorage.getItem('aone_selected_location');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && isRealAddress(parsed.address)) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_UNSET_LOCATION;
  });

  const [hasUserConfirmedLocation, setHasUserConfirmedLocation] = useState<boolean>(() => {
    const confirmed = localStorage.getItem('aone_location_confirmed') === 'true';
    const saved = localStorage.getItem('aone_selected_location');
    if (!confirmed || !saved) return false;
    try {
      const parsed = JSON.parse(saved);
      return !!(parsed && isRealAddress(parsed.address));
    } catch {
      return false;
    }
  });

  // Automatically open location modal for first-time users who have not saved an address yet
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(() => {
    const confirmed = localStorage.getItem('aone_location_confirmed') === 'true';
    const saved = localStorage.getItem('aone_selected_location');
    if (!confirmed || !saved) return true;
    try {
      const parsed = JSON.parse(saved);
      return !isRealAddress(parsed?.address);
    } catch {
      return true;
    }
  });

  const setSelectedLocation = (location: DeliveryLocation) => {
    setSelectedLocationState(location);
    setHasUserConfirmedLocation(true);
    localStorage.setItem('aone_selected_location', JSON.stringify(location));
    localStorage.setItem('aone_location_confirmed', 'true');
  };

  return (
    <LocationContext.Provider
      value={{
        selectedLocation,
        setSelectedLocation,
        isLocationModalOpen,
        setIsLocationModalOpen,
        hasUserConfirmedLocation
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within LocationProvider');
  return context;
};
