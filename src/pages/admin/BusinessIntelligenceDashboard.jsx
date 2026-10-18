import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Crown, 
  Car, 
  Compass, 
  CalendarClock, 
  Truck, 
  Layers, 
  Sparkles,
  PieChart,
  BarChart3,
  Percent
} from 'lucide-react';

export const BusinessIntelligenceDashboard = () => {
  const [analytics, setAnalytics] = useState(null);

  const loadData = () => {
    setAnalytics(dbService.getExecutiveAnalytics());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = dbService.subscribe(() => {
      loadData();
    });
    return unsubscribe;
  }, []);

  if (!analytics) return null;

  const totalRides = Math.max(1, analytics.totalRides);
  const totalCategoryRides = Object.values(analytics.categoryCounts).reduce((a, b) => a + b, 0) || 1;
  const totalModeRides = Object.values(analytics.modeCounts).reduce((a, b) => a + b, 0) || 1;

  const categoryColors = {
    'Uber Moto': '#F59E0B',
    'Uber Auto': '#10B981',
    'Uber Go': '#000000',
    'Uber Green': '#059669',
    'Uber Premier': '#2563EB',
    'Uber XL': '#7C3AED',
  };

  const modeColors = {
    daily: '#000000',
    reserve: '#F59E0B',
    rentals: '#2563EB',
    intercity: '#10B981',
    courier: '#EC4899',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Gross Merchandise Value */}
        <div className="bg-white p-5 rounded-3xl border border-neutral-200 shadow-uber-subtle flex items-center justify-between">
          <div>
            <span className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider">
              Gross Booking Value (GMV)
            </span>
            <div className="text-2xl font-black text-neutral-900 mt-1">
              ₹{analytics.gmv.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              Across {analytics.totalRides} trips processed
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-black">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Net Platform Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-neutral-200 shadow-uber-subtle flex items-center justify-between">
          <div>
            <span className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider">
              Net 20% Platform Revenue
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              ₹{analytics.netRevenue.toLocaleString()}
            </div>
            <div className="text-[11px] text-neutral-500 font-semibold mt-0.5">
              Net take-rate profit
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Driver Partner Payouts */}
        <div className="bg-white p-5 rounded-3xl border border-neutral-200 shadow-uber-subtle flex items-center justify-between">
          <div>
            <span className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider">
              Driver 80% Net Payouts
            </span>
            <div className="text-2xl font-black text-neutral-900 mt-1">
              ₹{analytics.driverPayouts.toLocaleString()}
            </div>
            <div className="text-[11px] text-neutral-500 font-semibold mt-0.5">
              + ₹{analytics.totalTips} 100% Tips credited
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-uber-blue">
            <Car className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: Uber One Subscribers & MRR */}
        <div className="bg-gradient-to-br from-amber-500 to-yellow-600 text-black p-5 rounded-3xl shadow-uber-subtle flex items-center justify-between">
          <div>
            <span className="text-amber-950 text-[10px] uppercase font-extrabold tracking-wider">
              Uber One Members (MRR)
            </span>
            <div className="text-2xl font-black text-black mt-1">
              ₹{analytics.mrrUberOne.toLocaleString()}
            </div>
            <div className="text-[11px] font-bold text-amber-950 mt-0.5">
              {analytics.uberOneSubscribers} Active Gold VIP Members
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-black text-amber-400 flex items-center justify-center shadow-lg">
            <Crown className="w-6 h-6 fill-amber-400 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Rides by Vehicle Fleet Category */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-uber-subtle space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-neutral-900 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-neutral-700" />
                <span>Rides Distribution by Vehicle Category</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Fleet share across 6 Uber tiers.
              </p>
            </div>
            <span className="text-xs bg-neutral-100 text-neutral-700 font-bold px-2.5 py-1 rounded-xl">
              {totalCategoryRides} Trips
            </span>
          </div>

          <div className="space-y-3">
            {Object.entries(analytics.categoryCounts).map(([catName, count]) => {
              const pct = Math.round((count / totalCategoryRides) * 100);
              const color = categoryColors[catName] || '#000000';
              return (
                <div key={catName} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-neutral-800 flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <span>{catName}</span>
                    </span>
                    <span className="font-mono text-neutral-600 font-semibold">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(4, pct)}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Rides by Specialized Booking Mode */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-uber-subtle space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-neutral-900 flex items-center space-x-2">
                <PieChart className="w-4 h-4 text-neutral-700" />
                <span>Rides Distribution by Booking Mode</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Daily, Reserve, Rentals, Intercity, and Courier.
              </p>
            </div>
            <span className="text-xs bg-neutral-100 text-neutral-700 font-bold px-2.5 py-1 rounded-xl">
              All Fleet Modes
            </span>
          </div>

          <div className="space-y-3">
            {Object.entries(analytics.modeCounts).map(([modeKey, count]) => {
              const pct = Math.round((count / totalModeRides) * 100);
              const color = modeColors[modeKey] || '#000000';
              const labelMap = {
                daily: 'Daily On-Demand Commute',
                reserve: 'Uber Reserve (Scheduled Ahead)',
                rentals: 'Uber Rentals (Hourly Packages)',
                intercity: 'Uber Intercity (Outstation Trips)',
                courier: 'Uber Connect (Parcel Delivery)',
              };

              return (
                <div key={modeKey} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-neutral-800 flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <span>{labelMap[modeKey] || modeKey}</span>
                    </span>
                    <span className="font-mono text-neutral-600 font-semibold">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(4, pct)}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
