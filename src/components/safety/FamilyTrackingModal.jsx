import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Check, 
  MapPin, 
  ShieldCheck, 
  Car, 
  Star, 
  Phone, 
  Clock, 
  Navigation,
  ExternalLink
} from 'lucide-react';
import { MapView } from '../map/MapView';
import { 
  createVehicleIcon, 
  createPickupIcon, 
  createDropoffIcon 
} from '../map/MapMarkers';

export const FamilyTrackingModal = ({ ride, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!ride) return null;

  const trackingCode = ride.shareToken || `UBER-LIVE-${ride.rideId?.slice(-4) || '9482'}`;
  const trackingUrl = `${window.location.origin}/?track=${trackingCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = `Follow my live Uber ride in real-time:\nDriver: ${ride.driverName || 'Partner'} (${ride.vehicleDetails?.plateNumber || ''})\nDestination: ${ride.dropoff?.address}\nTrack here: ${trackingUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const driverPos = ride.currentDriverPosition || ride.pickup;
  const mapCenter = [driverPos.lat, driverPos.lng];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-neutral-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-uber-blue text-white flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold flex items-center space-x-2">
                <span>Public Family & Friend Tracker</span>
                <span className="text-[10px] bg-neutral-800 px-2 py-0.5 rounded-full text-neutral-300 font-mono">
                  {trackingCode}
                </span>
              </div>
              <div className="text-[11px] text-neutral-400">
                Live GPS position shared without exposing personal contact info
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Mini Map */}
        <div className="h-48 w-full relative bg-neutral-100 border-b border-neutral-200">
          <MapView
            center={mapCenter}
            zoom={14}
            className="h-full w-full"
            interactive={false}
          >
            {ride.pickup && (
              <L.Marker
                position={[ride.pickup.lat, ride.pickup.lng]}
                icon={createPickupIcon()}
              />
            )}
            {ride.dropoff && (
              <L.Marker
                position={[ride.dropoff.lat, ride.dropoff.lng]}
                icon={createDropoffIcon()}
              />
            )}
            {driverPos && (
              <L.Marker
                position={[driverPos.lat, driverPos.lng]}
                icon={createVehicleIcon(ride.category || 'Uber Go', 0)}
              />
            )}
            {ride.polylineCoords && ride.polylineCoords.length > 1 && (
              <L.Polyline
                positions={ride.polylineCoords}
                color="#000000"
                weight={4}
                opacity={0.8}
              />
            )}
          </MapView>

          {/* Floating Live Badge */}
          <div className="absolute top-3 left-3 z-[400] bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1.5 shadow">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE VEHICLE TELEMETRY</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Driver & Car Summary */}
          <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={ride.driverPhotoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'}
                alt={ride.driverName}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
              />
              <div>
                <div className="font-bold text-neutral-900 text-sm flex items-center space-x-1.5">
                  <span>{ride.driverName || 'Assigned Driver'}</span>
                  <span className="flex items-center text-amber-500 text-xs">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                    {ride.driverRating || 4.9}
                  </span>
                </div>
                <div className="text-xs text-neutral-500">
                  {ride.vehicleDetails?.makeModel || 'White Sedan'} • {ride.vehicleDetails?.color || 'White'}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="bg-black text-white px-3 py-1 rounded-xl text-xs font-mono font-bold tracking-wider inline-block">
                {ride.vehicleDetails?.plateNumber || 'DL 01 AB 1234'}
              </span>
              <div className="text-[10px] text-neutral-500 mt-1 uppercase font-bold">
                {ride.status.replace('_', ' ')}
              </div>
            </div>
          </div>

          {/* Route Milestones */}
          <div className="space-y-2 text-xs">
            <div className="flex items-start space-x-2">
              <div className="w-3 h-3 rounded-full bg-neutral-900 mt-1 flex-shrink-0" />
              <div>
                <div className="font-semibold text-neutral-500 text-[10px] uppercase">Pickup Location</div>
                <div className="text-neutral-900 font-medium">{ride.pickup?.address}</div>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <div className="w-3 h-3 rounded-none bg-black mt-1 flex-shrink-0" />
              <div>
                <div className="font-semibold text-neutral-500 text-[10px] uppercase">Destination</div>
                <div className="text-neutral-900 font-medium">{ride.dropoff?.address}</div>
              </div>
            </div>
          </div>

          {/* ETA & Distance Card */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-neutral-50 rounded-2xl border border-neutral-200 text-center">
            <div>
              <div className="text-[10px] text-neutral-500 font-bold uppercase">Estimated Time</div>
              <div className="text-base font-extrabold text-neutral-900 flex items-center justify-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-uber-blue" />
                <span>{ride.durationMins || 15} mins</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-neutral-500 font-bold uppercase">Distance Remaining</div>
              <div className="text-base font-extrabold text-neutral-900 flex items-center justify-center space-x-1">
                <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                <span>{ride.distanceKm || 5.2} km</span>
              </div>
            </div>
          </div>

          {/* Share Actions */}
          <div className="space-y-2 pt-2">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex-1 py-3 bg-neutral-900 hover:bg-black text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 transition shadow"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? 'Link Copied to Clipboard!' : 'Copy Shareable Live Link'}</span>
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center space-x-1.5 transition shadow"
              >
                <span>WhatsApp</span>
              </button>
            </div>

            <div className="text-[11px] text-center text-neutral-500 flex items-center justify-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Link expires automatically once trip is completed.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
