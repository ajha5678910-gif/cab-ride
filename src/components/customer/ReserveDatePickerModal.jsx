import React, { useState } from 'react';
import { UBER_RESERVE_FEE } from '../../services/pricingService';
import { 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Lock, 
  Hourglass, 
  Sparkles, 
  X, 
  ArrowRight 
} from 'lucide-react';

export const ReserveDatePickerModal = ({ onConfirmReservation, onClose }) => {
  // Default to tomorrow 10:00 AM
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [reserveDate, setReserveDate] = useState(defaultDateStr);
  const [reserveTime, setReserveTime] = useState('10:00');

  const handleConfirm = (e) => {
    e.preventDefault();
    const scheduledDateTime = `${reserveDate}T${reserveTime}:00.000Z`;
    onConfirmReservation({
      scheduledPickupTime: scheduledDateTime,
      reservationFee: UBER_RESERVE_FEE,
      formattedDate: `${reserveDate} at ${reserveTime}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-neutral-200 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-black text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-800 text-amber-400 border border-neutral-700 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Uber Reserve
              </span>
              <h2 className="text-lg font-bold">Schedule Your Ride</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleConfirm} className="p-6 space-y-5">
          {/* Reserve Benefits Checklist */}
          <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-2.5 text-xs">
            <div className="font-bold text-neutral-800 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Uber Reserve Guarantee:</span>
            </div>

            <div className="space-y-1.5 text-neutral-600">
              <div className="flex items-start space-x-2">
                <Lock className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>Price locked upfront — no unexpected surge pricing.</span>
              </div>
              <div className="flex items-start space-x-2">
                <ShieldCheck className="w-3.5 h-3.5 text-uber-blue mt-0.5 flex-shrink-0" />
                <span>Top-rated driver partner pre-assigned 30 mins before.</span>
              </div>
              <div className="flex items-start space-x-2">
                <Hourglass className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Includes 15 minutes of complimentary wait time at pickup.</span>
              </div>
            </div>
          </div>

          {/* Date & Time Pickers */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Pickup Date:
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={reserveDate}
                onChange={(e) => setReserveDate(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Pickup Time:
              </label>
              <input
                type="time"
                required
                value={reserveTime}
                onChange={(e) => setReserveTime(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>Lock Fee: ₹{UBER_RESERVE_FEE}</span>
            <span>Cancel free up to 60 mins before</span>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-extrabold rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-2 transition shadow-lg active:scale-95"
          >
            <span>Lock In Reservation for {reserveDate}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
