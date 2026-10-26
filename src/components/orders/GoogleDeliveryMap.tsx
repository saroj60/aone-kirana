/// <reference types="google.maps" />
import React, { useEffect, useRef, useState } from 'react';
import { Bike, Navigation, Compass, Phone, Sparkles, Key, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { Order } from '../../data/mockData';
import { loadGoogleMaps } from '../../services/googleMapsLoader';

interface GoogleDeliveryMapProps {
  order: Order;
  onFallbackToOSM?: () => void;
}

// Realistic waypoints starting from Tikathali Dispatch Hub through Tikathali roads to customer destination
const ROUTE_WAYPOINTS: { lat: number; lng: number }[] = [
  { lat: 27.6642, lng: 85.3482 }, // 0: Aone Kirana Hub (Tikathali Main Depot)
  { lat: 27.6638, lng: 85.3495 }, // 1: Turn towards Tikathali Chowk Road
  { lat: 27.6631, lng: 85.3510 }, // 2: Near Water Tank Chowk
  { lat: 27.6622, lng: 85.3524 }, // 3: Along Tikathali - Imadol route
  { lat: 27.6615, lng: 85.3538 }, // 4: Passing Local Market & Big Mart
  { lat: 27.6608, lng: 85.3550 }, // 5: Entering residential colony
  { lat: 27.6602, lng: 85.3562 }, // 6: Near Krishna Temple / School
  { lat: 27.6596, lng: 85.3575 }, // 7: Turning to Destination Street
  { lat: 27.6590, lng: 85.3582 }  // 8: Customer Home Doorstep
];

export const GoogleDeliveryMap: React.FC<GoogleDeliveryMapProps> = ({ order, onFallbackToOSM }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapInstance = useRef<google.maps.Map | null>(null);
  const riderMarkerRef = useRef<google.maps.Marker | null>(null);
  const completedPolylineRef = useRef<google.maps.Polyline | null>(null);

  const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('aone_google_maps_api_key') || envKey;
  });
  const [inputKey, setInputKey] = useState('');
  const [isKeyConfigured, setIsKeyConfigured] = useState(Boolean(apiKey && apiKey.trim().length > 10));
  const [isLoadingMap, setIsLoadingMap] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Live animation state
  const [waypointIndex, setWaypointIndex] = useState(0);
  const [progress, setProgress] = useState(0.15);
  const [riderSpeed, setRiderSpeed] = useState(28);
  const [etaMinutes, setEtaMinutes] = useState(14);
  const [distanceRemaining, setDistanceRemaining] = useState('1.6 km');
  const [isAutoCentering, setIsAutoCentering] = useState(true);
  const [isArrived, setIsArrived] = useState(false);
  const [deliveryOtp] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());

  const currentCoords = useRef<{ lat: number; lng: number }>(ROUTE_WAYPOINTS[0]);

  // Load Google Maps when API key is provided
  useEffect(() => {
    if (!apiKey || apiKey.trim().length < 10) {
      setIsKeyConfigured(false);
      return;
    }

    setIsKeyConfigured(true);
    setIsLoadingMap(true);
    setMapError(null);

    loadGoogleMaps(apiKey.trim())
      .then(() => {
        if (!mapRef.current) return;

        // Custom clean map style matching Aone Kirana theme
        const mapOptions: google.maps.MapOptions = {
          center: { lat: 27.6616, lng: 85.3532 },
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          disableDefaultUI: true,
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
          },
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ lightness: 100 }, { visibility: 'simplified' }]
            }
          ]
        };

        const map = new google.maps.Map(mapRef.current, mapOptions);
        googleMapInstance.current = map;

        const startPt = ROUTE_WAYPOINTS[0];
        const endPt = ROUTE_WAYPOINTS[ROUTE_WAYPOINTS.length - 1];

        // 1. Planned Route Polyline
        new google.maps.Polyline({
          path: ROUTE_WAYPOINTS,
          geodesic: true,
          strokeColor: '#94a3b8',
          strokeOpacity: 0.8,
          strokeWeight: 5,
          map
        });

        // 2. Traveled Route Polyline (Purple)
        const completedLine = new google.maps.Polyline({
          path: [startPt, startPt],
          geodesic: true,
          strokeColor: '#7e22ce',
          strokeOpacity: 1.0,
          strokeWeight: 6,
          map
        });
        completedPolylineRef.current = completedLine;

        // 3. Dispatch Hub Store Marker
        new google.maps.Marker({
          position: startPt,
          map,
          title: 'Aone Kirana Tikathali Hub',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#581c87',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3
          }
        });

        // 4. Customer Home Destination Marker
        new google.maps.Marker({
          position: endPt,
          map,
          title: order.deliveryAddress || 'Your Delivery Address',
          icon: {
            path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale: 7,
            fillColor: '#16a34a',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2.5
          }
        });

        // 5. Animated Moving Delivery Rider Scooter Marker
        const riderMarker = new google.maps.Marker({
          position: startPt,
          map,
          title: `Rider: ${order.riderName || 'Bikash Tamang'}`,
          icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 6,
            fillColor: '#9333ea',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2.5,
            rotation: 45
          },
          zIndex: 999
        });
        riderMarkerRef.current = riderMarker;

        // Fit bounds to show entire route
        const bounds = new google.maps.LatLngBounds();
        ROUTE_WAYPOINTS.forEach(pt => bounds.extend(pt));
        map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });

        setIsLoadingMap(false);
      })
      .catch((err) => {
        console.warn('Failed to initialize Google Maps (auto-switching to Free Live Map):', err);
        setIsLoadingMap(false);
        if (onFallbackToOSM) {
          onFallbackToOSM();
        } else {
          setMapError('Invalid API Key or Google Maps service error. Please verify your credentials.');
        }
      });
  }, [apiKey, onFallbackToOSM]);

  // Handle Google Maps runtime auth failure (e.g. invalid key or unbilled project)
  useEffect(() => {
    (window as any).gm_authFailure = () => {
      console.warn('Google Maps authentication failure. Automatically switching to Free Live GPS Map.');
      if (onFallbackToOSM) {
        onFallbackToOSM();
      }
    };
  }, [onFallbackToOSM]);

  // Movement Loop
  useEffect(() => {
    if (!isKeyConfigured || mapError) return;

    const totalWaypoints = ROUTE_WAYPOINTS.length;

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 0.05;
        if (next >= 1) {
          setWaypointIndex(currIdx => {
            const nextIdx = currIdx + 1;
            if (nextIdx >= totalWaypoints - 1) {
              setIsArrived(true);
              setDistanceRemaining('0 m');
              setEtaMinutes(0);
              setRiderSpeed(0);
              return totalWaypoints - 2;
            }
            return nextIdx;
          });
          return 0;
        }
        return next;
      });
    }, 450);

    return () => clearInterval(interval);
  }, [isKeyConfigured, mapError]);

  // Position updates
  useEffect(() => {
    if (!isKeyConfigured || isArrived || mapError) return;

    const p1 = ROUTE_WAYPOINTS[waypointIndex];
    const p2 = ROUTE_WAYPOINTS[waypointIndex + 1] || p1;

    const lat = p1.lat + (p2.lat - p1.lat) * progress;
    const lng = p1.lng + (p2.lng - p1.lng) * progress;
    currentCoords.current = { lat, lng };

    if (riderMarkerRef.current && window.google?.maps) {
      const newPos = new google.maps.LatLng(lat, lng);
      riderMarkerRef.current.setPosition(newPos);
    }

    if (completedPolylineRef.current) {
      const traveled = ROUTE_WAYPOINTS.slice(0, waypointIndex + 1);
      traveled.push({ lat, lng });
      completedPolylineRef.current.setPath(traveled);
    }

    const totalSegs = ROUTE_WAYPOINTS.length - 1;
    const remainingFraction = Math.max(0, 1 - (waypointIndex + progress) / totalSegs);
    const remKm = (remainingFraction * 1.8).toFixed(1);

    if (parseFloat(remKm) < 1.0) {
      setDistanceRemaining(`${Math.round(parseFloat(remKm) * 1000)} m`);
    } else {
      setDistanceRemaining(`${remKm} km`);
    }

    setEtaMinutes(Math.max(1, Math.ceil(remainingFraction * 14)));
    setRiderSpeed(Math.floor(25 + Math.sin(Date.now() / 1500) * 6));

    if (isAutoCentering && googleMapInstance.current) {
      googleMapInstance.current.panTo({ lat, lng });
    }
  }, [waypointIndex, progress, isAutoCentering, isArrived, isKeyConfigured, mapError]);

  const handleSaveCustomKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) return;
    localStorage.setItem('aone_google_maps_api_key', inputKey.trim());
    setApiKey(inputKey.trim());
  };

  const handleCenterRider = () => {
    setIsAutoCentering(true);
    if (googleMapInstance.current) {
      googleMapInstance.current.setCenter(currentCoords.current);
      googleMapInstance.current.setZoom(16);
    }
  };

  const handleFitRoute = () => {
    setIsAutoCentering(false);
    if (googleMapInstance.current && window.google?.maps) {
      const bounds = new google.maps.LatLngBounds();
      ROUTE_WAYPOINTS.forEach(pt => bounds.extend(pt));
      googleMapInstance.current.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    }
  };

  // If no Google Maps API key is configured yet, show setup banner with fallback button
  if (!isKeyConfigured || mapError) {
    return (
      <div className="flex flex-col rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-white p-5">
        <div className="text-center py-4 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 shadow-xs border border-amber-200">
            <Key className="w-7 h-7" />
          </div>

          <h3 className="text-base font-black text-slate-900">Google Maps API Key Required</h3>
          <p className="text-xs text-slate-500 mt-1">
            To render official Google Maps in Aone Kirana, enter your Google Cloud API key below or use the free built-in OpenStreetMap live tracking.
          </p>

          {mapError && (
            <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 text-left">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{mapError}</span>
            </div>
          )}

          {/* Key Input Form */}
          <form onSubmit={handleSaveCustomKey} className="mt-4 space-y-2">
            <input
              type="text"
              value={inputKey}
              onChange={e => setInputKey(e.target.value)}
              placeholder="Paste Google Maps API Key (AIzaSy...)"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-700"
            />
            <button
              type="submit"
              disabled={!inputKey.trim()}
              className="w-full py-2.5 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Activate Google Maps
            </button>
          </form>

          {/* Or Fallback to Free Live Map */}
          {onFallbackToOSM && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col items-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium">Or continue without an API key:</span>
              <button
                type="button"
                onClick={onFallbackToOSM}
                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Switch to Free Live GPS Map (No Key Required)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-white">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-purple-900 text-white p-3.5 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-purple-200">
            <Bike className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white tracking-wide">
                {isArrived ? 'Rider Has Arrived!' : 'Google Maps Live Tracking'}
              </span>
              <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                GOOGLE GPS
              </span>
            </div>
            <p className="text-[11px] text-purple-200 font-medium mt-0.5">
              Tikathali Hub → {order.deliveryAddress || 'Customer Home'}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-purple-200 tracking-wider block">Estimated ETA</span>
          <span className="text-lg font-black text-white">
            {isArrived ? '0 Mins' : `${etaMinutes} Mins`}
          </span>
        </div>
      </div>

      {/* Google Map Container */}
      <div className="relative w-full h-[280px] sm:h-[320px] bg-slate-100">
        <div ref={mapRef} className="w-full h-full" />

        {isLoadingMap && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-10 text-white text-xs font-bold gap-2">
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Loading Google Maps...</span>
          </div>
        )}

        {/* Map Controls */}
        <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-2">
          <button
            onClick={handleCenterRider}
            title="Follow & Recenter Rider"
            className={`w-9 h-9 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
              isAutoCentering
                ? 'bg-brand-700 text-white shadow-brand-700/30 ring-2 ring-purple-300'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Navigation className="w-4 h-4" />
          </button>
          <button
            onClick={handleFitRoute}
            title="View Entire Route"
            className="w-9 h-9 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 flex items-center justify-center shadow-md transition-all active:scale-95"
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>

        {/* Telemetry Badge */}
        <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-2.5 px-3 shadow-md flex items-center gap-3">
          <div>
            <span className="text-[9px] uppercase font-extrabold text-slate-400 block tracking-wider">Distance</span>
            <span className="text-xs font-black text-slate-900">{distanceRemaining}</span>
          </div>
          <div className="w-px h-6 bg-slate-200"></div>
          <div>
            <span className="text-[9px] uppercase font-extrabold text-slate-400 block tracking-wider">Speed</span>
            <span className="text-xs font-black text-brand-700">{riderSpeed} km/h</span>
          </div>
        </div>
      </div>

      {/* Bottom Details & Rider Profile Card */}
      <div className="p-4 bg-slate-50 border-t border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-700 to-purple-600 text-white font-black text-sm flex items-center justify-center shadow-xs flex-shrink-0">
              {order.riderName ? order.riderName.slice(0, 2).toUpperCase() : 'BT'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  {order.riderName || 'Bikash Tamang'}
                </h4>
                <span className="text-[9px] bg-purple-100 text-brand-800 font-extrabold px-1.5 py-0.2 rounded">
                  Verified Rider
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Scooter: Ba 98 Pa 4321 • Tikathali Dispatch Hub
              </p>
            </div>
          </div>

          <a
            href={`tel:${order.riderPhone || '9841000000'}`}
            className="px-3.5 py-2 bg-brand-700 hover:bg-brand-800 active:scale-95 transition text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Rider</span>
          </a>
        </div>

        {/* Security OTP Card */}
        <div className="p-3 bg-purple-50/80 border border-purple-200/80 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-brand-900 block tracking-wide">
              Delivery Confirmation PIN
            </span>
            <p className="text-[11px] text-purple-700 font-medium">
              Share with rider only when order is received
            </p>
          </div>
          <div className="bg-white border-2 border-brand-300 px-3 py-1 rounded-xl shadow-xs">
            <span className="text-base font-black tracking-widest text-brand-800">{deliveryOtp}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
