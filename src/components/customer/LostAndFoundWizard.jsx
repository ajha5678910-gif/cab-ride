import React, { useState } from 'react';
import { dbService } from '../../services/db';
import { 
  HelpCircle, 
  X, 
  Check, 
  MapPin, 
  Car, 
  ShieldCheck, 
  Phone, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const LostAndFoundWizard = ({ ride, currentUser, onClose, onSubmitted }) => {
  const [itemCategory, setItemCategory] = useState('Phone/Electronics');
  const [description, setDescription] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!ride) return null;

  const categories = [
    'Phone/Electronics',
    'Wallet/Bag',
    'Keys',
    'Documents',
    'Clothing/Other',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    dbService.reportLostItem({
      rideId: ride.rideId,
      customerId: currentUser?.uid || ride.customerId,
      customerName: currentUser?.fullName || ride.customerName,
      customerPhone: currentUser?.phone || ride.customerPhone,
      driverId: ride.driverId,
      driverName: ride.driverName || 'Driver Partner',
      driverPhone: ride.driverPhone || '+91 98765 00000',
      vehiclePlate: ride.vehicleDetails?.plateNumber || 'DL 01 AA 1001',
      itemCategory,
      description: description.trim(),
      returnFee: 100,
    });

    setIsSubmitted(true);
    setTimeout(() => {
      if (onSubmitted) onSubmitted();
      if (onClose) onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-neutral-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-400 text-black flex items-center justify-center shadow font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold flex items-center space-x-2">
                <span>Lost & Found Support</span>
              </h2>
              <div className="text-[11px] text-neutral-400">
                Driver: <strong>{ride.driverName}</strong> ({ride.vehicleDetails?.plateNumber})
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
        <div className="p-5 overflow-y-auto space-y-4">
          {isSubmitted ? (
            <div className="p-8 text-center space-y-3 bg-emerald-50 rounded-3xl border border-emerald-300 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-emerald-950">
                Lost Item Report Dispatched!
              </h3>
              <p className="text-xs text-emerald-800">
                Driver partner {ride.driverName} and Uber Safety Support have been alerted. You will receive an SMS update once the driver confirms the item.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-700 block">
                  Select Item Category:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setItemCategory(cat)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition ${
                        itemCategory === cat
                          ? 'border-black bg-neutral-900 text-white font-bold'
                          : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 block">
                  Detailed Item Description:
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Left black leather wallet with ID cards in the rear door pocket."
                  className="w-full p-3 bg-neutral-50 border border-neutral-300 rounded-2xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Uber Policy & Compensation Fee Notice */}
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center space-x-1.5 text-amber-950">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Driver Return Compensation (₹100)</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  To compensate the driver for their fuel and driving time to return your item safely, a fixed ₹100 return fee will be credited to their earnings upon delivery.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!description.trim()}
                className="w-full py-3.5 bg-black hover:bg-neutral-800 disabled:opacity-40 text-white font-bold rounded-2xl text-xs transition shadow-xl"
              >
                Submit Lost Item Report
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
