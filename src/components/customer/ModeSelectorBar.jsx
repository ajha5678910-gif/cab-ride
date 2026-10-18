import React from 'react';
import { 
  Car, 
  CalendarClock, 
  Hourglass, 
  Compass, 
  Package, 
  Sparkles 
} from 'lucide-react';

export const ModeSelectorBar = ({ activeMode = 'daily', onSelectMode }) => {
  const modes = [
    {
      id: 'daily',
      name: 'Daily Ride',
      tagline: 'Point-to-point',
      icon: Car,
      badge: null,
    },
    {
      id: 'reserve',
      name: 'Reserve',
      tagline: 'Up to 90 days',
      icon: CalendarClock,
      badge: 'Lock Price',
    },
    {
      id: 'rentals',
      name: 'Rentals',
      tagline: 'By the hour',
      icon: Hourglass,
      badge: 'Multi-Stop',
    },
    {
      id: 'intercity',
      name: 'Intercity',
      tagline: 'Outstation trips',
      icon: Compass,
      badge: 'Round-Trip',
    },
    {
      id: 'courier',
      name: 'Courier',
      tagline: 'Parcel delivery',
      icon: Package,
      badge: 'Dual-PIN',
    },
  ];

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-1.5 shadow-uber border border-neutral-200 overflow-x-auto flex items-center space-x-1.5">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isSelected = activeMode === mode.id;

        return (
          <button
            key={mode.id}
            type="button"
            onClick={() => onSelectMode(mode.id)}
            className={`flex-1 min-w-[90px] sm:min-w-[105px] py-2 px-2.5 rounded-xl transition flex flex-col items-center justify-center text-center relative ${
              isSelected
                ? 'bg-black text-white shadow-md'
                : 'text-neutral-700 hover:bg-neutral-100 hover:text-black'
            }`}
          >
            {mode.badge && (
              <span
                className={`absolute -top-1.5 px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase tracking-wider ${
                  isSelected
                    ? 'bg-amber-400 text-black'
                    : 'bg-neutral-200 text-neutral-800'
                }`}
              >
                {mode.badge}
              </span>
            )}
            <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-amber-300' : 'text-neutral-600'}`} />
            <span className="text-xs font-bold whitespace-nowrap">{mode.name}</span>
            <span className={`text-[9px] truncate max-w-full ${isSelected ? 'text-neutral-300' : 'text-neutral-400'}`}>
              {mode.tagline}
            </span>
          </button>
        );
      })}
    </div>
  );
};
