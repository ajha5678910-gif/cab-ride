import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import { 
  Tag, 
  Percent, 
  Sparkles, 
  Check, 
  X, 
  ArrowRight, 
  AlertCircle, 
  Car,
  Clock
} from 'lucide-react';

export const PromoOffersModal = ({ 
  selectedCategory, 
  currentFare, 
  appliedPromo, 
  onApplyPromo, 
  onRemovePromo, 
  onClose 
}) => {
  const [promos, setPromos] = useState([]);
  const [customCode, setCustomCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setPromos(dbService.getPromoCodes().filter((p) => p.isActive));
  }, []);

  const handleApply = (promoItem) => {
    setErrorMessage('');
    const validation = dbService.validatePromoCode(promoItem.code, selectedCategory, currentFare);
    if (!validation.valid) {
      setErrorMessage(validation.error);
      return;
    }

    onApplyPromo({
      code: promoItem.code,
      discountType: promoItem.discountType,
      discountValue: promoItem.discountValue,
      discountAmount: validation.discountAmount,
      discountedFare: validation.discountedFare,
    });
    onClose();
  };

  const handleCustomApply = (e) => {
    e.preventDefault();
    if (!customCode.trim()) return;

    setErrorMessage('');
    const validation = dbService.validatePromoCode(customCode.trim(), selectedCategory, currentFare);
    if (!validation.valid) {
      setErrorMessage(validation.error);
      return;
    }

    onApplyPromo({
      code: validation.promo.code,
      discountType: validation.promo.discountType,
      discountValue: validation.promo.discountValue,
      discountAmount: validation.discountAmount,
      discountedFare: validation.discountedFare,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-neutral-200 animate-in zoom-in-95 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div className="flex items-center space-x-2">
            <Tag className="w-5 h-5 text-uber-blue" />
            <h3 className="font-extrabold text-base text-neutral-900">
              Apply Promo Code / Offers
            </h3>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-black p-1 rounded-full hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Custom Code Input Form */}
        <form onSubmit={handleCustomApply} className="flex items-center space-x-2">
          <input
            type="text"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
            placeholder="Enter coupon code (e.g. UBER50)"
            className="flex-1 px-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-2xl text-xs font-mono font-bold uppercase focus:border-black focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-2xl text-xs font-extrabold transition shadow"
          >
            Apply
          </button>
        </form>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600 font-bold flex items-center space-x-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Currently Applied Promo Banner */}
        {appliedPromo && (
          <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-2xl flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-emerald-900 flex items-center space-x-1">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Coupon Applied: <strong>{appliedPromo.code}</strong></span>
              </div>
              <div className="text-[11px] text-emerald-700">
                You are saving ₹{appliedPromo.discountAmount} on this ride!
              </div>
            </div>

            <button
              type="button"
              onClick={onRemovePromo}
              className="text-red-600 hover:text-red-700 font-bold text-xs underline"
            >
              Remove
            </button>
          </div>
        )}

        {/* Available Offers List */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
            Available Discount Coupons:
          </h4>

          <div className="space-y-2.5">
            {promos.map((promo) => {
              const isCurrent = appliedPromo?.code === promo.code;
              const isCategoryMatch = promo.validCategory === 'ALL' || promo.validCategory === selectedCategory;

              return (
                <div
                  key={promo.code}
                  className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-emerald-50/60 border-emerald-400 ring-1 ring-emerald-400'
                      : isCategoryMatch
                      ? 'bg-neutral-50 border-neutral-200 hover:border-black'
                      : 'bg-neutral-100/60 border-neutral-200 opacity-60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-black text-xs text-black bg-white px-2 py-0.5 rounded-lg border border-neutral-300 shadow-sm">
                        {promo.code}
                      </span>
                      <span className="text-xs font-black text-emerald-600">
                        {promo.discountType === 'percentage'
                          ? `${promo.discountValue}% OFF`
                          : `₹${promo.discountValue} FLAT OFF`}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-600">
                      Save up to ₹{promo.maxDiscount} • Min ride ₹{promo.minRideAmount}
                    </div>

                    {promo.validCategory !== 'ALL' && (
                      <div className="text-[10px] text-uber-blue font-semibold">
                        Valid on: {promo.validCategory}
                      </div>
                    )}
                  </div>

                  <div>
                    {isCurrent ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Applied</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleApply(promo)}
                        className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition shadow"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
