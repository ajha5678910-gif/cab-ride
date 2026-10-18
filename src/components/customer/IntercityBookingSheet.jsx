import React, { useState } from 'react';
import { 
  POPULAR_INTERCITY_CITIES, 
  INTERCITY_RATES, 
  calculateIntercityFare 
} from '../../services/pricingService';
import { 
  Compass, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  RotateCcw, 
  Check, 
  ShieldCheck, 
  X 
} from 'lucide-react';

export const IntercityBookingSheet = ({
  pickup,
  onConfirmIntercity,
  onClose,
}) => {
  const [tripType, setTripType] = useState('one_way'); // 'one_way' | 'round_trip'
  const [selectedCity, setSelectedCity] = useState(POPULAR_INTERCITY_CITIES[0]); // default Agra
  const [returnDays, setReturnDays] = useState(1);
  const [departureDate, setDepartureDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [returnDate, setReturnDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });

  const totalFare = calculateIntercityFare(selectedCity.distanceKm, tripType, returnDays);

  const handleBook = () => {
    onConfirmIntercity({
      category: 'Uber Premier',
      upfrontFare: totalFare,
      paymentMethod: 'Cash',
      dropoff: {
        address: `${selectedCity.name} City Center`,
        lat: selectedCity.lat,
        lng: selectedCity.lng,
      },
      intercityDetails: {
        tripType,
        destinationCity: selectedCity.name,
        distanceKm: selectedCity.distanceKm,
        departureDateTime: departureDate,
        returnDateTime: tripType === 'round_trip' ? returnDate : null,
        driverAllowance: INTERCITY_RATES.driverAllowancePerDay * returnDays,
      },
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-uber-lg border border-neutral-200 overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-4 duration-200">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-uber-blue flex items-center space-x-1">
            <Compass className="w-3 h-3 text-uber-blue mr-0.5" />
            <span>Uber Intercity</span>
          </span>
          <h2 className="text-base sm:text-lg font-bold text-neutral-900">
            Comfortable Outstation Travel
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

      {/* Body */}
      <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[420px]">
        {/* Trip Type Toggle */}
        <div className="flex bg-neutral-100 p-1 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setTripType('one_way')}
            className={`flex-1 py-2 rounded-xl transition ${
              tripType === 'one_way' ? 'bg-white text-black shadow-sm' : 'text-neutral-600'
            }`}
          >
            One-Way Drop
          </button>
          <button
            type="button"
            onClick={() => setTripType('round_trip')}
            className={`flex-1 py-2 rounded-xl transition ${
              tripType === 'round_trip' ? 'bg-white text-black shadow-sm' : 'text-neutral-600'
            }`}
          >
            Round-Trip (Return)
          </button>
        </div>

        {/* Popular Destination Cities Chips */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
            Select Destination City:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {POPULAR_INTERCITY_CITIES.map((city) => {
              const isSelected = selectedCity.name === city.name;
              return (
                <button
                  key={city.name}
                  type="button"
                  onClick={() => setSelectedCity(city)}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                    isSelected
                      ? 'border-black bg-neutral-900 text-white font-bold'
                      : 'border-neutral-200 bg-neutral-50 hover:bg-white text-neutral-800'
                  }`}
                >
                  <div className="truncate">
                    <div className="text-xs truncate">{city.name}</div>
                    <div className={`text-[10px] ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      {city.distanceKm} km • {city.estHours} hrs
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-300 ml-1 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Departure & Return Dates */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-neutral-700 mb-1">Departure Date:</label>
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="w-full px-2.5 py-2 bg-neutral-50 border border-neutral-300 rounded-xl"
            />
          </div>

          {tripType === 'round_trip' && (
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Return Date:</label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full px-2.5 py-2 bg-neutral-50 border border-neutral-300 rounded-xl"
              />
            </div>
          )}
        </div>

        {/* Transparent Fare Breakdown */}
        <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 space-y-1.5 text-xs">
          <div className="font-bold text-neutral-900 flex items-center justify-between">
            <span>Fare Breakdown ({tripType === 'round_trip' ? 'Round-Trip' : 'One-Way'}):</span>
            <span className="text-base font-black">₹{totalFare}</span>
          </div>
          <div className="text-[11px] text-neutral-500 flex justify-between">
            <span>Distance Rate:</span>
            <span>{tripType === 'round_trip' ? selectedCity.distanceKm * 2 : selectedCity.distanceKm} km @ ₹14/km</span>
          </div>
          {tripType === 'round_trip' && (
            <div className="text-[11px] text-neutral-500 flex justify-between">
              <span>Driver Day Allowance:</span>
              <span>₹{INTERCITY_RATES.driverAllowancePerDay} included</span>
            </div>
          )}
          <div className="text-[10px] text-emerald-600 font-semibold pt-1 border-t border-neutral-200">
            ✓ Top-rated verified commercial chauffeur with valid state permits
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-neutral-50 border-t border-neutral-200">
        <button
          type="button"
          onClick={handleBook}
          className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-extrabold rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-2 transition shadow-lg active:scale-95"
        >
          <span>Book Intercity to {selectedCity.name.split(' ')[0]} • ₹{totalFare}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
