import React, { useState } from 'react';
import { calculateCourierFare, COURIER_PACKAGES } from '../../services/pricingService';
import { 
  Package, 
  MapPin, 
  User, 
  Phone, 
  ShieldCheck, 
  KeyRound, 
  ArrowRight, 
  AlertTriangle, 
  Check, 
  X 
} from 'lucide-react';

export const CourierBookingSheet = ({
  pickup,
  dropoff,
  distanceKm = 5,
  currentUser,
  onConfirmCourier,
  onClose,
}) => {
  // Sender details
  const [senderName, setSenderName] = useState(currentUser?.fullName || '');
  const [senderPhone, setSenderPhone] = useState(currentUser?.phone || '');

  // Receiver details
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');

  // Package category
  const [packageCategory, setPackageCategory] = useState('Documents');
  const [packageWeightKg, setPackageWeightKg] = useState(2);
  const [safetyChecked, setSafetyChecked] = useState(true);

  const categories = [
    { id: 'Documents', label: 'Documents / Files', icon: '📄' },
    { id: 'Food/Tiffin', label: 'Food / Tiffin', icon: '🍱' },
    { id: 'Keys/Electronics', label: 'Keys / Small Gadgets', icon: '🔑' },
    { id: 'Clothes/Box', label: 'Clothes / Box', icon: '📦' },
  ];

  const totalFare = calculateCourierFare(distanceKm, packageWeightKg);

  const handleBook = (e) => {
    e.preventDefault();
    if (!safetyChecked) return;

    onConfirmCourier({
      category: 'Uber Moto', // default for courier
      upfrontFare: totalFare,
      paymentMethod: 'Cash',
      courierDetails: {
        senderName,
        senderPhone,
        receiverName,
        receiverPhone,
        packageCategory,
        packageWeightKg,
      },
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-uber-lg border border-neutral-200 overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-4 duration-200">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-uber-blue flex items-center space-x-1">
            <Package className="w-3 h-3 text-uber-blue mr-0.5" />
            <span>Uber Connect</span>
          </span>
          <h2 className="text-base sm:text-lg font-bold text-neutral-900">
            Same-Day Parcel Delivery
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

      {/* Form Body */}
      <form onSubmit={handleBook} className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[420px]">
        {/* Dual PIN System Notice */}
        <div className="bg-amber-50 p-3 rounded-2xl border border-amber-300 space-y-1 text-xs">
          <div className="font-bold text-amber-900 flex items-center space-x-1.5">
            <KeyRound className="w-3.5 h-3.5 text-amber-700" />
            <span>Dual-PIN Security Guarantee:</span>
          </div>
          <p className="text-[11px] text-amber-800">
            • <strong>Pickup PIN:</strong> Sender gives to Driver when handing over package.<br />
            • <strong>Dropoff PIN:</strong> Recipient gives to Driver to release the package at destination.
          </p>
        </div>

        {/* Sender Info */}
        <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 space-y-2 text-xs">
          <div className="font-bold text-neutral-800 flex items-center space-x-1.5">
            <User className="w-3.5 h-3.5 text-emerald-600" />
            <span>1. Sender Details (Handover Point):</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              required
              placeholder="Sender Name"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs"
            />
            <input
              type="tel"
              required
              placeholder="Sender Mobile"
              value={senderPhone}
              onChange={(e) => setSenderPhone(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs"
            />
          </div>
        </div>

        {/* Receiver Info */}
        <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 space-y-2 text-xs">
          <div className="font-bold text-neutral-800 flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-black" />
            <span>2. Recipient Details (Delivery Dropoff):</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              required
              placeholder="Recipient Name"
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs"
            />
            <input
              type="tel"
              required
              placeholder="Recipient Mobile"
              value={receiverPhone}
              onChange={(e) => setReceiverPhone(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs"
            />
          </div>
        </div>

        {/* Package Category Chips */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
            Package Category:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((c) => {
              const isSelected = packageCategory === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setPackageCategory(c.id)}
                  className={`p-2 rounded-xl border text-left text-xs transition flex items-center space-x-2 ${
                    isSelected
                      ? 'border-black bg-neutral-900 text-white font-bold'
                      : 'border-neutral-200 bg-neutral-50 hover:bg-white text-neutral-800'
                  }`}
                >
                  <span className="text-base">{c.icon}</span>
                  <span className="truncate">{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Weight Slider */}
        <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-neutral-800">Package Weight:</span>
            <span className="font-black text-sm bg-black text-white px-2 py-0.5 rounded-lg">
              {packageWeightKg} kg
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="15"
            step="1"
            value={packageWeightKg}
            onChange={(e) => setPackageWeightKg(Number(e.target.value))}
            className="w-full accent-black cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-neutral-400">
            <span>1 kg</span>
            <span>Max 15 kg for Moto/Auto transport</span>
          </div>
        </div>

        {/* Safety Declaration Checkbox */}
        <label className="flex items-start space-x-2.5 text-xs text-neutral-600 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={safetyChecked}
            onChange={(e) => setSafetyChecked(e.target.checked)}
            className="mt-0.5 rounded border-neutral-300 text-black focus:ring-black"
          />
          <span className="text-[11px]">
            I confirm this parcel contains no illegal items, alcohol, cash, jewelry, or fragile hazardous materials.
          </span>
        </label>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!safetyChecked}
            className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-extrabold rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-2 transition shadow-lg active:scale-95 disabled:opacity-50"
          >
            <span>Send Parcel with Uber Connect • ₹{totalFare}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
