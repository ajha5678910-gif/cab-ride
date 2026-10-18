import React, { useState } from 'react';
import { dbService } from '../../services/db';
import { Star, CheckCircle2, User, Sparkles } from 'lucide-react';

export const RateCustomerModal = ({ ride, onClose }) => {
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  if (!ride) return null;

  const handleSubmit = () => {
    dbService.submitDriverRating(ride.rideId, rating);
    setSubmitted(true);
    setTimeout(() => {
      if (onClose) onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center space-y-4">
        {submitted ? (
          <div className="space-y-2 py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-base font-bold text-neutral-900">Rating Submitted!</h3>
            <p className="text-xs text-neutral-500">Thank you for helping keep the Uber community respectful.</p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-800">
              <User className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-black text-neutral-900">
                Rate Rider: {ride.customerName || 'Passenger'}
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                How was your passenger during this trip?
              </p>
            </div>

            <div className="flex justify-center space-x-2 py-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="p-1 hover:scale-125 transition"
                >
                  <Star
                    className={`w-7 h-7 ${
                      s <= rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full py-3 bg-black hover:bg-neutral-800 text-white font-bold rounded-2xl text-xs shadow-lg transition"
            >
              Submit {rating}-Star Rider Rating
            </button>
          </>
        )}
      </div>
    </div>
  );
};
