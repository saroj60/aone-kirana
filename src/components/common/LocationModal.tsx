import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { X, MapPin, Check, Navigation, Sparkles, AlertCircle, Compass, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useLocation, DeliveryLocation, isRealAddress } from '../../context/LocationContext';
import { API_BASE_URL } from '../../config/api';

const POPULAR_NEIGHBORHOODS = [
  { name: 'Tikathali Chowk', address: 'Ward 5, Tikathali Chowk, Mahalaxmi, Lalitpur', lat: 27.6616, lon: 85.3532 },
  { name: 'Gwarko Flyover', address: 'Gwarko Chowk, Ring Road, Lalitpur', lat: 27.6685, lon: 85.3340 },
  { name: 'Imadol', address: 'Krishna Mandir Road, Imadol, Lalitpur', lat: 27.6601, lon: 85.3421 },
  { name: 'Sanagaun', address: 'Sanagaun, Ward 4, Siddhipur Road, Lalitpur', lat: 27.6534, lon: 85.3512 },
  { name: 'Balkumari', address: 'Balkumari Bridge Chowk, Lalitpur', lat: 27.6740, lon: 85.3410 },
  { name: 'Lubhu', address: 'Lubhu Bus Park, Mahalaxmi Ward 7, Lalitpur', lat: 27.6490, lon: 85.3670 }
];

export const LocationModal: React.FC = () => {
  const {
    selectedLocation,
    setSelectedLocation,
    isLocationModalOpen,
    setIsLocationModalOpen,
    hasUserConfirmedLocation
  } = useLocation();

  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'detecting' | 'success' | 'error'>('idle');
  const [gpsMessage, setGpsMessage] = useState<string>('');
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Sync state whenever modal opens or selectedLocation changes
  useEffect(() => {
    if (isLocationModalOpen) {
      if (hasUserConfirmedLocation && isRealAddress(selectedLocation.address)) {
        setAddress(selectedLocation.address);
        setLandmark(selectedLocation.landmark || '');
        if (selectedLocation.latitude && selectedLocation.longitude) {
          setCoords({ lat: selectedLocation.latitude, lon: selectedLocation.longitude });
        }
      } else {
        setAddress('');
        setLandmark('');
      }
      setGpsStatus('idle');
      setGpsMessage('');
    }
  }, [isLocationModalOpen, selectedLocation, hasUserConfirmedLocation]);

  // Robust Reverse Geocoding with Backend Proxy & OpenStreetMap Nominatim
  const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
    // 1. Try backend proxy first (avoids browser CORS & adds proper User-Agent)
    try {
      const backendRes = await fetch(`${API_BASE_URL}/location/reverse-geocode?lat=${lat}&lon=${lon}`);
      if (backendRes.ok) {
        const data = await backendRes.json();
        if (data.success && data.address && isRealAddress(data.address)) {
          setAddress(data.address);
          if (data.landmark && !landmark) {
            setLandmark(data.landmark);
          }
          setGpsStatus('success');
          setGpsMessage(`Location: ${data.address}`);
          return data.address;
        }
      }
    } catch (err) {
      console.warn('Backend reverse-geocode notice:', err);
    }

    // 2. Direct OpenStreetMap Nominatim fallback
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=en`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const addrObj = data.address || {};

        const road = addrObj.road || '';
        const neighborhood = addrObj.suburb || addrObj.neighbourhood || addrObj.village || addrObj.quarter || addrObj.hamlet || '';
        const municipality = addrObj.municipality || addrObj.city_district || addrObj.town || addrObj.city || '';
        const district = addrObj.county || 'Lalitpur';

        const parts = [road, neighborhood, municipality, district].filter(Boolean);
        const uniqueParts = parts.filter((part, idx) =>
          parts.findIndex(p => p.toLowerCase().trim() === part.toLowerCase().trim()) === idx
        );

        let fullDetected = uniqueParts.join(', ');
        if (!fullDetected) {
          fullDetected = data.display_name?.split(',').slice(0, 3).join(', ') || 'Tikathali, Lalitpur';
        }

        setAddress(fullDetected);
        if (!landmark && (addrObj.amenity || addrObj.building || addrObj.shop)) {
          setLandmark(addrObj.amenity || addrObj.building || addrObj.shop || '');
        }
        setGpsStatus('success');
        setGpsMessage(`Location: ${fullDetected}`);
        return fullDetected;
      }
    } catch (err) {
      console.warn('OSM Nominatim direct reverse geocode notice:', err);
    }

    // 3. Coordinate-based Lalitpur/Kathmandu approximation fallback
    let fallbackArea = 'Tikathali, Mahalaxmi, Lalitpur';
    if (lat >= 27.65 && lat <= 27.67 && lon >= 85.34 && lon <= 85.37) {
      fallbackArea = 'Tikathali, Mahalaxmi, Lalitpur';
    } else if (lat >= 27.65 && lat <= 27.67 && lon >= 85.33 && lon <= 85.35) {
      fallbackArea = 'Imadol, Mahalaxmi, Lalitpur';
    } else if (lat >= 27.66 && lat <= 27.68 && lon >= 85.32 && lon <= 85.34) {
      fallbackArea = 'Gwarko, Lalitpur';
    } else if (lat >= 27.67 && lat <= 27.69 && lon >= 85.33 && lon <= 85.35) {
      fallbackArea = 'Balkumari, Lalitpur';
    } else if (lat >= 27.64 && lat <= 27.66 && lon >= 85.35 && lon <= 85.38) {
      fallbackArea = 'Lubhu, Mahalaxmi, Lalitpur';
    } else if (lat >= 27.68 && lat <= 27.73) {
      fallbackArea = 'Kathmandu Valley, Nepal';
    }

    setAddress(fallbackArea);
    setGpsStatus('success');
    setGpsMessage(`Location set: ${fallbackArea}`);
    return fallbackArea;
  };

  // Initialize interactive OpenStreetMap Leaflet map when modal is open
  useEffect(() => {
    if (!isLocationModalOpen) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const initialLat = coords?.lat || 27.6616;
      const initialLon = coords?.lon || 85.3532;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLon],
        zoom: coords ? 16 : 14,
        zoomControl: false,
        attributionControl: false
      });

      mapInstanceRef.current = map;

      // OpenStreetMap standard tile layer
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Custom delivery pin icon
      const pinIcon = L.divIcon({
        className: 'custom-osm-pin',
        html: `
          <div style="transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center;">
            <div style="background-color: #7e22ce; color: white; padding: 7px; border-radius: 9999px; box-shadow: 0 4px 12px rgba(126,34,206,0.45); border: 2.5px solid white;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <div style="width: 8px; height: 8px; background: #7e22ce; border-radius: 9999px; margin-top: -3px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
          </div>
        `,
        iconSize: [0, 0]
      });

      const marker = L.marker([initialLat, initialLon], {
        icon: pinIcon,
        draggable: true
      }).addTo(map);

      markerRef.current = marker;

      // Map click handler to place pin & reverse geocode
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setCoords({ lat, lon: lng });
        marker.setLatLng([lat, lng]);
        reverseGeocode(lat, lng);
      });

      // Marker drag handler
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        setCoords({ lat: pos.lat, lon: pos.lng });
        reverseGeocode(pos.lat, pos.lng);
      });

      map.invalidateSize();
    }, 120);

    const resizeTimer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      clearTimeout(resizeTimer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isLocationModalOpen]);

  if (!isLocationModalOpen) return null;

  // Multi-tier detection: Hardware GPS -> IP Geolocation -> Aone Hub
  const handleDetectLocation = async () => {
    setIsDetectingGps(true);
    setGpsStatus('detecting');
    setGpsMessage('Detecting your GPS position...');

    // Tier 1: Browser GPS
    const tryGps = (): Promise<{ lat: number; lon: number } | null> => {
      return new Promise((resolve) => {
        if (!('geolocation' in navigator)) {
          resolve(null);
          return;
        }

        // Fast attempt
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              lat: pos.coords.latitude,
              lon: pos.coords.longitude
            });
          },
          (err) => {
            console.warn('Browser GPS notice (fast):', err.code, err.message);
            // High accuracy fallback attempt
            navigator.geolocation.getCurrentPosition(
              (pos2) => {
                resolve({
                  lat: pos2.coords.latitude,
                  lon: pos2.coords.longitude
                });
              },
              (err2) => {
                console.warn('Browser GPS notice (high-acc):', err2.code, err2.message);
                resolve(null);
              },
              { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
            );
          },
          { enableHighAccuracy: false, timeout: 3500, maximumAge: 60000 }
        );
      });
    };

    // Tier 2: IP Network Geolocation
    const tryIp = async (): Promise<{ lat: number; lon: number } | null> => {
      try {
        const res = await fetch('https://ipwho.is/');
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && data.latitude && data.longitude) {
            return {
              lat: Number(data.latitude),
              lon: Number(data.longitude)
            };
          }
        }
      } catch (e) {
        console.warn('IP location fetch notice:', e);
      }
      return null;
    };

    let targetLat = 27.6616;
    let targetLon = 85.3532;
    let detectionMethod = 'Tikathali Hub';

    // 1. Try GPS
    const gpsCoords = await tryGps();
    if (gpsCoords) {
      targetLat = gpsCoords.lat;
      targetLon = gpsCoords.lon;
      detectionMethod = 'Device GPS';
    } else {
      // 2. Try IP
      setGpsMessage('GPS unavailable. Detecting area via network IP...');
      const ipData = await tryIp();
      if (ipData) {
        targetLat = ipData.lat;
        targetLon = ipData.lon;
        detectionMethod = 'Network IP';
      }
    }

    setCoords({ lat: targetLat, lon: targetLon });

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.flyTo([targetLat, targetLon], 16, { duration: 1 });
      markerRef.current.setLatLng([targetLat, targetLon]);
    }

    setGpsMessage(`Resolving street & area (${detectionMethod})...`);
    await reverseGeocode(targetLat, targetLon);
    setIsDetectingGps(false);
  };

  // Quick select neighborhood chip
  const handleSelectNeighborhood = (hood: typeof POPULAR_NEIGHBORHOODS[0]) => {
    setAddress(hood.address);
    setCoords({ lat: hood.lat, lon: hood.lon });
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.flyTo([hood.lat, hood.lon], 16, { duration: 0.8 });
      markerRef.current.setLatLng([hood.lat, hood.lon]);
    }
    setGpsStatus('success');
    setGpsMessage(`Selected neighborhood: ${hood.name}`);
  };

  // Save the address and landmark
  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedAddress = address.trim();
    if (!trimmedAddress || !isRealAddress(trimmedAddress)) {
      setGpsStatus('error');
      setGpsMessage('Please enter or detect a valid delivery address.');
      return;
    }

    const newLoc: DeliveryLocation = {
      id: `loc-${Date.now()}`,
      name: trimmedAddress,
      address: trimmedAddress,
      landmark: landmark.trim() || undefined,
      city: 'Lalitpur',
      estTime: '30–45 mins',
      latitude: coords?.lat,
      longitude: coords?.lon,
      isCustom: true
    };

    setSelectedLocation(newLoc);
    setIsLocationModalOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-fadeIn"
      style={{ zIndex: 1000 }}
      onClick={() => setIsLocationModalOpen(false)}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto border border-slate-100 animate-fadeIn"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsLocationModalOpen(false)}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition active:scale-95"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Welcoming Header */}
        <div className="flex items-center gap-3.5 mb-4 pr-10">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-brand-700 shadow-xs flex-shrink-0">
            <MapPin className="w-6 h-6 text-brand-700" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                {hasUserConfirmedLocation ? 'Change Delivery Location' : 'Set Delivery Location'}
              </h3>
              <span className="text-[10px] bg-purple-100 text-brand-800 font-extrabold px-1.5 py-0.5 rounded-full">
                NEPAL
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Detect your current location or save your current location
            </p>
          </div>
        </div>

        {/* GPS Live Detection Button: "Detect your current location" */}
        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={isDetectingGps}
          className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-brand-700 to-purple-800 text-white rounded-2xl shadow-md hover:brightness-105 active:scale-98 transition group mb-3.5"
        >
          <div className="flex items-center gap-3 text-left min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white flex-shrink-0">
              {isDetectingGps ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Navigation className="w-4 h-4 text-purple-100 group-hover:rotate-45 transition-transform" />
              )}
            </div>
            <div className="truncate">
              <span className="text-xs font-black block text-white truncate">
                {isDetectingGps ? 'Detecting Location...' : 'Detect your current location'}
              </span>
              <span className="text-[11px] text-purple-200 font-normal block truncate">
                {isDetectingGps ? 'Reading GPS / Network coordinates' : 'Auto-detect your location with GPS & OpenStreetMap'}
              </span>
            </div>
          </div>
          <span className="text-[11px] font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl flex-shrink-0 ml-2">
            {isDetectingGps ? 'Locating...' : 'Detect'}
          </span>
        </button>

        {/* GPS Status / Feedback Banner */}
        {gpsStatus === 'success' && (
          <div className="mb-3.5 flex items-start gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-2 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span className="font-semibold leading-tight">{gpsMessage}</span>
          </div>
        )}

        {gpsStatus === 'error' && (
          <div className="mb-3.5 flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-900 text-xs px-3 py-2 rounded-xl">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span className="font-medium leading-tight">{gpsMessage}</span>
          </div>
        )}

        {/* Interactive OpenStreetMap Pinpoint Map */}
        <div className="mb-3.5 rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs">
          <div className="bg-slate-50 border-b border-slate-200/80 px-3 py-1.5 flex items-center justify-between text-[11px] font-bold text-slate-600">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-700" />
              <span>Pin on OpenStreetMap</span>
            </div>
            <span className="text-[10px] text-brand-700 font-semibold bg-purple-100 px-2 py-0.5 rounded-full">
              Click map or drag pin
            </span>
          </div>
          <div ref={mapContainerRef} className="w-full h-44 bg-slate-100 relative z-0" />
        </div>

        {/* Popular Delivery Neighborhoods Chips */}
        <div className="mb-3.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
            Quick Select Area (Tikathali & Lalitpur):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_NEIGHBORHOODS.map(hood => (
              <button
                key={hood.name}
                type="button"
                onClick={() => handleSelectNeighborhood(hood)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-purple-100 hover:text-brand-800 hover:border-purple-300 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 transition active:scale-95"
              >
                📍 {hood.name}
              </button>
            ))}
          </div>
        </div>

        {/* Address Entry Form */}
        <form onSubmit={handleSave} className="space-y-3.5">
          {/* Field 1: Delivery Address / Area */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-700" />
                Delivery Address / Area <span className="text-red-500">*</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Required</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="e.g. Tikathali Ward 5, Mahalaxmi Municipality"
                required
                className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-700 transition"
              />
              {address && (
                <button
                  type="button"
                  onClick={() => setAddress('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Field 2: Landmark / Nearby Place */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-purple-600" />
                Landmark / Nearby Place
              </span>
              <span className="text-[10px] text-brand-700 font-medium">Helps rider find you</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={landmark}
                onChange={e => setLandmark(e.target.value)}
                placeholder="e.g. Near Shiva Temple, Opposite Big Mart, Green Gate"
                className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-700 transition"
              />
              {landmark && (
                <button
                  type="button"
                  onClick={() => setLandmark('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Active Saved Location Preview if present */}
          {hasUserConfirmedLocation && selectedLocation.address && (
            <div className="p-3 bg-purple-50/70 border border-purple-200/70 rounded-2xl flex items-center justify-between text-xs">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] uppercase font-bold text-purple-700 block tracking-wider">
                  Currently Saved
                </span>
                <p className="font-bold text-slate-800 truncate mt-0.5">
                  {selectedLocation.address}
                </p>
                {selectedLocation.landmark && (
                  <p className="text-[11px] text-slate-500 truncate mt-0.2">
                    Landmark: {selectedLocation.landmark}
                  </p>
                )}
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-brand-800 bg-white px-2 py-0.5 rounded-full border border-purple-200 shadow-2xs flex-shrink-0">
                <Check className="w-3 h-3 text-brand-700" />
                Active
              </span>
            </div>
          )}

          {/* Save Action Button: "Save your current location" */}
          <button
            type="submit"
            disabled={!address.trim() || isDetectingGps}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-700 hover:bg-brand-800 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-98 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Save your current location</span>
          </button>
        </form>

        {/* Footer Guarantee */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>OpenStreetMap & GPS active • Express delivery in 30–60 mins</span>
        </div>
      </div>
    </div>
  );
};
