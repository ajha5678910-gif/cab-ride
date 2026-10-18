import React, { useState } from 'react';
import { dbService } from '../../services/db';
import confetti from 'canvas-confetti';
import { 
  Star, 
  CheckCircle2, 
  Heart, 
  DollarSign, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Wallet, 
  CreditCard, 
  Sparkles, 
  X,
  FileText
} from 'lucide-react';

export const PostRideRatingModal = ({
  ride,
  currentUser,
  onClose,
  onCompleted,
}) => {
  const [rating, setRating] = useState(5);
  const [selectedCompliments, setSelectedCompliments] = useState(['Clean Vehicle', 'Safe Driver']);
  const [selectedTip, setSelectedTip] = useState(50);
  const [customTip, setCustomTip] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(ride?.paymentMethod || 'Uber Cash');
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  if (!ride) return null;

  const fare = ride.fareBreakdown || {
    baseFare: Math.round((ride.upfrontFare || 150) * 0.25),
    distanceFare: Math.round((ride.upfrontFare || 150) * 0.55),
    timeFare: Math.round((ride.upfrontFare || 150) * 0.20),
    stopFees: (ride.stops?.length || 0) * 15,
    surgeMultiplier: 1.0,
    promoDiscount: 0,
    totalFare: ride.upfrontFare || 150,
  };

  const finalTip = customTip ? Number(customTip) : selectedTip;
  const finalTotalAmount = fare.totalFare + finalTip;

  const complimentsList = [
    '✨ Clean Vehicle',
    '🛡️ Safe Driver',
    '⭐ 5-Star Service',
    '🎵 Great Music',
    '💬 Polite Driving',
    '⚡ Quick Route',
  ];

  const tipOptions = [0, 20, 50, 100];

  const toggleCompliment = (item) => {
    if (selectedCompliments.includes(item)) {
      setSelectedCompliments(selectedCompliments.filter((c) => c !== item));
    } else {
      setSelectedCompliments([...selectedCompliments, item]);
    }
  };

  const handleSubmitRatingAndPayment = () => {
    setIsSubmitting(true);

    try {
      // 1. Process Payment & Tip
      dbService.processRidePayment(ride.rideId, {
        paymentMethod,
        tipAmount: finalTip,
      });

      // 2. Submit Rating & Compliments
      dbService.submitCustomerRating(ride.rideId, {
        rating,
        compliments: selectedCompliments,
      });

      // Trigger celebration confetti
      try {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } catch {}

      setIsSubmitting(false);
      setHasSubmitted(true);

      setTimeout(() => {
        if (onCompleted) onCompleted();
        if (onClose) onClose();
      }, 2000);
    } catch (err) {
      setIsSubmitting(false);
      alert(err.message || 'Error settling payment and rating');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-neutral-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold flex items-center space-x-2">
                <span>Trip Completed • Settle & Rate</span>
              </h2>
              <div className="text-[11px] text-neutral-400">
                Driver: <strong>{ride.driverName || 'Partner'}</strong> ({ride.vehicleDetails?.plateNumber || 'DL 01 AB 1234'})
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

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {hasSubmitted ? (
            <div className="p-8 text-center space-y-3 bg-emerald-50 rounded-3xl border border-emerald-300 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-emerald-950">Payment Settled & Rated!</h3>
              <p className="text-xs text-emerald-800">
                Thank you for riding with Uber. Driver partner {ride.driverName} has received your {rating}-star rating and ₹{finalTip} tip.
              </p>
            </div>
          ) : (
            <>
              {/* Detailed Invoice Summary Card */}
              <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                      Total Due:
                    </span>
                    <div className="text-2xl font-black text-neutral-900">
                      ₹{finalTotalAmount}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowInvoiceDetails(!showInvoiceDetails)}
                    className="text-xs font-bold text-neutral-600 hover:text-black flex items-center space-x-1"
                  >
                    <span>{showInvoiceDetails ? 'Hide Invoice Breakdown' : 'View Fare Breakdown'}</span>
                    {showInvoiceDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Expandable Breakdown */}
                {showInvoiceDetails && (
                  <div className="pt-2 border-t border-neutral-200 space-y-1.5 text-xs text-neutral-600 animate-in fade-in">
                    <div className="flex justify-between">
                      <span>Base Fare</span>
                      <span className="font-semibold text-neutral-900">₹{fare.baseFare}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Distance Fare ({ride.distanceKm || 5} km)</span>
                      <span className="font-semibold text-neutral-900">₹{fare.distanceFare}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time & Traffic ({ride.durationMins || 15} mins)</span>
                      <span className="font-semibold text-neutral-900">₹{fare.timeFare}</span>
                    </div>
                    {fare.stopFees > 0 && (
                      <div className="flex justify-between">
                        <span>Extra Stops Fee</span>
                        <span className="font-semibold text-neutral-900">₹{fare.stopFees}</span>
                      </div>
                    )}
                    {finalTip > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Driver Gratitude Tip (100% to Driver)</span>
                        <span>+₹{finalTip}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-700 block">
                  Select Payment Method:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Uber Cash', 'UPI / Card', 'Cash'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                        paymentMethod === m
                          ? 'border-black bg-black text-white shadow'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {m === 'Uber Cash' && <Wallet className="w-3.5 h-3.5" />}
                      {m === 'UPI / Card' && <CreditCard className="w-3.5 h-3.5" />}
                      {m === 'Cash' && <DollarSign className="w-3.5 h-3.5" />}
                      <span>{m}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Add a Tip for Driver */}
              <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-950 flex items-center space-x-1.5">
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    <span>Add a Tip for {ride.driverName || 'Driver'}:</span>
                  </span>
                  <span className="text-[10px] text-amber-800 font-medium">100% goes to driver</span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {tipOptions.map((tip) => (
                    <button
                      key={tip}
                      type="button"
                      onClick={() => {
                        setSelectedTip(tip);
                        setCustomTip('');
                      }}
                      className={`py-2 rounded-xl text-xs font-bold transition border ${
                        selectedTip === tip && !customTip
                          ? 'bg-amber-400 text-black border-amber-500 shadow'
                          : 'bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-100'
                      }`}
                    >
                      {tip === 0 ? 'No Tip' : `+₹${tip}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5-Star Rating Selector */}
              <div className="space-y-3 text-center pt-1">
                <span className="text-xs font-bold text-neutral-700 block">
                  Rate your trip with {ride.driverName}:
                </span>
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-125 transition"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-neutral-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className="text-xs font-bold text-neutral-800">
                  {rating === 5 && 'Outstanding & Professional Experience!'}
                  {rating === 4 && 'Good, Comfortable Ride.'}
                  {rating === 3 && 'Average Trip.'}
                  {rating <= 2 && 'Below Expectations.'}
                </div>
              </div>

              {/* Driver Compliment Badges */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-neutral-700 block text-center">
                  Add Compliments for Driver:
                </span>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {complimentsList.map((badge) => {
                    const isSelected = selectedCompliments.includes(badge);
                    return (
                      <button
                        key={badge}
                        type="button"
                        onClick={() => toggleCompliment(badge)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                          isSelected
                            ? 'bg-black text-white border-black font-bold shadow-sm'
                            : 'bg-neutral-100 text-neutral-700 border-neutral-200 hover:bg-neutral-200'
                        }`}
                      >
                        {badge}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitRatingAndPayment}
                className="w-full py-4 bg-black hover:bg-neutral-800 active:scale-95 text-white font-extrabold rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-2 transition shadow-xl mt-4"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Pay ₹{finalTotalAmount} & Submit {rating}-Star Review</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
