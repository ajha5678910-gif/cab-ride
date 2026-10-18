import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import { MapView } from '../../components/map/MapView';
import { 
  createVehicleIcon, 
  createPickupIcon, 
  createDropoffIcon 
} from '../../components/map/MapMarkers';
import L from 'leaflet';
import { 
  Radio, 
  Compass, 
  ShieldAlert, 
  Car, 
  Phone, 
  Star, 
  Clock, 
  X, 
  AlertTriangle, 
  Navigation, 
  Sparkles, 
  Layers, 
  MapPin, 
  KeyRound, 
  RotateCcw,
  Eye,
  CheckCircle2,
  XCircle,
  Activity
} from 'lucide-react';

export const GodsEyeMap = () => {
  const [drivers, setDrivers] = useState([]);
  const [rides, setRides] = useState([]);
  const [safetyIncidents, setSafetyIncidents] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState(null); // { type: 'driver' | 'ride' | 'incident', data }
  const [layerFilter, setLayerFilter] = useState('all'); // 'all' | 'idle' | 'active_trips' | 'sos_alerts'
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Safety route divergence observed');

  const loadGodsEyeData = () => {
    setDrivers(dbService.getDrivers());
    setRides(dbService.getRides());
    setSafetyIncidents(dbService.getSafetyIncidents());
  };

  useEffect(() => {
    loadGodsEyeData();
    const unsubscribe = dbService.subscribe(() => {
      loadGodsEyeData();
    });
    return unsubscribe;
  }, []);

  const onlineDrivers = drivers.filter((d) => d.isOnline && d.currentLocation);
  const activeRides = rides.filter((r) => ['searching', 'accepted', 'arrived', 'in_progress'].includes(r.status));
  const activeSOS = safetyIncidents.filter((i) => i.status === 'active_critical');

  // Filter entities according to active layer
  const filteredOnlineDrivers = onlineDrivers.filter((d) => {
    if (layerFilter === 'active_trips') return !!d.currentRideId;
    if (layerFilter === 'idle') return !d.currentRideId;
    if (layerFilter === 'sos_alerts') return false;
    return true;
  });

  const filteredRides = activeRides.filter((r) => {
    if (layerFilter === 'idle') return false;
    if (layerFilter === 'sos_alerts') {
      return activeSOS.some((sos) => sos.rideId === r.rideId);
    }
    return true;
  });

  // Prepare Map Markers
  const markers = [];

  // 1. Vehicle Markers
  filteredOnlineDrivers.forEach((driver) => {
    const isEnRoute = !!driver.currentRideId;
    const category = driver.vehicleDetails?.category || 'Uber Go';
    const heading = driver.currentLocation?.heading || 0;

    markers.push({
      id: `godseye-driver-${driver.uid}`,
      position: [driver.currentLocation.lat, driver.currentLocation.lng],
      icon: createVehicleIcon(category, heading, driver.isOnline),
      popupContent: (
        <div className="text-xs p-1">
          <strong className="block text-sm">{driver.fullName}</strong>
          <span className="text-neutral-500">{category} • {driver.vehicleDetails?.plateNumber}</span>
          <div className="mt-1 font-bold text-emerald-600">
            {isEnRoute ? 'En-Route with Passenger' : 'Idle & Patrolling'}
          </div>
        </div>
      ),
    });
  });

  // 2. Pickup & Dropoff for active trips
  filteredRides.forEach((ride) => {
    if (ride.pickup?.lat && ride.pickup?.lng) {
      markers.push({
        id: `godseye-pickup-${ride.rideId}`,
        position: [ride.pickup.lat, ride.pickup.lng],
        icon: createPickupIcon(),
        popupContent: <div className="text-xs">Pickup: {ride.pickup.address}</div>,
      });
    }
    if (ride.dropoff?.lat && ride.dropoff?.lng) {
      markers.push({
        id: `godseye-dropoff-${ride.rideId}`,
        position: [ride.dropoff.lat, ride.dropoff.lng],
        icon: createDropoffIcon(),
        popupContent: <div className="text-xs">Destination: {ride.dropoff.address}</div>,
      });
    }
  });

  // 3. SOS Flashing Beacons
  if (layerFilter === 'all' || layerFilter === 'sos_alerts') {
    activeSOS.forEach((sos) => {
      const ride = rides.find((r) => r.rideId === sos.rideId);
      const lat = ride?.pickup?.lat || 28.6315;
      const lng = ride?.pickup?.lng || 77.2167;

      const sosIcon = L.divIcon({
        className: 'sos-pulsing-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-red-500 opacity-75"></span>
            <span class="relative inline-flex items-center justify-center rounded-full h-7 w-7 bg-red-600 text-white font-black text-[10px] shadow-lg border-2 border-white">
              SOS
            </span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      markers.push({
        id: `godseye-sos-${sos.incidentId}`,
        position: [lat, lng],
        icon: sosIcon,
        popupContent: (
          <div className="text-xs text-red-600 font-bold p-1">
            CRITICAL SOS DISPATCH: {sos.reason}
          </div>
        ),
      });
    });
  }

  // Active polylines for displayed rides
  const primaryPolyline = filteredRides[0]?.polylineCoords || null;

  const handleAdminForceCancel = () => {
    if (!selectedEntity || selectedEntity.type !== 'ride') return;
    dbService.adminForceCancelRide(selectedEntity.data.rideId, cancelReason);
    setCancelModalOpen(false);
    setSelectedEntity(null);
    loadGodsEyeData();
  };

  return (
    <div className="relative w-full h-[640px] rounded-3xl overflow-hidden border border-neutral-200 shadow-2xl bg-[#0F172A] flex flex-col">
      {/* Top Telemetry Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Layer Filters */}
        <div className="bg-black/90 backdrop-blur-md p-1.5 rounded-2xl shadow-2xl border border-neutral-700 flex items-center space-x-1 pointer-events-auto text-xs">
          <button
            onClick={() => setLayerFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 ${
              layerFilter === 'all' ? 'bg-white text-black shadow' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-uber-blue" />
            <span>All Fleet ({onlineDrivers.length})</span>
          </button>

          <button
            onClick={() => setLayerFilter('idle')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 ${
              layerFilter === 'idle' ? 'bg-emerald-500 text-white shadow' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Idle ({onlineDrivers.filter((d) => !d.currentRideId).length})</span>
          </button>

          <button
            onClick={() => setLayerFilter('active_trips')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 ${
              layerFilter === 'active_trips' ? 'bg-uber-blue text-white shadow' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>In-Trip ({activeRides.length})</span>
          </button>

          <button
            onClick={() => setLayerFilter('sos_alerts')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 ${
              layerFilter === 'sos_alerts' ? 'bg-red-600 text-white shadow animate-pulse' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>SOS ({activeSOS.length})</span>
          </button>
        </div>

        {/* Right Map Actions & Entity Selector */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          {/* Quick Select Ride Dropdown */}
          <select
            onChange={(e) => {
              const ride = rides.find((r) => r.rideId === e.target.value);
              if (ride) setSelectedEntity({ type: 'ride', data: ride });
            }}
            value={selectedEntity?.type === 'ride' ? selectedEntity.data.rideId : ''}
            className="bg-black/90 text-white text-xs px-3 py-2 rounded-2xl border border-neutral-700 font-semibold focus:outline-none"
          >
            <option value="">Inspect Live Active Trip...</option>
            {activeRides.map((r) => (
              <option key={r.rideId} value={r.rideId}>
                {r.category} • {r.customerName} ({r.status})
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="bg-black/90 hover:bg-black text-white text-xs px-3 py-2 rounded-2xl border border-neutral-700 font-bold transition flex items-center space-x-1"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>{isDarkMode ? 'Light Map' : 'Night Radar'}</span>
          </button>
        </div>
      </div>

      {/* Map View */}
      {(() => {
        const dynamicCenter = onlineDrivers[0]?.currentLocation
          ? [onlineDrivers[0].currentLocation.lat, onlineDrivers[0].currentLocation.lng]
          : activeRides[0]?.pickup?.lat
          ? [activeRides[0].pickup.lat, activeRides[0].pickup.lng]
          : [28.6250, 77.2200];

        return (
          <div className={`w-full h-full relative z-0 ${isDarkMode ? 'brightness-90 contrast-125 invert-[0.9] hue-rotate-180' : ''}`}>
            <MapView
              center={dynamicCenter}
              zoom={13}
              markers={markers}
              polyline={primaryPolyline}
              className="w-full h-full"
            />
          </div>
        );
      })()}

      {/* Floating Bottom Quick Fleet Status Badges */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center space-x-2 pointer-events-none">
        <div className="bg-black/90 text-white px-3.5 py-1.5 rounded-2xl text-[11px] font-bold border border-neutral-700 flex items-center space-x-2 shadow-2xl pointer-events-auto">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>City Live GPS Radar Engine Active • 2.5s Sync</span>
        </div>
      </div>

      {/* LIVE TELEMETRY INSPECTOR DRAWER (Opens when entity selected) */}
      {selectedEntity && (
        <div className="absolute top-4 right-4 bottom-4 w-96 z-30 bg-black/95 backdrop-blur-xl border border-neutral-700 text-white rounded-3xl p-5 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 overflow-y-auto">
          <div>
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="font-bold text-sm">Telemetry Inspector</h3>
              </div>
              <button
                onClick={() => setSelectedEntity(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedEntity.type === 'ride' && (
              <div className="mt-4 space-y-4 text-xs">
                {/* Trip Header */}
                <div className="bg-neutral-900 p-3 rounded-2xl border border-neutral-800 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-sm text-uber-blue uppercase">
                      {selectedEntity.data.category}
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded-full text-[10px]">
                      {selectedEntity.data.status?.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Ride ID: {selectedEntity.data.rideId}
                  </div>
                </div>

                {/* 4-Digit PIN Security Card */}
                <div className="bg-amber-950/40 border border-amber-600/50 p-3 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-200 font-bold">4-Digit Verification PIN:</span>
                  </div>
                  <span className="text-base font-black text-amber-300 font-mono tracking-widest bg-black px-2 py-0.5 rounded-lg border border-amber-500">
                    {selectedEntity.data.verificationPin}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="bg-neutral-900 p-3 rounded-2xl border border-neutral-800 space-y-1.5">
                  <span className="text-neutral-400 text-[10px] uppercase font-bold tracking-wider">
                    Passenger Details:
                  </span>
                  <div className="font-bold text-sm text-white">
                    {selectedEntity.data.customerName}
                  </div>
                  <div className="text-neutral-400">{selectedEntity.data.customerPhone}</div>
                  {selectedEntity.data.isTeenRide && (
                    <span className="inline-block bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      Uber for Teens Ride (Guardian Protected)
                    </span>
                  )}
                </div>

                {/* Driver Partner Info */}
                <div className="bg-neutral-900 p-3 rounded-2xl border border-neutral-800 space-y-1.5">
                  <span className="text-neutral-400 text-[10px] uppercase font-bold tracking-wider">
                    Assigned Partner:
                  </span>
                  <div className="font-bold text-sm text-white flex items-center justify-between">
                    <span>{selectedEntity.data.driverName || 'Matching in progress...'}</span>
                    {selectedEntity.data.driverRating && (
                      <span className="text-amber-400 flex items-center text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                        {selectedEntity.data.driverRating}
                      </span>
                    )}
                  </div>
                  {selectedEntity.data.vehicleDetails && (
                    <div className="text-neutral-400 text-[11px]">
                      {selectedEntity.data.vehicleDetails.makeModel} • {selectedEntity.data.vehicleDetails.plateNumber}
                    </div>
                  )}
                </div>

                {/* Route Waypoints */}
                <div className="bg-neutral-900 p-3 rounded-2xl border border-neutral-800 space-y-2">
                  <div className="flex items-start space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                    <div className="truncate">
                      <strong className="text-emerald-400">Pickup:</strong> {selectedEntity.data.pickup?.address}
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1 shrink-0" />
                    <div className="truncate">
                      <strong className="text-red-400">Dropoff:</strong> {selectedEntity.data.dropoff?.address}
                    </div>
                  </div>
                </div>

                {/* Live Speed & Route Stats */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-neutral-900 p-2.5 rounded-2xl border border-neutral-800">
                    <span className="text-[10px] text-neutral-400">Estimated Distance</span>
                    <div className="text-sm font-bold text-white">{selectedEntity.data.distanceKm} km</div>
                  </div>
                  <div className="bg-neutral-900 p-2.5 rounded-2xl border border-neutral-800">
                    <span className="text-[10px] text-neutral-400">Upfront Fare</span>
                    <div className="text-sm font-bold text-emerald-400">₹{selectedEntity.data.upfrontFare}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Intervention Button */}
          {selectedEntity?.type === 'ride' && selectedEntity.data.status !== 'completed' && selectedEntity.data.status !== 'cancelled' && (
            <div className="pt-4 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setCancelModalOpen(true)}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 transition shadow-lg"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Admin Force-Cancel / Intervene Trip</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Force Cancel Reason Confirmation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 text-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-2 text-red-500 font-bold">
              <AlertTriangle className="w-5 h-5" />
              <span>Intervene & Terminate Active Trip</span>
            </div>
            <p className="text-xs text-neutral-400">
              You are about to force-terminate this active trip from the God's Eye Command Radar. Please specify an intervention reason:
            </p>

            <input
              type="text"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full bg-black border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              placeholder="e.g. Traffic anomaly, Safety protocol trigger..."
            />

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-xs font-semibold"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={handleAdminForceCancel}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
              >
                Confirm Termination
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
