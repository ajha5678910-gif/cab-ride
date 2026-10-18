import React, { useState, useEffect } from 'react';
import { dbService, DEFAULT_PLATFORM_CONFIG } from '../../services/db';
import confetti from 'canvas-confetti';
import { 
  DollarSign, 
  Sparkles, 
  Sliders, 
  TrendingUp, 
  CheckCircle2, 
  RotateCcw, 
  CloudRain, 
  Zap, 
  Clock, 
  Flame, 
  Car, 
  AlertCircle 
} from 'lucide-react';

export const DynamicPricingSurgeController = ({ onRatesUpdated }) => {
  const [config, setConfig] = useState(DEFAULT_PLATFORM_CONFIG);
  const [pricingDraft, setPricingDraft] = useState(DEFAULT_PLATFORM_CONFIG.vehiclePricing);
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.0);
  const [surgeReason, setSurgeReason] = useState('Normal Operations');
  const [commissionPercent, setCommissionPercent] = useState(20);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const current = dbService.getPlatformConfig();
    setConfig(current);
    setPricingDraft(current.vehiclePricing || DEFAULT_PLATFORM_CONFIG.vehiclePricing);
    setSurgeMultiplier(current.globalSurgeMultiplier || 1.0);
    setSurgeReason(current.weatherTrafficSurgeReason || 'Normal Operations');
    setCommissionPercent(current.platformCommissionPercent || 20);
  }, []);

  const handlePriceChange = (category, field, value) => {
    setPricingDraft((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: Number(value) || 0,
      },
    }));
  };

  const handleApplySurgePreset = (multiplier, reason) => {
    setSurgeMultiplier(multiplier);
    setSurgeReason(reason);
  };

  const handlePublishLiveRates = () => {
    const updated = dbService.updatePlatformConfig({
      vehiclePricing: pricingDraft,
      globalSurgeMultiplier: Number(surgeMultiplier),
      weatherTrafficSurgeReason: surgeReason,
      platformCommissionPercent: Number(commissionPercent),
    });

    setConfig(updated);
    setSavedSuccess(true);
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {}

    setTimeout(() => setSavedSuccess(false), 3000);
    if (onRatesUpdated) onRatesUpdated();
  };

  const handleResetToStandard = () => {
    setPricingDraft(DEFAULT_PLATFORM_CONFIG.vehiclePricing);
    setSurgeMultiplier(1.0);
    setSurgeReason('Normal Operations');
    setCommissionPercent(20);
  };

  const categories = Object.keys(pricingDraft);

  return (
    <div className="bg-white rounded-3xl border border-neutral-200 shadow-uber-subtle p-6 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-uber-blue flex items-center space-x-1">
            <Sliders className="w-3.5 h-3.5 mr-1" />
            <span>Dynamic Pricing & Surge Engine</span>
          </span>
          <h2 className="text-xl font-extrabold text-neutral-900 mt-1">
            Fleet Rate Matrix & Live Surge Multiplier
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Adjust real-time base fares, per-km charges, and city-wide rush surge multipliers. All customer quotes recalculate instantly.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleResetToStandard}
            className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-2xl text-xs flex items-center space-x-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Standards</span>
          </button>

          <button
            type="button"
            onClick={handlePublishLiveRates}
            className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white font-extrabold rounded-2xl text-xs flex items-center space-x-2 transition shadow-lg hover:shadow-xl"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Publish Live Rates to City</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-2xl flex items-center space-x-3 text-xs font-bold animate-in zoom-in-95">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Live Rates & Surge Multiplier ({surgeMultiplier}x) successfully published to the platform! All active customer booking sheets have recalculated.
          </span>
        </div>
      )}

      {/* Section 1: City-Wide Dynamic Surge & Reason Engine */}
      <div className="bg-neutral-50 rounded-3xl p-5 border border-neutral-200 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>City-Wide Live Surge Multiplier</span>
            </h3>
            <p className="text-xs text-neutral-500">
              Applies a demand-balancing multiplier on gross ride fares.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-2xl font-black text-amber-600 font-mono">
              {Number(surgeMultiplier).toFixed(1)}x
            </span>
            <span className="text-xs bg-amber-100 text-amber-900 px-3 py-1 rounded-full font-bold">
              {surgeReason}
            </span>
          </div>
        </div>

        {/* Surge Slider */}
        <div className="space-y-1">
          <input
            type="range"
            min="1.0"
            max="3.0"
            step="0.1"
            value={surgeMultiplier}
            onChange={(e) => setSurgeMultiplier(parseFloat(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-2 bg-neutral-200 rounded-lg"
          />
          <div className="flex justify-between text-[10px] font-bold text-neutral-400">
            <span>1.0x (Standard)</span>
            <span>1.5x (Rain)</span>
            <span>2.0x (Peak Rush)</span>
            <span>2.5x (Storm)</span>
            <span>3.0x (Extreme Demand)</span>
          </div>
        </div>

        {/* Quick Surge Preset Chips */}
        <div>
          <span className="text-[11px] font-bold text-neutral-600 block mb-2">
            Quick Scenario Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleApplySurgePreset(1.0, 'Normal Operations')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border ${
                surgeMultiplier === 1.0
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
              }`}
            >
              <span>Normal Operations (1.0x)</span>
            </button>

            <button
              type="button"
              onClick={() => handleApplySurgePreset(1.5, 'Heavy Rain Surge')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border ${
                surgeMultiplier === 1.5
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
              }`}
            >
              <CloudRain className="w-3.5 h-3.5" />
              <span>Heavy Rain (1.5x)</span>
            </button>

            <button
              type="button"
              onClick={() => handleApplySurgePreset(1.8, 'Peak Rush Hour')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border ${
                surgeMultiplier === 1.8
                  ? 'bg-amber-500 text-black border-amber-500'
                  : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Peak Rush (1.8x)</span>
            </button>

            <button
              type="button"
              onClick={() => handleApplySurgePreset(2.2, 'High Demand Surge')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border ${
                surgeMultiplier === 2.2
                  ? 'bg-orange-600 text-white border-orange-600'
                  : 'bg-white text-orange-700 border-orange-200 hover:bg-orange-50'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>High Demand (2.2x)</span>
            </button>

            <button
              type="button"
              onClick={() => handleApplySurgePreset(2.5, 'Severe Weather / Storm')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border ${
                surgeMultiplier === 2.5
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Severe Storm (2.5x)</span>
            </button>
          </div>
        </div>

        {/* Platform Commission Control */}
        <div className="pt-3 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-neutral-800">
              Platform Take-Rate (Commission %):
            </span>
            <p className="text-[11px] text-neutral-500">
              Percentage of gross ride fare retained by the platform (driver receives remaining share).
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="number"
              min="10"
              max="35"
              value={commissionPercent}
              onChange={(e) => setCommissionPercent(Number(e.target.value))}
              className="w-20 px-3 py-1.5 bg-white border border-neutral-300 rounded-xl text-xs font-bold text-right"
            />
            <span className="text-sm font-black text-neutral-800">%</span>
          </div>
        </div>
      </div>

      {/* Section 2: Vehicle Category Pricing Matrix Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-neutral-900 flex items-center space-x-2">
          <Car className="w-4 h-4 text-neutral-700" />
          <span>Vehicle Fleets Base Pricing Matrix</span>
        </h3>

        <div className="overflow-x-auto rounded-2xl border border-neutral-200">
          <table className="min-w-full divide-y divide-neutral-200 text-xs">
            <thead className="bg-neutral-100 text-neutral-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-right">Base Fare (₹)</th>
                <th className="px-4 py-3 text-right">Per KM (₹/km)</th>
                <th className="px-4 py-3 text-right">Per Min (₹/min)</th>
                <th className="px-4 py-3 text-right">Stop Fee (₹)</th>
                <th className="px-4 py-3 text-right">Min Fare (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 bg-white">
              {categories.map((catKey) => {
                const item = pricingDraft[catKey] || {};
                return (
                  <tr key={catKey} className="hover:bg-neutral-50/70 transition">
                    <td className="px-4 py-3.5 font-bold text-neutral-900 flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-uber-blue" />
                      <span>{catKey}</span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <input
                        type="number"
                        min="0"
                        value={item.baseFare || 0}
                        onChange={(e) => handlePriceChange(catKey, 'baseFare', e.target.value)}
                        className="w-20 px-2 py-1 bg-neutral-50 border border-neutral-300 rounded-lg text-right font-bold focus:border-black"
                      />
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={item.perKmRate || 0}
                        onChange={(e) => handlePriceChange(catKey, 'perKmRate', e.target.value)}
                        className="w-20 px-2 py-1 bg-neutral-50 border border-neutral-300 rounded-lg text-right font-bold focus:border-black"
                      />
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={item.perMinRate || 0}
                        onChange={(e) => handlePriceChange(catKey, 'perMinRate', e.target.value)}
                        className="w-20 px-2 py-1 bg-neutral-50 border border-neutral-300 rounded-lg text-right font-bold focus:border-black"
                      />
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <input
                        type="number"
                        min="0"
                        value={item.stopFee || 0}
                        onChange={(e) => handlePriceChange(catKey, 'stopFee', e.target.value)}
                        className="w-20 px-2 py-1 bg-neutral-50 border border-neutral-300 rounded-lg text-right font-bold focus:border-black"
                      />
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <input
                        type="number"
                        min="0"
                        value={item.minFare || item.baseFare || 0}
                        onChange={(e) => handlePriceChange(catKey, 'minFare', e.target.value)}
                        className="w-20 px-2 py-1 bg-neutral-50 border border-neutral-300 rounded-lg text-right font-bold focus:border-black"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
