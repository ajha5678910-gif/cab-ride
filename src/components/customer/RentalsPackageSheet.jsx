import React, { useState } from 'react';
import { RENTAL_PACKAGES, RENTAL_EXTRA_RATES, calculateRentalFare } from '../../services/pricingService';
import { 
  Hourglass, 
  Car, 
  ShieldCheck, 
  Truck, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Sparkles, 
  Info, 
  X 
} from 'lucide-react';

export const RentalsPackageSheet = ({
  pickup,
  onConfirmRental,
  onClose,
}) => {
  const [selectedHours, setSelectedHours] = useState(2); // default 2 hrs
  const [selectedCategory, setSelectedCategory] = useState('Uber Go'); // 'Uber Go' | 'Uber Premier' | 'Uber XL'
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  const selectedPkg = RENTAL_PACKAGES.find((p) => p.hours === selectedHours) || RENTAL_PACKAGES[1];
  const totalFare = calculateRentalFare(selectedHours, selectedCategory);

  const vehicleOptions = [
    { id: 'Uber Go', name: 'Go Sedan', icon: Car, capacity: 4 },
    { id: 'Uber Premier', name: 'Premier AC', icon: ShieldCheck, capacity: 4 },
    { id: 'Uber XL', name: 'XL 6-Seater', icon: Truck, capacity: 6 },
  ];

  const handleBook = () => {
    onConfirmRental({
      category: selectedCategory,
      upfrontFare: totalFare,
      paymentMethod,
      rentalDetails: {
        packageHours: selectedPkg.hours,
        includedKm: selectedPkg.km,
        extraKmRate: RENTAL_EXTRA_RATES.extraKmRate,
        extraMinRate: RENTAL_EXTRA_RATES.extraMinRate,
      },
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-uber-lg border border-neutral-200 overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-4 duration-200">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-uber-blue flex items-center space-x-1">
            <Hourglass className="w-3 h-3 text-uber-blue mr-0.5" />
            <span>Uber Rentals</span>
          </span>
          <h2 className="text-base sm:text-lg font-bold text-neutral-900">
            Keep Car & Driver by the Hour
          </h2>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-black hover:bg-neutral-100"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[420px]">
        {/* Pickup Pin Display */}
        <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200 flex items-center space-x-2 text-xs text-neutral-800">
          <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="truncate">
            Pickup: <strong>{pickup?.address || 'Connaught Place, New Delhi'}</strong>
          </span>
        </div>

        {/* Hourly Packages Selector */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
            Select Duration Package:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {RENTAL_PACKAGES.map((pkg) => {
              const isSelected = selectedHours === pkg.hours;
              const price = calculateRentalFare(pkg.hours, selectedCategory);

              return (
                <button
                  key={pkg.hours}
                  type="button"
                  onClick={() => setSelectedHours(pkg.hours)}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    isSelected
                      ? 'border-black bg-black text-white shadow-md ring-2 ring-black/10'
                      : 'border-neutral-200 bg-neutral-50 hover:bg-white text-neutral-800'
                  }`}
                >
                  <div>
                    <div className="font-extrabold text-sm">
                      {pkg.hours} {pkg.hours === 1 ? 'Hour' : 'Hours'}
                    </div>
                    <div className={`text-[10px] ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      Includes {pkg.km} km
                    </div>
                  </div>
                  <div className="mt-2 font-black text-sm">
                    ₹{price}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Vehicle Category Selector */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
            Vehicle Fleet Type:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {vehicleOptions.map((v) => {
              const isSelected = selectedCategory === v.id;
              const Icon = v.icon;

              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedCategory(v.id)}
                  className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center justify-center ${
                    isSelected
                      ? 'border-black bg-neutral-900 text-white font-bold'
                      : 'border-neutral-200 bg-neutral-50 hover:bg-white text-neutral-700'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs">{v.name}</span>
                  <span className="text-[9px] opacity-75">{v.capacity} seats</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Flexible Multi-Stop Highlights */}
        <div className="p-3 bg-neutral-100/80 rounded-2xl border border-neutral-200 space-y-1 text-xs text-neutral-600">
          <div className="font-bold text-neutral-900 flex items-center space-x-1">
            <Info className="w-3.5 h-3.5 text-uber-blue" />
            <span>Rental Package Policies:</span>
          </div>
          <p className="text-[11px]">
            Make as many stops as you need. Additional usage beyond package limit billed at <strong>₹{RENTAL_EXTRA_RATES.extraKmRate}/km</strong> and <strong>₹{RENTAL_EXTRA_RATES.extraMinRate}/min</strong>.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-neutral-50 border-t border-neutral-200 space-y-3">
        <button
          type="button"
          onClick={handleBook}
          className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-extrabold rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-2 transition shadow-lg active:scale-95"
        >
          <span>Confirm {selectedHours} Hr Rental • ₹{totalFare}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
