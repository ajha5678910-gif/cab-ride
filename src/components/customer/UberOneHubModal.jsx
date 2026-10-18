import React, { useState } from 'react';
import { dbService } from '../../services/db';
import confetti from 'canvas-confetti';
import { 
  Crown, 
  Sparkles, 
  Percent, 
  Check, 
  X, 
  ShieldCheck, 
  Zap, 
  CreditCard, 
  Calendar, 
  Clock, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

export const UberOneHubModal = ({ currentUser, onClose, onUpdated }) => {
  const [subscribing, setSubscribing] = useState(false);
  const [planType, setPlanType] = useState('monthly'); // 'monthly' | 'annual'
  const [successMsg, setSuccessMsg] = useState('');

  const config = dbService.getPlatformConfig();
  const monthlyPrice = config.uberOnePlan?.monthlyPrice || 149;
  const annualPrice = Math.round(monthlyPrice * 10); // 2 months free

  const isSubscribed = currentUser?.uberOneSubscription?.isActive;
  const totalSaved = currentUser?.uberOneSubscription?.totalSaved || 0;
  const expiresAt = currentUser?.uberOneSubscription?.expiresAt;

  const handleSubscribe = () => {
    setSubscribing(true);
    setTimeout(() => {
      const updated = dbService.subscribeUberOne(currentUser.uid, planType);
      setSubscribing(false);
      setSuccessMsg(`Welcome to Uber One! VIP Gold Perks & 10% Ride Discounts are now active.`);
      try {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      } catch {}
      if (onUpdated) onUpdated(updated);
    }, 600);
  };

  const handleCancelSubscription = () => {
    if (window.confirm('Are you sure you want to cancel your Uber One membership? You will lose the 10% discount on rides.')) {
      const updated = dbService.cancelUberOne(currentUser.uid);
      setSuccessMsg('Uber One membership cancelled.');
      if (onUpdated) onUpdated(updated);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-gradient-to-b from-neutral-900 to-black text-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-6 shadow-2xl border border-amber-500/40 relative overflow-hidden animate-in zoom-in-95">
        {/* Gold Ambient Flare */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-black flex items-center justify-center shadow-lg">
              <Crown className="w-6 h-6 fill-black" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
                Premium Membership
              </span>
              <h2 className="text-xl font-black text-white">Uber One</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1.5 rounded-full hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="bg-emerald-950/80 border border-emerald-500 text-emerald-300 p-3.5 rounded-2xl text-xs font-bold flex items-center space-x-2 animate-in zoom-in-95">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ACTIVE SUBSCRIBER STATE CARD */}
        {isSubscribed ? (
          <div className="bg-neutral-800/80 p-5 rounded-3xl border border-amber-500/50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="bg-amber-400 text-black text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                <Crown className="w-3 h-3 fill-black mr-0.5" />
                <span>Active Member</span>
              </span>
              <span className="text-xs text-neutral-400">
                Renews:{' '}
                {expiresAt
                  ? new Date(expiresAt).toLocaleDateString([], {
                      dateStyle: 'medium',
                    })
                  : 'Active'}
              </span>
            </div>

            <div className="bg-black/60 p-4 rounded-2xl border border-neutral-700 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400">
                  Total Saved with Uber One
                </span>
                <div className="text-2xl font-black text-amber-400">
                  ₹{Number(totalSaved).toFixed(2)}
                </div>
              </div>
              <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>

            <div className="space-y-2 text-xs text-neutral-300">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-amber-400" />
                <span>10% Member discount automatically applied on all rides</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-amber-400" />
                <span>Zero cancellation fees on trips</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-amber-400" />
                <span>Priority matching with top 5-star driver partners</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCancelSubscription}
              className="text-xs text-neutral-400 hover:text-red-400 transition underline pt-2 block text-center w-full"
            >
              Cancel Membership
            </button>
          </div>
        ) : (
          /* NON-MEMBER SUBSCRIPTION OFFERS */
          <div className="space-y-5">
            {/* Tagline */}
            <div>
              <p className="text-sm font-bold text-white">
                One membership for unlimited 10% ride savings and VIP priority dispatch.
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Pays for itself in just 1 to 2 rides every month.
              </p>
            </div>

            {/* Perks List */}
            <div className="bg-neutral-800/60 p-4 rounded-2xl border border-neutral-700 space-y-2.5 text-xs text-neutral-200">
              <div className="flex items-center space-x-2.5">
                <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Percent className="w-3.5 h-3.5 font-bold" />
                </div>
                <span><strong>10% Off Every Ride:</strong> Applied automatically on Moto, Auto, Go, Premier, Green, and XL.</span>
              </div>

              <div className="flex items-center space-x-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-400/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span><strong>₹0 Cancellation Guarantee:</strong> Change your mind with zero penalty fees.</span>
              </div>

              <div className="flex items-center space-x-2.5">
                <div className="w-6 h-6 rounded-lg bg-blue-400/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <span><strong>Priority Dispatch:</strong> Fast-track matching during high-demand rush hours.</span>
              </div>
            </div>

            {/* Plan Picker */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setPlanType('monthly')}
                className={`p-3.5 rounded-2xl border text-left transition ${
                  planType === 'monthly'
                    ? 'border-amber-400 bg-amber-500/10 text-white ring-2 ring-amber-400/40'
                    : 'border-neutral-700 bg-neutral-900 text-neutral-400 hover:border-neutral-600'
                }`}
              >
                <span className="font-bold block text-sm text-white">Monthly</span>
                <span className="text-amber-400 font-extrabold text-base">₹{monthlyPrice}</span>
                <span className="text-[10px] text-neutral-400 block">Billed monthly</span>
              </button>

              <button
                type="button"
                onClick={() => setPlanType('annual')}
                className={`p-3.5 rounded-2xl border text-left transition relative ${
                  planType === 'annual'
                    ? 'border-amber-400 bg-amber-500/10 text-white ring-2 ring-amber-400/40'
                    : 'border-neutral-700 bg-neutral-900 text-neutral-400 hover:border-neutral-600'
                }`}
              >
                <span className="absolute -top-2 right-2 bg-emerald-500 text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                  Save 17%
                </span>
                <span className="font-bold block text-sm text-white">Annual</span>
                <span className="text-amber-400 font-extrabold text-base">₹{annualPrice}</span>
                <span className="text-[10px] text-neutral-400 block">2 Months Free</span>
              </button>
            </div>

            {/* Join CTA */}
            <button
              type="button"
              onClick={handleSubscribe}
              disabled={subscribing}
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black rounded-2xl text-sm transition shadow-xl flex items-center justify-center space-x-2"
            >
              <Crown className="w-4 h-4 fill-black" />
              <span>
                {subscribing ? 'Activating VIP Membership...' : `Join Uber One • ₹${planType === 'annual' ? annualPrice : monthlyPrice}`}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
