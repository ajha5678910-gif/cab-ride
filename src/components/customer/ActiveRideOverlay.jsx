import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import confetti from 'canvas-confetti';
import { 
  Radio, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Phone, 
  Star, 
  ShieldCheck, 
  MapPin, 
  Sparkles, 
  AlertTriangle, 
  Navigation, 
  RotateCcw, 
  KeyRound, 
  ShieldAlert, 
  Check,
  MessageSquare,
  Share2,
  Users
} from 'lucide-react';

export const ActiveRideOverlay = ({ 
  ride, 
  onDismiss, 
  onTriggerSOS,
  onOpenChat,
  onOpenCall,
  onOpenSafetyToolkit,
  onTriggerRideCheck,
  onOpenSplitFare,
  onOpenRatingModal,
  driverEnRouteStats
}) => {
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('Changed my mind');
  const [userRating, setUserRating] = useState(5);
  const [rated, setRated] = useState(false);

  // Trigger confetti upon trip completion
  useEffect(() => {
    if (ride?.status === 'completed') {
      try {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      } catch {}
    }
  }, [ride?.status]);

  if (!ride) return null;

  const unreadChatCount = (ride?.chatMessages || []).filter(
    (m) => m.senderRole !== 'customer' && !m.isRead
  ).length;

  const handleConfirmCancel = () => {
    dbService.cancelRide(ride.rideId, cancelReason, 'customer');
    setCancelling(false);
  };

  const cancelPresets = [
    'Driver asked to cancel',
    'Wait time is too long',
    'Changed destination or plans',
    'Selected wrong vehicle category',
  ];

  return (
    <div className="bg-white rounded-3xl shadow-uber-lg border border-neutral-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-200 transition-all">
      {/* 1. STATE: SEARCHING FOR NEARBY DRIVERS */}
      {ride.status === 'searching' && (
        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center">
                <Radio className="w-7 h-7 animate-spin text-uber-blue" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-uber-blue opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-uber-blue" />
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-uber-blue">
                Live Dispatch Radar Active
              </span>
              <h2 className="text-lg font-bold text-neutral-900">
                Finding your {ride.category} ride...
              </h2>
              <p className="text-xs text-neutral-500">
                Contacting nearby drivers around {ride.pickup.address.slice(0, 30)}...
              </p>
            </div>
          </div>

          {/* Production Dispatch Status Card */}
          <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-800 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Matching with Top-Rated Driver</span>
              </span>
              <span className="text-[10px] font-mono text-neutral-400">ETA: ~2-4 mins</span>
            </div>
            <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-black h-full rounded-full animate-pulse w-2/3" />
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Your request is dispatched to verified drivers in the Connaught Place corridor. Once a driver accepts, live GPS tracking and vehicle details will appear immediately.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
            <div className="text-neutral-500">
              Upfront: <strong>₹{ride.upfrontFare}</strong> ({ride.paymentMethod})
            </div>
            <button
              type="button"
              onClick={() => dbService.cancelRide(ride.rideId, 'Customer cancelled search', 'customer')}
              className="text-red-600 hover:underline font-semibold"
            >
              Cancel Request
            </button>
          </div>
        </div>
      )}

      {/* 2. STATE: ACCEPTED & ARRIVED (DRIVER ON THE WAY / AT PICKUP) */}
      {(ride.status === 'accepted' || ride.status === 'arrived') && (
        <div className="p-6 space-y-5">
          {/* Prominent 4-Digit PIN Banner */}
          <div className="bg-neutral-950 text-white p-4 rounded-2xl border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 border border-amber-400/30 flex items-center justify-center font-bold">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Your 4-Digit Ride PIN
                </div>
                <div className="text-xs text-neutral-300">
                  Share with driver to start ride
                </div>
              </div>
            </div>

            <div className="bg-amber-400 text-black px-4 py-1.5 rounded-xl font-mono text-xl font-black tracking-widest shadow-md">
              {ride.verificationPin}
            </div>
          </div>

          {/* Status Alert Banner */}
          <div className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center space-x-2.5 ${
            ride.status === 'arrived'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 ring-2 ring-emerald-400/20'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}>
            {ride.status === 'arrived' ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 animate-bounce" />
                <div>
                  <div className="font-bold">Driver Has Arrived at Pickup!</div>
                  <div className="text-[11px] opacity-80">Meet driver & provide your PIN {ride.verificationPin}</div>
                </div>
              </>
            ) : (
              <>
                <Radio className="w-5 h-5 text-uber-blue flex-shrink-0 animate-pulse" />
                <div>
                  <div className="font-bold flex items-center space-x-2">
                    <span>Driver Partner is on the way</span>
                    <span className="bg-blue-600 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider">Live</span>
                  </div>
                  <div className="text-[11px] opacity-90 font-medium text-blue-950">
                    Arriving in {driverEnRouteStats?.durationMins ?? Math.max(1, Math.round((driverEnRouteStats?.distanceKm || 1) * 3))} mins ({driverEnRouteStats?.distanceKm || '1.0'} km away)
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Driver Card */}
          <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={ride.driverPhotoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'}
                  alt={ride.driverName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';
                  }}
                />
                <div>
                  <div className="font-bold text-neutral-900 text-sm flex items-center space-x-1.5">
                    <span>{ride.driverName}</span>
                    <span className="flex items-center text-amber-500 text-xs">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                      {ride.driverRating}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-500">
                    {ride.vehicleDetails?.makeModel} • {ride.vehicleDetails?.color}
                  </div>
                </div>
              </div>

              {/* Bold License Plate Badge */}
              <div className="bg-black text-white px-3 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider shadow">
                {ride.vehicleDetails?.plateNumber}
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-600">
              <div className="flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-neutral-400" />
                <span>{ride.driverPhone}</span>
              </div>
              <div className="font-semibold text-neutral-900">
                Fare: ₹{ride.upfrontFare} ({ride.paymentMethod})
              </div>
            </div>
          </div>

          {/* In-Trip Safety & Communication Action Bar */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <button
              type="button"
              onClick={onOpenChat}
              className="relative py-2.5 px-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold rounded-2xl text-[11px] flex flex-col items-center justify-center space-y-1 transition border border-neutral-200 shadow-sm"
            >
              <MessageSquare className="w-4 h-4 text-neutral-700" />
              <span>Chat</span>
              {unreadChatCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center">
                  {unreadChatCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenCall}
              className="py-2.5 px-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold rounded-2xl text-[11px] flex flex-col items-center justify-center space-y-1 transition border border-neutral-200 shadow-sm"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Masked Call</span>
            </button>

            <button
              type="button"
              onClick={onOpenSafetyToolkit}
              className="py-2.5 px-2 bg-blue-50 hover:bg-blue-100 text-uber-blue font-bold rounded-2xl text-[11px] flex flex-col items-center justify-center space-y-1 transition border border-blue-200 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-uber-blue" />
              <span>Safety Toolkit</span>
            </button>

            <button
              type="button"
              onClick={onTriggerRideCheck}
              className="py-2.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-2xl text-[11px] flex flex-col items-center justify-center space-y-1 transition border border-amber-200 shadow-sm"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>RideCheck</span>
            </button>
          </div>

          {/* Split Fare Banner */}
          <button
            type="button"
            onClick={onOpenSplitFare}
            className="w-full py-2.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold rounded-2xl text-xs flex items-center justify-between transition border border-purple-200 shadow-sm"
          >
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span>Split Fare with Friends</span>
            </div>
            <span className="text-[10px] bg-purple-200/80 text-purple-900 px-2 py-0.5 rounded-full font-extrabold">
              {ride.splitFareDetails?.isSplit ? `Split (${ride.splitFareDetails.participants?.length + 1} ways)` : 'Divide ₹'}
            </span>
          </button>

          {/* Safety Advisory & Cancellation */}
          <div className="pt-2 flex flex-col space-y-3">
            <div className="bg-neutral-100 rounded-xl px-3 py-2 text-[11px] text-neutral-600 flex items-center space-x-2 border border-neutral-200">
              <ShieldCheck className="w-3.5 h-3.5 text-uber-blue flex-shrink-0" />
              <span>Verify vehicle license plate <strong>{ride.vehicleDetails?.plateNumber}</strong> before boarding.</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setCancelling(true)}
                className="text-xs font-semibold text-red-600 hover:text-red-700 transition cursor-pointer"
              >
                Cancel Ride
              </button>

              <span className="text-[11px] text-neutral-500">
                Pickup PIN: <strong className="font-mono text-neutral-900 bg-neutral-200 px-1.5 py-0.5 rounded text-xs">{ride.verificationPin}</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. STATE: IN_PROGRESS (ON TRIP TO DESTINATION) */}
      {ride.status === 'in_progress' && (
        <div className="p-6 space-y-5">
          <div className="bg-emerald-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-3">
              <Navigation className="w-6 h-6 animate-pulse" />
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                  Trip In Progress
                </div>
                <div className="text-sm font-extrabold">
                  Heading to {ride.dropoff.address.slice(0, 28)}...
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg font-black">{ride.durationMins} mins</div>
              <div className="text-[10px] opacity-80">{ride.distanceKm} km</div>
            </div>
          </div>

          {/* Stops Checkoff Status */}
          {ride.stops && ride.stops.length > 0 && (
            <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200 space-y-1.5">
              <div className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider">
                Intermediate Waypoints:
              </div>
              {ride.stops.map((stop, idx) => (
                <div key={stop.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      stop.completed ? 'bg-emerald-500 text-white' : 'bg-neutral-300 text-neutral-700'
                    }`}>
                      {stop.completed ? <Check className="w-2.5 h-2.5" /> : idx + 1}
                    </span>
                    <span className={`truncate max-w-[220px] ${stop.completed ? 'line-through text-neutral-400' : 'text-neutral-800'}`}>
                      {stop.address}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold ${stop.completed ? 'text-emerald-600' : 'text-neutral-500'}`}>
                    {stop.completed ? 'Completed' : 'Upcoming'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Driver & Trip Info */}
          <div className="flex items-center justify-between text-xs bg-neutral-50 p-3 rounded-2xl border border-neutral-200">
            <div>
              <div className="font-bold text-neutral-900">{ride.driverName}</div>
              <div className="text-[11px] text-neutral-500">{ride.vehicleDetails?.makeModel} • {ride.vehicleDetails?.plateNumber}</div>
            </div>
            <div className="text-right">
              <div className="font-black text-neutral-900 text-sm">₹{ride.upfrontFare}</div>
              <div className="text-[10px] text-neutral-500">{ride.paymentMethod}</div>
            </div>
          </div>

          {/* In-Trip Safety & Communication Action Bar */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <button
              type="button"
              onClick={onOpenChat}
              className="relative py-2.5 px-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold rounded-2xl text-[11px] flex flex-col items-center justify-center space-y-1 transition border border-neutral-200 shadow-sm"
            >
              <MessageSquare className="w-4 h-4 text-neutral-700" />
              <span>Chat</span>
              {unreadChatCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center">
                  {unreadChatCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenCall}
              className="py-2.5 px-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold rounded-2xl text-[11px] flex flex-col items-center justify-center space-y-1 transition border border-neutral-200 shadow-sm"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Masked Call</span>
            </button>

            <button
              type="button"
              onClick={onOpenSafetyToolkit}
              className="py-2.5 px-2 bg-blue-50 hover:bg-blue-100 text-uber-blue font-bold rounded-2xl text-[11px] flex flex-col items-center justify-center space-y-1 transition border border-blue-200 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-uber-blue" />
              <span>Safety Toolkit</span>
            </button>

            <button
              type="button"
              onClick={onTriggerRideCheck}
              className="py-2.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-2xl text-[11px] flex flex-col items-center justify-center space-y-1 transition border border-amber-200 shadow-sm"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>RideCheck</span>
            </button>
          </div>

          {/* Split Fare Banner */}
          <button
            type="button"
            onClick={onOpenSplitFare}
            className="w-full py-2.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold rounded-2xl text-xs flex items-center justify-between transition border border-purple-200 shadow-sm"
          >
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span>Split Fare with Friends</span>
            </div>
            <span className="text-[10px] bg-purple-200/80 text-purple-900 px-2 py-0.5 rounded-full font-extrabold">
              {ride.splitFareDetails?.isSplit ? `Split (${ride.splitFareDetails.participants?.length + 1} ways)` : 'Divide ₹'}
            </span>
          </button>

          <div className="flex items-center justify-between pt-1 text-[11px] text-neutral-500">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live GPS & 24x7 Safety Monitored</span>
            </span>
            <button
              type="button"
              onClick={onTriggerSOS}
              className="text-red-600 hover:underline font-bold"
            >
              Emergency SOS (112)
            </button>
          </div>
        </div>
      )}

      {/* 4. STATE: COMPLETED TRIP RECEIPT */}
      {ride.status === 'completed' && (
        <div className="p-6 space-y-5 animate-in zoom-in-95 duration-200">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900">You have arrived!</h2>
            <p className="text-xs text-neutral-500">Hope you had a safe and comfortable ride.</p>
          </div>

          {/* Receipt Card */}
          <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500">Total Distance</span>
              <span className="font-bold text-neutral-900">{ride.distanceKm} km</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500">Ride Duration</span>
              <span className="font-bold text-neutral-900">{ride.durationMins} mins</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500">Payment Settled</span>
              <span className="font-bold text-neutral-900">{ride.paymentMethod}</span>
            </div>
            <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
              <span className="font-bold text-sm text-neutral-900">Total Fare:</span>
              <span className="text-xl font-black text-neutral-900">₹{ride.upfrontFare}</span>
            </div>
          </div>

          {/* Rate Driver */}
          <div className="text-center space-y-2">
            <span className="text-xs text-neutral-600">Rate your driver ({ride.driverName}):</span>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    setUserRating(star);
                    setRated(true);
                  }}
                  className="p-1 hover:scale-125 transition"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= userRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-neutral-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rated && (
              <span className="text-[11px] text-emerald-600 font-semibold block">
                Thank you for rating {userRating} stars!
              </span>
            )}
          </div>

          {/* Settle Payment, Tip & Full Rating Modal Button */}
          <button
            type="button"
            onClick={onOpenRatingModal}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg transition"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Settle Payment, Tip Driver & Review</span>
          </button>

          <button
            type="button"
            onClick={onDismiss}
            className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold rounded-2xl text-xs transition border border-neutral-300"
          >
            Book Another Ride
          </button>
        </div>
      )}

      {/* 5. STATE: CANCELLED */}
      {ride.status === 'cancelled' && (
        <div className="p-6 space-y-4 text-center">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-neutral-900">Ride Cancelled</h2>
          <p className="text-xs text-neutral-500">
            {ride.cancellationReason || 'The ride was cancelled.'}
          </p>

          <button
            type="button"
            onClick={onDismiss}
            className="w-full py-2.5 bg-black text-white font-bold rounded-xl text-xs"
          >
            Done
          </button>
        </div>
      )}

      {/* Cancellation Prompt Modal */}
      {cancelling && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-neutral-900">Cancel this ride?</h3>
            <p className="text-xs text-neutral-500">
              Please choose a reason for cancelling:
            </p>

            <div className="space-y-1.5">
              {cancelPresets.map((reason, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCancelReason(reason)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs transition border ${
                    cancelReason === reason
                      ? 'border-black bg-neutral-100 font-bold text-black'
                      : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setCancelling(false)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-black"
              >
                Keep Ride
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
