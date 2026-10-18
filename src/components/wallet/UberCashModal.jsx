import React, { useState } from 'react';
import { dbService } from '../../services/db';
import { 
  Wallet, 
  Plus, 
  X, 
  Check, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  QrCode, 
  Radio, 
  Sparkles, 
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const UberCashModal = ({ currentUser, onClose, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('balance'); // 'balance' | 'topup' | 'transactions'
  const [topupAmount, setTopupAmount] = useState(500);
  const [paymentGatewayMethod, setPaymentGatewayMethod] = useState('upi'); // 'upi' | 'card' | 'qr'
  const [upiId, setUpiId] = useState('john.customer@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!currentUser) return null;

  const walletBalance = currentUser.walletBalance || 0;
  const transactions = dbService.getWalletTransactions(currentUser.uid);

  const quickAmounts = [200, 500, 1000, 2000];

  const handleProcessPayment = () => {
    setIsProcessing(true);

    setTimeout(() => {
      try {
        dbService.topupCustomerWallet(
          currentUser.uid,
          topupAmount,
          paymentGatewayMethod === 'upi' ? `UPI (${upiId})` : paymentGatewayMethod === 'card' ? 'Visa •• 8821' : 'UPI QR'
        );
        setIsProcessing(false);
        setIsSuccess(true);
        if (onRefresh) onRefresh();

        setTimeout(() => {
          setIsSuccess(false);
          setActiveTab('balance');
        }, 2000);
      } catch (err) {
        setIsProcessing(false);
        alert(err.message || 'Payment processing failed');
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-neutral-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-uber-blue text-white flex items-center justify-center shadow">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold flex items-center space-x-2">
                <span>Uber Cash Wallet</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                  Zero Fees
                </span>
              </h2>
              <div className="text-[11px] text-neutral-400">
                Instant 1-click ride payments & auto-refunds
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

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 bg-neutral-100 border-b border-neutral-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('balance')}
            className={`py-3 transition border-b-2 ${
              activeTab === 'balance'
                ? 'border-black text-black bg-white font-bold'
                : 'border-transparent text-neutral-600 hover:text-black'
            }`}
          >
            Balance Overview
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('topup')}
            className={`py-3 transition border-b-2 flex items-center justify-center space-x-1 ${
              activeTab === 'topup'
                ? 'border-uber-blue text-uber-blue bg-white font-bold'
                : 'border-transparent text-neutral-600 hover:text-black'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Money</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            className={`py-3 transition border-b-2 ${
              activeTab === 'transactions'
                ? 'border-black text-black bg-white font-bold'
                : 'border-transparent text-neutral-600 hover:text-black'
            }`}
          >
            Activity Ledger ({transactions.length})
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* TAB 1: BALANCE OVERVIEW */}
          {activeTab === 'balance' && (
            <div className="space-y-5">
              {/* Wallet Card */}
              <div className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-black text-white p-6 rounded-3xl border border-neutral-800 shadow-xl space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Available Uber Cash
                  </span>
                  <span className="bg-neutral-800 text-neutral-300 px-2.5 py-0.5 rounded-full text-[10px] font-mono">
                    INR (₹)
                  </span>
                </div>

                <div>
                  <div className="text-4xl font-black text-white tracking-tight">
                    ₹{walletBalance.toFixed(2)}
                  </div>
                  <div className="text-xs text-emerald-400 font-semibold mt-1 flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Auto-applies at ride checkout for 100% instant payment</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                  <span className="text-xs text-neutral-400">Account: {currentUser.fullName}</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('topup')}
                    className="px-4 py-2 bg-uber-blue hover:bg-blue-600 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Funds</span>
                  </button>
                </div>
              </div>

              {/* Benefits Checklist */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-2 text-xs">
                <div className="font-bold text-neutral-900 text-xs">Why Use Uber Cash?</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-neutral-600">
                  <div className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>No OTP or bank redirect needed</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Instant split-fare credits</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Instant cancellations refunds</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>100% secure Razorpay/UPI gateway</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INSTANT TOP-UP GATEWAY (RAZORPAY / UPI) */}
          {activeTab === 'topup' && (
            <div className="space-y-4">
              {isSuccess ? (
                <div className="p-8 text-center space-y-3 bg-emerald-50 rounded-3xl border border-emerald-300 animate-in zoom-in-95">
                  <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg animate-bounce">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  <h3 className="text-lg font-extrabold text-emerald-950">
                    ₹{topupAmount} Added Successfully!
                  </h3>
                  <p className="text-xs text-emerald-800">
                    Your Uber Cash balance has been updated. You can now use it for rides.
                  </p>
                </div>
              ) : (
                <>
                  {/* Select Amount */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-700 block">
                      Select Top-Up Amount (₹):
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {quickAmounts.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setTopupAmount(amt)}
                          className={`py-3 rounded-2xl text-xs font-black transition border ${
                            topupAmount === amt
                              ? 'bg-black text-white border-black shadow'
                              : 'bg-neutral-50 text-neutral-800 border-neutral-200 hover:bg-neutral-100'
                          }`}
                        >
                          ₹{amt}
                        </button>
                      ))}
                    </div>

                    <div className="relative mt-2">
                      <span className="absolute left-3.5 top-2.5 text-sm font-bold text-neutral-500">₹</span>
                      <input
                        type="number"
                        value={topupAmount}
                        onChange={(e) => setTopupAmount(Number(e.target.value))}
                        className="w-full pl-8 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>

                  {/* Payment Gateway Method Selector */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-neutral-700 block">
                      Choose Payment Method:
                    </label>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentGatewayMethod('upi')}
                        className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition ${
                          paymentGatewayMethod === 'upi'
                            ? 'border-black bg-neutral-100 font-bold text-black'
                            : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        <Radio className="w-4 h-4 text-emerald-600" />
                        <span>UPI ID / VPA</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentGatewayMethod('qr')}
                        className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition ${
                          paymentGatewayMethod === 'qr'
                            ? 'border-black bg-neutral-100 font-bold text-black'
                            : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        <QrCode className="w-4 h-4 text-uber-blue" />
                        <span>Dynamic QR</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentGatewayMethod('card')}
                        className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition ${
                          paymentGatewayMethod === 'card'
                            ? 'border-black bg-neutral-100 font-bold text-black'
                            : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 text-amber-600" />
                        <span>Test Card</span>
                      </button>
                    </div>

                    {/* Method Details */}
                    {paymentGatewayMethod === 'upi' && (
                      <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs space-y-1.5">
                        <span className="text-[10px] text-neutral-500 uppercase font-bold">Virtual Payment Address (VPA):</span>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="w-full p-2 bg-white border border-neutral-300 rounded-xl text-xs font-mono font-semibold"
                        />
                      </div>
                    )}

                    {paymentGatewayMethod === 'qr' && (
                      <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 text-center space-y-2">
                        <div className="w-32 h-32 bg-white border-2 border-neutral-800 rounded-2xl mx-auto p-2 flex items-center justify-center shadow-inner">
                          <QrCode className="w-24 h-24 text-black animate-pulse" />
                        </div>
                        <span className="text-[11px] text-neutral-500 font-medium block">
                          Scan using GPay, PhonePe, or Paytm App
                        </span>
                      </div>
                    )}

                    {paymentGatewayMethod === 'card' && (
                      <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs space-y-1.5">
                        <span className="text-[10px] text-neutral-500 uppercase font-bold">Saved Card:</span>
                        <div className="p-2 bg-white border border-neutral-300 rounded-xl font-mono text-xs text-neutral-800 font-semibold">
                          {cardNumber} (Exp: 12/29 • CVV: •••)
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="button"
                    disabled={isProcessing || topupAmount <= 0}
                    onClick={handleProcessPayment}
                    className="w-full py-4 bg-black hover:bg-neutral-800 active:scale-95 disabled:opacity-50 text-white font-extrabold rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-2 transition shadow-xl mt-4"
                  >
                    {isProcessing ? (
                      <>
                        <Radio className="w-4 h-4 animate-spin text-uber-blue" />
                        <span>Authorizing with Bank Gateway...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Pay Securely ₹{topupAmount}</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          )}

          {/* TAB 3: ACTIVITY LEDGER */}
          {activeTab === 'transactions' && (
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="p-8 text-center text-neutral-400 text-xs space-y-2">
                  <Clock className="w-8 h-8 mx-auto text-neutral-300" />
                  <div className="font-bold text-neutral-700">No Transactions Yet</div>
                  <p className="text-[11px] text-neutral-500">
                    Add money to your Uber Cash wallet or book rides to see your ledger here.
                  </p>
                </div>
              ) : (
                transactions.map((tx) => {
                  const isCredit = tx.amount > 0;
                  return (
                    <div
                      key={tx.txId}
                      className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center justify-between text-xs transition hover:border-neutral-300"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                            isCredit
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-neutral-200 text-neutral-800'
                          }`}
                        >
                          {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-bold text-neutral-900">{tx.description}</div>
                          <div className="text-[10px] text-neutral-400 font-mono">
                            {new Date(tx.timestamp).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`text-sm font-black font-mono ${
                          isCredit ? 'text-emerald-600' : 'text-neutral-900'
                        }`}
                      >
                        {isCredit ? '+' : ''}₹{Math.abs(tx.amount).toFixed(2)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
