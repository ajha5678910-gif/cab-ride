import React from 'react';
import { dbService } from '../../services/db';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  PhoneCall, 
  Clock, 
  Navigation,
  MapPin
} from 'lucide-react';

export const RideCheckModal = ({ ride, onDismiss }) => {
  if (!ride || !ride.rideCheckStatus?.anomalyDetected) return null;

  const handleImFine = () => {
    dbService.respondRideCheck(ride.rideId, 'im_ok');
    if (onDismiss) onDismiss();
  };

  const handleNeedHelp = () => {
    dbService.respondRideCheck(ride.rideId, 'need_help');
    if (onDismiss) onDismiss();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border-2 border-amber-400 p-6 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Pulsing Alert Header */}
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-600 flex items-center justify-center flex-shrink-0 animate-bounce">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              Uber RideCheck™ Anomaly Alert
            </span>
            <h2 className="text-base font-extrabold text-neutral-900 mt-1">
              Everything OK with your trip?
            </h2>
          </div>
        </div>

        <p className="text-xs text-neutral-600 leading-relaxed">
          We noticed this trip has been stopped unexpectedly for longer than usual or diverted from the optimal route. Are you and your driver safe?
        </p>

        {/* Location & Vehicle Snapshot */}
        <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-neutral-500 font-medium">Distressed Vehicle:</span>
            <span className="font-mono font-bold text-neutral-900">
              {ride.vehicleDetails?.plateNumber || 'DL 01 AB 1234'} ({ride.vehicleDetails?.makeModel || 'Sedan'})
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-500 font-medium">Driver:</span>
            <span className="font-bold text-neutral-900">{ride.driverName || 'Partner'}</span>
          </div>
          <div className="flex items-center space-x-1.5 text-neutral-600 pt-1 border-t border-neutral-200">
            <MapPin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span className="truncate">Near {ride.currentDriverPosition?.address || ride.pickup?.address}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {/* I'm Fine */}
          <button
            type="button"
            onClick={handleImFine}
            className="w-full py-3.5 bg-neutral-900 hover:bg-black text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 transition shadow"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Yes, Everything is Fine</span>
          </button>

          {/* Need Help Escalation */}
          <button
            type="button"
            onClick={handleNeedHelp}
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-red-600/30"
          >
            <ShieldAlert className="w-4 h-4 text-white animate-pulse" />
            <span>No, I Need Emergency Assistance (SOS)</span>
          </button>
        </div>

        <div className="text-[10px] text-center text-neutral-400">
          Choosing "Need Assistance" immediately notifies 112 dispatchers & Uber Safety Team.
        </div>
      </div>
    </div>
  );
};
