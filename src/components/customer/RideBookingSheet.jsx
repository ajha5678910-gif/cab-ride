import React, { useState } from 'react';
import { dbService } from '../../services/db';
import { calculateAllCategoryFares } from '../../services/pricingService';
import { PromoOffersModal } from './PromoOffersModal';
import { 
  Bike, 
  CarFront, 
  Car, 
  ShieldCheck, 
  Truck, 
  Leaf, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Sparkles, 
  ArrowRight, 
  X, 
  Clock, 
  Users,
  Tag,
  Crown,
  Percent,
  Check
} from 'lucide-react';

export const RideBookingSheet = ({
  distanceKm = 5,
  durationMins = 15,
  stopCount = 0,
  pickup,
  dropoff,
  currentUser = null,
  onConfirmBooking,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('Uber Go');
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // 'Cash' | 'UPI' | 'Uber Cash'
  const [surgeMultiplier] = useState(() => {
    try {
      return dbService.getPlatformConfig()?.globalSurgeMultiplier || 1.0;
    } catch {
      return 1.0;
    }
  });
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [showPromoModal, setShowPromoModal] = useState(false);

  const isUberOneMember = currentUser?.uberOneSubscription?.isActive;

  const categories = calculateAllCategoryFares(
    distanceKm, 
    durationMins, 
    stopCount, 
    surgeMultiplier, 
    appliedPromo, 
    isUberOneMember
  );
  const activeTier = categories.find((c) => c.id === selectedCategory) || categories[2];

  const getVehicleIcon = (iconName) => {
    switch (iconName) {
      case 'Bike': return <Bike className="w-5 h-5 text-amber-500" />;
      case 'CarFront': return <CarFront className="w-5 h-5 text-emerald-600" />;
      case 'Car': return <Car className="w-5 h-5 text-black" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-amber-600" />;
      case 'Truck': return <Truck className="w-5 h-5 text-blue-600" />;
      case 'Leaf': return <Leaf className="w-5 h-5 text-emerald-500" />;
      default: return <Car className="w-5 h-5 text-black" />;
    }
  };

  const handleBookClick = () => {
    onConfirmBooking({
      category: activeTier.id,
      upfrontFare: activeTier.fare,
      originalFare: activeTier.originalFare,
      isUberOneApplied: Boolean(isUberOneMember),
      uberOneDiscountAmount: activeTier.uberOneDiscountAmount || 0,
      appliedPromo: appliedPromo || null,
      paymentMethod,
      surgeMultiplier: activeTier.surgeMultiplier,
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-uber-lg border border-neutral-200 overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-4 duration-200">
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-uber-blue flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-uber-blue mr-0.5" />
            <span>Choose a Ride</span>
          </span>
          <h2 className="text-base sm:text-lg font-bold text-neutral-900">
            Available Vehicle Fleets
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          {surgeMultiplier > 1.0 && (
            <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold border bg-amber-100 border-amber-300 text-amber-900 flex items-center space-x-1 shadow-sm">
              <span>⚡ High Demand ({surgeMultiplier}x)</span>
            </span>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-full text-neutral-400 hover:text-black hover:bg-neutral-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Source (Pickup) & Destination (Dropoff) Route Summary Bar */}
      <div className="px-4 py-3 bg-neutral-50/90 border-b border-neutral-200">
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex flex-col items-center shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 ring-2 ring-emerald-100" />
            <div className="w-0.5 h-4 bg-neutral-300 my-0.5" />
            <div className="w-2.5 h-2.5 rounded-sm bg-black" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="truncate text-neutral-800">
              <span className="text-[10px] text-emerald-700 font-black uppercase mr-1.5">Source:</span>
              <span className="font-semibold text-neutral-900">{pickup?.address || 'Current Location'}</span>
            </div>
            <div className="truncate text-neutral-800">
              <span className="text-[10px] text-neutral-700 font-black uppercase mr-1.5">Destination:</span>
              <span className="font-semibold text-neutral-900">{dropoff?.address || 'Selected Destination'}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] font-bold text-neutral-500 uppercase">{distanceKm} KM • {durationMins} MINS</div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-[11px] font-bold text-uber-blue hover:underline cursor-pointer"
              >
                Change Route
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Uber One VIP Banner (If active) */}
      {isUberOneMember && (
        <div className="bg-gradient-to-r from-amber-500/15 to-yellow-500/15 border-b border-amber-300/50 px-4 py-2 flex items-center justify-between text-xs text-amber-950 font-bold">
          <div className="flex items-center space-x-1.5">
            <Crown className="w-4 h-4 fill-amber-500 text-amber-600" />
            <span>Uber One Gold VIP: Extra 10% Member Discount Applied</span>
          </div>
          <span className="text-[10px] bg-amber-400 text-black px-2 py-0.5 rounded-full font-black">
            SAVING 10%
          </span>
        </div>
      )}

      {/* Apply Promo Code / Offers Quick Bar */}
      <div className="px-4 py-2.5 bg-neutral-50/80 border-b border-neutral-200 flex items-center justify-between text-xs">
        {appliedPromo ? (
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-100 text-emerald-800 font-mono font-bold px-2 py-0.5 rounded-lg flex items-center space-x-1">
              <Tag className="w-3 h-3 text-emerald-600" />
              <span>{appliedPromo.code}</span>
            </span>
            <span className="text-emerald-700 font-semibold">
              (₹{appliedPromo.discountAmount} saved)
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-1.5 text-neutral-600 font-semibold">
            <Tag className="w-3.5 h-3.5 text-neutral-500" />
            <span>Have a promo coupon?</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowPromoModal(true)}
          className={`font-bold transition ${
            appliedPromo
              ? 'text-neutral-500 hover:text-black underline text-[11px]'
              : 'text-uber-blue hover:text-blue-700 underline text-xs'
          }`}
        >
          {appliedPromo ? 'Change Coupon' : 'Apply Promo / Offers ↗'}
        </button>
      </div>

      {/* Category List */}
      <div className="p-3 sm:p-4 space-y-2 overflow-y-auto max-h-[320px]">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <div
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`p-3.5 rounded-2xl cursor-pointer border transition flex items-center justify-between ${
                isSelected
                  ? 'border-black bg-neutral-50 shadow-md ring-2 ring-black/10'
                  : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <div className="p-2.5 bg-white border border-neutral-200 rounded-xl shadow-sm flex items-center justify-center">
                  {getVehicleIcon(cat.icon)}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-neutral-900">{cat.name}</span>
                    <span className="text-[11px] text-neutral-500 flex items-center space-x-0.5">
                      <Users className="w-3 h-3 text-neutral-400" />
                      <span>{cat.capacity}</span>
                    </span>
                  </div>

                  <div className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                    {cat.tagline}
                  </div>

                  <div className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1 mt-0.5">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    <span>{cat.etaText}</span>
                  </div>
                </div>
              </div>

              {/* Price with Strikethrough for Discounts */}
              <div className="text-right pl-3">
                {cat.isDiscounted && (
                  <div className="text-xs text-neutral-400 line-through font-semibold">
                    ₹{cat.originalFare}
                  </div>
                )}
                <div className="text-base sm:text-lg font-black text-neutral-900">
                  ₹{cat.fare}
                </div>
                {cat.isDiscounted ? (
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded-full">
                    Save ₹{cat.discountAmount}
                  </span>
                ) : cat.surgeMultiplier > 1.0 ? (
                  <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1 py-0.2 rounded">
                    Surge active
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Method Selector & Book Button */}
      <div className="p-4 bg-neutral-50 border-t border-neutral-200 space-y-3">
        {/* Payment selector */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-500 font-semibold">Payment Option:</span>
          <div className="flex bg-neutral-200/80 p-0.5 rounded-xl font-bold text-[11px]">
            <button
              type="button"
              onClick={() => setPaymentMethod('Cash')}
              className={`px-3 py-1 rounded-lg transition flex items-center space-x-1 ${
                paymentMethod === 'Cash' ? 'bg-white text-black shadow-sm' : 'text-neutral-600'
              }`}
            >
              <Banknote className="w-3 h-3 text-emerald-600" />
              <span>Cash</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('UPI')}
              className={`px-3 py-1 rounded-lg transition flex items-center space-x-1 ${
                paymentMethod === 'UPI' ? 'bg-white text-black shadow-sm' : 'text-neutral-600'
              }`}
            >
              <Smartphone className="w-3 h-3 text-uber-blue" />
              <span>UPI / QR</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('Uber Cash')}
              className={`px-3 py-1 rounded-lg transition flex items-center space-x-1 ${
                paymentMethod === 'Uber Cash' ? 'bg-white text-black shadow-sm' : 'text-neutral-600'
              }`}
            >
              <CreditCard className="w-3 h-3 text-black" />
              <span>Uber Cash</span>
            </button>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleBookClick}
          className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-extrabold rounded-2xl text-sm transition shadow-lg flex items-center justify-center space-x-2"
        >
          <span>Request {activeTier.name} • ₹{activeTier.fare}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Promo Offers Modal */}
      {showPromoModal && (
        <PromoOffersModal
          selectedCategory={activeTier.id}
          currentFare={activeTier.originalFare || activeTier.fare}
          appliedPromo={appliedPromo}
          onApplyPromo={(p) => setAppliedPromo(p)}
          onRemovePromo={() => setAppliedPromo(null)}
          onClose={() => setShowPromoModal(false)}
        />
      )}
    </div>
  );
};
