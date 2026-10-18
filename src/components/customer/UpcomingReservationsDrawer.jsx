import React from 'react';
import { dbService } from '../../services/db';
import { 
  CalendarClock, 
  MapPin, 
  Play, 
  X, 
  Sparkles, 
  KeyRound, 
  Clock 
} from 'lucide-react';

export const UpcomingReservationsDrawer = ({
  scheduledRides = [],
  onStartRideNow,
  onCancelRide,
}) => {
  if (scheduledRides.length === 0) return null;

  return (
    <div className="bg-neutral-900 text-white rounded-3xl p-4 sm:p-5 border border-neutral-800 shadow-xl space-y-3 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CalendarClock className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-amber-400">
            Upcoming Reservations ({scheduledRides.length})
          </h3>
        </div>
        <span className="text-[10px] text-neutral-400">Locked Price Guaranteed</span>
      </div>

      <div className="space-y-2">
        {scheduledRides.map((ride) => (
          <div
            key={ride.rideId}
            className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 space-y-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>
                  {ride.reserveDetails?.scheduledPickupTime
                    ? new Date(ride.reserveDetails.scheduledPickupTime).toLocaleString([], {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })
                    : 'Scheduled Ride'}
                </span>
              </span>
              <span className="font-bold text-amber-400 text-sm">
                ₹{ride.upfrontFare}
              </span>
            </div>

            <div className="space-y-1 text-neutral-400 text-[11px]">
              <div className="truncate">
                <strong className="text-emerald-500">From:</strong> {ride.pickup.address}
              </div>
              <div className="truncate">
                <strong className="text-white">To:</strong> {ride.dropoff.address}
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between gap-2">
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                PIN: {ride.verificationPin}
              </span>

              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Confirmed
                </span>
                <button
                  type="button"
                  onClick={() => onCancelRide(ride.rideId)}
                  className="px-2.5 py-1 text-[11px] text-neutral-400 hover:text-red-400 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
