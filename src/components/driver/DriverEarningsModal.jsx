import React, { useState } from 'react';
import { dbService } from '../../services/db';
import confetti from 'canvas-confetti';
import { 
  DollarSign, 
  ArrowUpRight, 
  Building2, 
  Check, 
  X, 
  TrendingUp, 
  Heart, 
  ShieldCheck, 
  Clock, 
  Wallet,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const DriverEarningsModal = ({ currentDriver, onClose, onRefresh }) => {
  const [cashoutAmount, setCashoutAmount] = useState('');
  const [isCashoutProcessing, setIsCashoutProcessing] = useState(false);
  const [cashoutSuccess, setCashoutSuccess] = useState(false);

  if (!currentDriver) return null;

  const walletBalance = currentDriver.walletBalance || 0;
  const transactions = dbService.getWalletTransactions(currentDriver.uid);
  const allRides = dbService.getRides();
  const driverCompletedRides = allRides.filter(
    (r) => r.driverId === currentDriver.uid && r.status === 'completed'
  );

  const totalTips = driverCompletedRides.reduce(
    (sum, r) => sum + (r.fareBreakdown?.tipAmount || 0),
    0
  );

  const grossEarnings = driverCompletedRides.reduce(
    (sum, r) => sum + (r.fareBreakdown?.totalFare || r.upfrontFare || 0),
    0
  );

  const handleCashout = () => {
    const amt = Number(cashoutAmount || walletBalance);
    if (amt <= 0 || amt > walletBalance) {
      alert('Invalid withdrawal amount');
      return;
    }

    setIsCashoutProcessing(true);

    setTimeout(() => {
      try {
        dbService.withdrawDriverWallet(currentDriver.uid, amt, 'HDFC Bank •• 4912');
        setIsCashoutProcessing(false);
        setCashoutSuccess(true);
        if (onRefresh) onRefresh();

        try {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } catch {}

        setTimeout(() => {
          setCashoutSuccess(false);
          setCashoutAmount('');
        }, 2500);
      } catch (err) {
        setIsCashoutProcessing(false);
        alert(err.message || 'Withdrawal failed');
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-neutral-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-black text-white flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-black flex items-center justify-center shadow font-bold">
              <DollarSign className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold flex items-center space-x-2">
                <span>Driver Partner Earnings Hub</span>
              </h2>
              <div className="text-[11px] text-neutral-400">
                80% Fare Guarantee • 100% Tips Kept • Instant Payouts
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
          {cashoutSuccess ? (
            <div className="p-8 text-center space-y-3 bg-emerald-50 rounded-3xl border border-emerald-300 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg animate-bounce">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h3 className="text-lg font-black text-emerald-950">
                Cashout Processed via IMPS / UPI!
              </h3>
              <p className="text-xs text-emerald-800">
                ₹{cashoutAmount || walletBalance} has been transferred directly to your linked HDFC Bank account (•• 4912).
              </p>
            </div>
          ) : (
            <>
              {/* Wallet Payout Card */}
              <div className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-black text-white p-6 rounded-3xl border border-neutral-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Available Balance for Payout
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    Instant Bank Transfer
                  </span>
                </div>

                <div className="text-4xl font-black text-emerald-400">
                  ₹{walletBalance.toFixed(2)}
                </div>

                {/* Instant Cashout Button */}
                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                  <div className="text-[11px] text-neutral-400">
                    Linked Bank: <strong>HDFC Bank •• 4912</strong>
                  </div>
                  <button
                    type="button"
                    disabled={isCashoutProcessing || walletBalance <= 0}
                    onClick={handleCashout}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-extrabold rounded-xl text-xs flex items-center space-x-1.5 transition shadow"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>{isCashoutProcessing ? 'Transferring...' : 'Instant Cashout'}</span>
                  </button>
                </div>
              </div>

              {/* KPIs Grid */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 uppercase font-bold">Gross Bookings</span>
                  <div className="text-base font-black text-neutral-900 mt-0.5">₹{grossEarnings}</div>
                </div>

                <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 uppercase font-bold">Trips Done</span>
                  <div className="text-base font-black text-neutral-900 mt-0.5">{driverCompletedRides.length}</div>
                </div>

                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
                  <span className="text-[10px] text-amber-800 uppercase font-bold">100% Tips Kept</span>
                  <div className="text-base font-black text-amber-700 mt-0.5">₹{totalTips}</div>
                </div>
              </div>

              {/* Commission Structure Explanation */}
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2 text-xs">
                <div className="font-bold text-neutral-900 text-xs flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Uber Transparent Payout Ledger:</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-neutral-600 font-mono">
                  <div className="flex justify-between">
                    <span>Passenger Fare:</span>
                    <span>100% of Base + Distance + Time</span>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>Uber Platform Commission:</span>
                    <span>-20% (Insurance & Radar tech)</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Driver Net Ride Share:</span>
                    <span>80% Guaranteed Net</span>
                  </div>
                  <div className="flex justify-between text-amber-700 font-bold">
                    <span>Customer Gratitude Tips:</span>
                    <span>+100% (Zero platform cuts)</span>
                  </div>
                </div>
              </div>

              {/* Recent Trip Payouts Ledger */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-800">Recent Payout Ledger:</span>
                  <span className="text-[10px] text-neutral-500">{transactions.length} entries</span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {transactions.map((tx) => (
                    <div
                      key={tx.txId}
                      className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-neutral-900">{tx.description}</div>
                        <div className="text-[10px] text-neutral-400">
                          {new Date(tx.timestamp).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>

                      <div
                        className={`font-mono font-bold text-sm ${
                          tx.amount > 0 ? 'text-emerald-600' : 'text-neutral-900'
                        }`}
                      >
                        {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
