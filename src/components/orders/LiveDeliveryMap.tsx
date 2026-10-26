import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Bike, Navigation, Compass, Store, Home, Phone, RefreshCw, Zap, CheckCircle2 } from 'lucide-react';
import { Order } from '../../data/mockData';

interface LiveDeliveryMapProps {
  order: Order;
}

// Realistic waypoints starting from Tikathali Dispatch Hub through Tikathali roads to customer destination
const DEFAULT_ROUTE_WAYPOINTS: [number, number][] = [
  [27.6642, 85.3482], // 0: Aone Kirana Dispatch Hub (Tikathali Main Depot)
  [27.6638, 85.3495], // 1: Turn towards Tikathali Chowk Road
  [27.6631, 85.3510], // 2: Near Water Tank Chowk
  [27.6622, 85.3524], // 3: Along Tikathali - Imadol connecting route
  [27.6615, 85.3538], // 4: Passing Big Mart & Local Market
  [27.6608, 85.3550], // 5: Entering residential colony
  [27.6602, 85.3562], // 6: Near Krishna Temple / School
  [27.6596, 85.3575], // 7: Turning to Destination Street
  [27.6590, 85.3582]  // 8: Customer Home Doorstep
];

export const LiveDeliveryMap: React.FC<LiveDeliveryMapProps> = ({ order }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const riderMarkerRef = useRef<L.Marker | null>(null);
  const completedPolylineRef = useRef<L.Polyline | null>(null);

  // Animation state
  const [waypointIndex, setWaypointIndex] = useState(0);
  const [progress, setProgress] = useState(0.15); // 0 to 1 along current segment
  const [riderSpeed, setRiderSpeed] = useState(28); // km/h
  const [etaMinutes, setEtaMinutes] = useState(14);
  const [distanceRemaining, setDistanceRemaining] = useState('1.6 km');
  const [isAutoCentering, setIsAutoCentering] = useState(true);
  const [isArrived, setIsArrived] = useState(false);
  const [deliveryOtp] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());

  // Current rider coordinates
  const currentCoords = useRef<[number, number]>(DEFAULT_ROUTE_WAYPOINTS[0]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Avoid duplicate initialization
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    const startPoint = DEFAULT_ROUTE_WAYPOINTS[0];
    const endPoint = DEFAULT_ROUTE_WAYPOINTS[DEFAULT_ROUTE_WAYPOINTS.length - 1];

    // Create map centered on Tikathali
    const map = L.map(mapContainerRef.current, {
      center: [27.6616, 85.3532],
      zoom: 15,
      zoomControl: false,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    // OpenStreetMap standard tile layer
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Zoom control in top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // 1. Draw Full Planned Route Polyline
    L.polyline(DEFAULT_ROUTE_WAYPOINTS, {
      color: '#cbd5e1',
      weight: 6,
      opacity: 0.8,
      dashArray: '8, 8',
      lineCap: 'round'
    }).addTo(map);

    // 2. Traveled Route Polyline (Purple Glow)
    const completedLine = L.polyline([startPoint, startPoint], {
      color: '#7e22ce',
      weight: 6,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);
    completedPolylineRef.current = completedLine;

    // 3. Dispatch Hub Store Marker
    const storeIcon = L.divIcon({
      className: 'custom-hub-marker',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
          <div style="background-color: #581c87; color: white; padding: 6px; border-radius: 14px; box-shadow: 0 4px 12px rgba(88,28,135,0.4); border: 2px solid white; display: flex; align-items: center; justify-content: center;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <div style="background: white; border: 1px solid #e2e8f0; font-size: 10px; font-weight: 800; color: #581c87; padding: 2px 8px; border-radius: 9999px; margin-top: 3px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            Tikathali Hub
          </div>
        </div>
      `,
      iconSize: [0, 0]
    });
    L.marker(startPoint, { icon: storeIcon, zIndexOffset: 50 }).addTo(map);

    // 4. Customer Home Destination Marker
    const customerAddressLabel = order.deliveryAddress || 'Tikathali, Lalitpur';
    const homeIcon = L.divIcon({
      className: 'custom-home-marker',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
          <div style="background-color: #16a34a; color: white; padding: 6px; border-radius: 14px; box-shadow: 0 4px 12px rgba(22,163,74,0.4); border: 2px solid white; display: flex; align-items: center; justify-content: center;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          <div style="background: white; border: 1px solid #e2e8f0; font-size: 10px; font-weight: 800; color: #15803d; padding: 2px 8px; border-radius: 9999px; margin-top: 3px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            Your Location
          </div>
        </div>
      `,
      iconSize: [0, 0]
    });
    L.marker(endPoint, { icon: homeIcon, zIndexOffset: 50 }).addTo(map);

    // 5. Animated Moving Rider Scooter Marker
    const riderIcon = L.divIcon({
      className: 'custom-rider-marker',
      html: `
        <div id="live-rider-pin" style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%);">
          <!-- Pulsing Radar Halo -->
          <div style="position: absolute; inset: -4px; border-radius: 9999px; background-color: rgba(147, 51, 234, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <!-- Scooter Box -->
          <div style="position: relative; width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #7e22ce, #a855f7); color: white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(126, 34, 206, 0.6); border: 2.5px solid white;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="18.5" cy="17.5" r="3.5"></circle>
              <circle cx="5.5" cy="17.5" r="3.5"></circle>
              <circle cx="15" cy="5" r="1"></circle>
              <path d="M12 17.5V14l-3-3 4-3 2 3h2"></path>
            </svg>
          </div>
          <!-- Speed Tag -->
          <div style="position: absolute; bottom: -18px; left: 50%; transform: translateX(-50%); background-color: #1e1b4b; color: #f3e8ff; font-size: 9px; font-weight: 800; padding: 1px 6px; border-radius: 6px; white-space: nowrap; border: 1px solid #7e22ce;">
            28 km/h
          </div>
        </div>
      `,
      iconSize: [0, 0]
    });

    const riderMarker = L.marker(startPoint, { icon: riderIcon, zIndexOffset: 100 }).addTo(map);
    riderMarkerRef.current = riderMarker;

    // Fit bounds nicely to display entire route
    map.fitBounds(L.latLngBounds(DEFAULT_ROUTE_WAYPOINTS), {
      padding: [45, 45],
      maxZoom: 16
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Real-Time Rider Movement Animation Loop
  useEffect(() => {
    const totalWaypoints = DEFAULT_ROUTE_WAYPOINTS.length;

    const interval = setInterval(() => {
      setProgress(prevProgress => {
        const nextProgress = prevProgress + 0.05;

        if (nextProgress >= 1) {
          // Advance to next waypoint
          setWaypointIndex(prevIndex => {
            const nextIndex = prevIndex + 1;
            if (nextIndex >= totalWaypoints - 1) {
              setIsArrived(true);
              setDistanceRemaining('0 m');
              setEtaMinutes(0);
              setRiderSpeed(0);
              return totalWaypoints - 2; // Keep at final segment
            }
            return nextIndex;
          });
          return 0;
        }

        return nextProgress;
      });
    }, 450);

    return () => clearInterval(interval);
  }, []);

  // Calculate live position based on waypointIndex and progress
  useEffect(() => {
    if (isArrived) return;

    const p1 = DEFAULT_ROUTE_WAYPOINTS[waypointIndex];
    const p2 = DEFAULT_ROUTE_WAYPOINTS[waypointIndex + 1] || p1;

    // Linear interpolation between p1 and p2
    const lat = p1[0] + (p2[0] - p1[0]) * progress;
    const lng = p1[1] + (p2[1] - p1[1]) * progress;
    currentCoords.current = [lat, lng];

    // Update Rider Marker position
    if (riderMarkerRef.current) {
      riderMarkerRef.current.setLatLng([lat, lng]);
    }

    // Update completed path polyline
    if (completedPolylineRef.current) {
      const traveledPoints = DEFAULT_ROUTE_WAYPOINTS.slice(0, waypointIndex + 1);
      traveledPoints.push([lat, lng]);
      completedPolylineRef.current.setLatLngs(traveledPoints);
    }

    // Dynamic distance & ETA calculation
    const totalSegments = DEFAULT_ROUTE_WAYPOINTS.length - 1;
    const currentFraction = (waypointIndex + progress) / totalSegments;
    const remainingFraction = Math.max(0, 1 - currentFraction);

    const remKm = (remainingFraction * 1.8).toFixed(1);
    if (parseFloat(remKm) < 1.0) {
      setDistanceRemaining(`${Math.round(parseFloat(remKm) * 1000)} m`);
    } else {
      setDistanceRemaining(`${remKm} km`);
    }

    const calculatedEta = Math.ceil(remainingFraction * 14);
    setEtaMinutes(Math.max(1, calculatedEta));

    // Slight realistic fluctuation in speed (24 - 34 km/h)
    const simulatedSpeed = Math.floor(25 + Math.sin(Date.now() / 1500) * 6);
    setRiderSpeed(simulatedSpeed);

    // Auto-center map if enabled
    if (isAutoCentering && mapInstanceRef.current) {
      mapInstanceRef.current.panTo([lat, lng], { animate: true, duration: 0.4 });
    }
  }, [waypointIndex, progress, isAutoCentering, isArrived]);

  const handleCenterRider = () => {
    setIsAutoCentering(true);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(currentCoords.current, 16, { animate: true });
    }
  };

  const handleFitRoute = () => {
    setIsAutoCentering(false);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(L.latLngBounds(DEFAULT_ROUTE_WAYPOINTS), {
        padding: [45, 45],
        animate: true
      });
    }
  };

  return (
    <div className="flex flex-col rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-white">
      {/* Map Header Status Bar */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-purple-900 text-white p-3.5 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-purple-200">
            <Bike className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white tracking-wide">
                {isArrived ? 'Rider Has Arrived!' : 'Rider On The Way'}
              </span>
              <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                LIVE GPS
              </span>
            </div>
            <p className="text-[11px] text-purple-200 font-medium mt-0.5">
              Tikathali Hub → {order.deliveryAddress || 'Customer Home'}
            </p>
          </div>
        </div>

        {/* Live ETA Pill */}
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-purple-200 tracking-wider block">Estimated ETA</span>
          <span className="text-lg font-black text-white">
            {isArrived ? '0 Mins' : `${etaMinutes} Mins`}
          </span>
        </div>
      </div>

      {/* Interactive Leaflet Map Canvas */}
      <div className="relative w-full h-[280px] sm:h-[320px] bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Map Action Controls */}
        <div className="absolute bottom-3 right-3 z-400 flex flex-col gap-2">
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

        {/* Floating Live Telemetry Badge (Speed & Distance) */}
        <div className="absolute top-3 left-3 z-400 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-2.5 px-3 shadow-md flex items-center gap-3">
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

      {/* Bottom Live Details & Rider Card */}
      <div className="p-4 bg-slate-50 border-t border-slate-200/80 space-y-3">
        {/* Rider Profile Card with Direct Call Button */}
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
                Scooter: Ba 98 Pa 4321 • Tikathali Zone
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

        {/* Delivery OTP Security Verification Card */}
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
