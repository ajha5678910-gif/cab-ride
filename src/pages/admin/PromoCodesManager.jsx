import React, { useState, useEffect } from 'react';
import { dbService, INITIAL_PROMO_CODES } from '../../services/db';
import confetti from 'canvas-confetti';
import { 
  Tag, 
  Plus, 
  Trash2, 
  Power, 
  Percent, 
  Sparkles, 
  Search, 
  X, 
  CheckCircle2, 
  Check, 
  Car,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export const PromoCodesManager = () => {
  const [promoCodes, setPromoCodes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State for New Coupon
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage'); // 'percentage' | 'flat'
  const [discountValue, setDiscountValue] = useState(25);
  const [maxDiscount, setMaxDiscount] = useState(100);
  const [minRideAmount, setMinRideAmount] = useState(150);
  const [validCategory, setValidCategory] = useState('ALL');
  const [formError, setFormError] = useState('');

  const loadPromos = () => {
    setPromoCodes(dbService.getPromoCodes());
  };

  useEffect(() => {
    loadPromos();
    const unsubscribe = dbService.subscribe(() => {
      loadPromos();
    });
    return unsubscribe;
  }, []);

  const handleCreateCoupon = (e) => {
    e.preventDefault();
    setFormError('');

    if (!code.trim()) {
      setFormError('Please enter a coupon code (e.g. SAVE30)');
      return;
    }

    try {
      dbService.createPromoCode({
        code,
        discountType,
        discountValue,
        maxDiscount,
        minRideAmount,
        validCategory,
        isActive: true,
      });

      setShowCreateModal(false);
      setCode('');
      setDiscountValue(25);
      setMaxDiscount(100);
      setMinRideAmount(150);
      setValidCategory('ALL');
      loadPromos();

      try {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      } catch {}
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleToggleActive = (couponCode, currentStatus) => {
    dbService.togglePromoCode(couponCode, !currentStatus);
    loadPromos();
  };

  const handleDelete = (couponCode) => {
    if (window.confirm(`Delete coupon code ${couponCode}?`)) {
      dbService.deletePromoCode(couponCode);
      loadPromos();
    }
  };

  const filteredPromos = promoCodes.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.code.toLowerCase().includes(q) || p.validCategory.toLowerCase().includes(q);
  });

  return (
    <div className="bg-white rounded-3xl border border-neutral-200 shadow-uber-subtle p-6 space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-uber-blue flex items-center space-x-1">
            <Tag className="w-3.5 h-3.5 mr-1" />
            <span>Growth & Marketing Campaigns</span>
          </span>
          <h2 className="text-xl font-extrabold text-neutral-900 mt-1">
            Promo Codes & Discount Campaigns
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Create coupon codes with category restrictions, flat vs percentage discounts, and usage limits.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white font-extrabold rounded-2xl text-xs flex items-center space-x-1.5 transition shadow-lg self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Promo Code</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search promo codes (e.g. UBER50, FIRST100, Green)..."
          className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-black"
        />
      </div>

      {/* Promo Codes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPromos.map((promo) => (
          <div
            key={promo.code}
            className={`p-5 rounded-3xl border transition relative flex flex-col justify-between ${
              promo.isActive
                ? 'bg-neutral-50 border-neutral-200 hover:border-black shadow-sm'
                : 'bg-neutral-100/60 border-dashed border-neutral-300 opacity-60'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-black text-black tracking-wider bg-white px-2.5 py-1 rounded-xl border border-neutral-200 shadow-sm flex items-center space-x-1">
                  <Tag className="w-3.5 h-3.5 text-uber-blue" />
                  <span>{promo.code}</span>
                </span>

                <button
                  type="button"
                  onClick={() => handleToggleActive(promo.code, promo.isActive)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition flex items-center space-x-1 ${
                    promo.isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-neutral-200 text-neutral-600 border-neutral-300'
                  }`}
                >
                  <Power className="w-2.5 h-2.5" />
                  <span>{promo.isActive ? 'ACTIVE' : 'PAUSED'}</span>
                </button>
              </div>

              <div>
                <div className="text-xl font-extrabold text-neutral-900">
                  {promo.discountType === 'percentage'
                    ? `${promo.discountValue}% OFF`
                    : `₹${promo.discountValue} FLAT OFF`}
                </div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  Max Savings: <strong>₹{promo.maxDiscount}</strong> • Min Ride: <strong>₹{promo.minRideAmount}</strong>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-[11px] text-neutral-600 bg-white/70 p-2 rounded-xl border border-neutral-200">
                <Car className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                <span className="truncate">
                  Applicable to: <strong>{promo.validCategory}</strong>
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-200/80 flex items-center justify-between text-xs">
              <span className="text-[11px] text-neutral-500 font-semibold flex items-center space-x-1">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                <span>Used <strong>{promo.usageCount || 0} times</strong></span>
              </span>

              <button
                type="button"
                onClick={() => handleDelete(promo.code)}
                className="text-neutral-400 hover:text-red-600 p-1 rounded-lg transition"
                title="Delete Promo Code"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE NEW PROMO CODE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-neutral-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="font-extrabold text-base text-neutral-900 flex items-center space-x-2">
                <Tag className="w-4 h-4 text-uber-blue" />
                <span>Create New Promo Code</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-black p-1 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600 font-bold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Promo Code (Uppercase)</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. FESTIVE30, RUSH100"
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl font-mono font-bold focus:outline-none focus:border-black uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl font-bold focus:outline-none focus:border-black"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Cash (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">
                    {discountType === 'percentage' ? 'Percentage Value (%)' : 'Flat Value (₹)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={discountType === 'percentage' ? 90 : 1000}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl font-bold text-right focus:outline-none focus:border-black"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    min="10"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl font-bold text-right focus:outline-none focus:border-black"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Min Ride Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={minRideAmount}
                    onChange={(e) => setMinRideAmount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl font-bold text-right focus:outline-none focus:border-black"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Valid Vehicle Category</label>
                <select
                  value={validCategory}
                  onChange={(e) => setValidCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl font-bold focus:outline-none focus:border-black"
                >
                  <option value="ALL">ALL Categories</option>
                  <option value="Uber Moto">Uber Moto</option>
                  <option value="Uber Auto">Uber Auto</option>
                  <option value="Uber Go">Uber Go</option>
                  <option value="Uber Green">Uber Green (EV Only)</option>
                  <option value="Uber Premier">Uber Premier</option>
                  <option value="Uber XL">Uber XL</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold shadow-lg"
                >
                  Save & Activate Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
