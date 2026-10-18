import React, { useState, useEffect } from 'react';
import { 
  Car, 
  MapPin, 
  Clock, 
  Check, 
  X, 
  AlertCircle, 
  Navigation, 
  Sparkles, 
  Package, 
  Hourglass, 
  Compass, 
  CalendarClock, 
  User 
} from 'lucide-react';

export const IncomingRideAlertModal = ({ ride, onAccept, onDecline }) => {
  const [secondsLeft, setSecondsLeft] = useState(15);

  useEffect(() => {
    if (!ride) return;
    setSecondsLeft(15);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onDecline(ride.rideId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [ride?.rideId]);

  if (!ride) return null;

  // Driver estimated payout (85% of upfront fare)
  const estimatedPayout = Math.round(ride.upfrontFare * 0.85);
  const progressPercent = (secondsLeft / 15) * 100;

  // Mode badge helper
  const renderModeBadge = () => {
    switch (ride.bookingMode) {
      case 'reserve':
        return (
          <span className="bg-amber-400 text-black px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center space-x-1">
            <CalendarClock className="w-3 h-3" />
            <span>RESERVE • Scheduled Ride</span>
          </span>
        );
      case 'rentals':
        return (
          <span className="bg-purple-500 text-white px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center space-x-1">
            <Hourglass className="w-3 h-3" />
            <span>RENTALS • {ride.rentalDetails?.packageHours} Hrs Package</span>
          </span>
        );
      case 'intercity':
        return (
          <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center space-x-1">
            <Compass className="w-3 h-3" />
            <span>INTERCITY • {ride.intercityDetails?.tripType === 'round_trip' ? 'Round-Trip' : 'One-Way'}</span>
          </span>
        );
      case 'courier':
        return (
          <span className="bg-emerald-500 text-black px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center space-x-1">
            <Package className="w-3 h-3" />
            <span>COURIER • {ride.courierDetails?.packageWeightKg}kg ({ride.courierDetails?.packageCategory})</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-neutral-950 text-white rounded-3xl max-w-md w-full border-2 border-emerald-500 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Countdown Progress Bar */}
        <div className="w-full bg-neutral-800 h-2 overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>New Ride Alert • {secondsLeft}s left</span>
              </span>
              {renderModeBadge()}
            </div>

            <h2 className="text-xl font-black">{ride.category} Request</h2>
          </div>

          <div className="text-right">
            <div className="text-2xl font-black text-emerald-400">₹{estimatedPayout}</div>
            <div className="text-[10px] text-neutral-400">Est. Payout</div>
          </div>
        </div>

        {/* Guest Rider Pill if booked for someone else */}
        {ride.riderInfo && !ride.riderInfo.isForSelf && (
          <div className="bg-neutral-900 px-6 py-2 border-b border-neutral-800 flex items-center space-x-2 text-xs text-amber-300">
            <User className="w-3.5 h-3.5" />
            <span>
              <strong>Guest Passenger:</strong> {ride.riderInfo.riderName} ({ride.riderInfo.riderPhone})
            </span>
          </div>
        )}

        {/* Trip Details */}
        <div className="p-6 space-y-4">
          <div className="space-y-3 text-xs">
            {/* Pickup */}
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-bold">
                  Pickup Location:
                </span>
                <div className="font-semibold text-white">{ride.pickup.address}</div>
              </div>
            </div>

            {/* Stops if any */}
            {ride.stops && ride.stops.length > 0 && (
              <div className="pl-2 border-l-2 border-dashed border-neutral-700 ml-2.5 my-1 text-[11px] text-amber-400 font-semibold">
                + {ride.stops.length} Intermediate {ride.stops.length === 1 ? 'Stop' : 'Stops'}
              </div>
            )}

            {/* Dropoff */}
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 rounded-sm bg-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-1.5 h-1.5 bg-black rounded-sm" />
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-bold">
                  Dropoff Destination:
                </span>
                <div className="font-semibold text-white">{ride.dropoff.address}</div>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-800 text-center text-xs">
            <div className="bg-neutral-900 p-2 rounded-xl">
              <span className="text-neutral-500 text-[10px] block">Distance</span>
              <span className="font-bold text-white">{ride.distanceKm} km</span>
            </div>
            <div className="bg-neutral-900 p-2 rounded-xl">
              <span className="text-neutral-500 text-[10px] block">Trip Time</span>
              <span className="font-bold text-white">{ride.durationMins} mins</span>
            </div>
            <div className="bg-neutral-900 p-2 rounded-xl">
              <span className="text-neutral-500 text-[10px] block">Customer</span>
              <span className="font-bold text-white truncate block">
                {ride.riderInfo?.riderName || ride.customerName}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-5 bg-neutral-900 border-t border-neutral-800 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onDecline(ride.rideId)}
            className="py-3 px-4 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs flex items-center justify-center space-x-1.5 transition"
          >
            <X className="w-4 h-4 text-red-500" />
            <span>Decline</span>
          </button>

          <button
            type="button"
            onClick={() => onAccept(ride.rideId)}
            className="py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-sm flex items-center justify-center space-x-2 transition shadow-lg active:scale-95"
          >
            <Check className="w-5 h-5 text-black stroke-[3]" />
            <span>ACCEPT RIDE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
