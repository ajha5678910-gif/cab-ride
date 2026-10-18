import React, { useState } from 'react';
import { KeyRound, Delete, Check, AlertCircle, X } from 'lucide-react';

export const PinVerificationKeypad = ({ onVerify, onCancel, customerName }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [shake, setShake] = useState(false);

  const handleKeyPress = (num) => {
    if (pin.length < 4) {
      setError('');
      setPin((prev) => prev + num);
    }
  };

  const handleBackspace = () => {
    setError('');
    setPin((prev) => prev.slice(0, -1));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (pin.length !== 4) {
      setError('Please enter all 4 digits');
      return;
    }

    setIsVerifying(true);
    setError('');
    try {
      await onVerify(pin);
    } catch (err) {
      setError(err.message || 'Invalid PIN code');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPin('');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className={`bg-neutral-950 text-white rounded-3xl max-w-sm w-full border border-neutral-800 shadow-2xl overflow-hidden p-6 space-y-6 ${shake ? 'animate-shake' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Enter 4-Digit Ride PIN</h3>
              <p className="text-[11px] text-neutral-400">Ask {customerName || 'customer'} for their PIN</p>
            </div>
          </div>

          {onCancel && (
            <button
              onClick={onCancel}
              className="text-neutral-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 4 Digit Boxes Display */}
        <div className="flex justify-center space-x-3 py-2">
          {[0, 1, 2, 3].map((idx) => {
            const digit = pin[idx];
            return (
              <div
                key={idx}
                className={`w-14 h-16 rounded-2xl border-2 flex items-center justify-center text-2xl font-black font-mono transition-all ${
                  digit
                    ? 'border-amber-400 bg-neutral-900 text-amber-300 shadow-lg scale-105'
                    : 'border-neutral-800 bg-neutral-900/50 text-neutral-600'
                }`}
              >
                {digit || '•'}
              </div>
            );
          })}
        </div>

        {/* Error message */}
        {error && (
          <div className="p-2.5 bg-red-950/60 border border-red-800/80 text-red-300 rounded-xl text-xs text-center flex items-center justify-center space-x-1.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Numpad 0-9 */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num.toString())}
              className="h-13 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-lg transition active:scale-95 border border-neutral-800/80"
            >
              {num}
            </button>
          ))}

          <button
            type="button"
            onClick={handleBackspace}
            className="h-13 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white font-bold text-sm transition flex items-center justify-center border border-neutral-800/80 active:scale-95"
            title="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-13 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-lg transition active:scale-95 border border-neutral-800/80"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={pin.length !== 4 || isVerifying}
            className={`h-13 py-3 rounded-2xl font-bold text-sm transition flex items-center justify-center active:scale-95 ${
              pin.length === 4
                ? 'bg-emerald-500 hover:bg-emerald-600 text-black shadow-lg font-black'
                : 'bg-neutral-900 text-neutral-600 cursor-not-allowed border border-neutral-800'
            }`}
          >
            <Check className="w-5 h-5 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
