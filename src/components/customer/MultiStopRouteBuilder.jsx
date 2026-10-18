import React, { useState, useEffect, useRef } from 'react';
import { searchPlaces } from '../../services/gisService';
import { geoService } from '../../services/geolocationService';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  ArrowUpDown, 
  Navigation, 
  Home, 
  Briefcase, 
  Search, 
  Clock, 
  Compass, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  X,
  Crosshair
} from 'lucide-react';

export const MultiStopRouteBuilder = ({
  pickup,
  stops = [],
  dropoff,
  routeStats,
  onUpdatePickup,
  onAddStop,
  onUpdateStop,
  onRemoveStop,
  onReorderStops,
  onUpdateDropoff,
  onTogglePinDropMode,
  isPinDropMode,
  activePinField,
  userSavedAddresses,
  onProceedToModule3,
}) => {
  // Active search field: 'pickup' | 'dropoff' | stopId | null
  const [activeSearchField, setActiveSearchField] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);

  const searchDebounceTimer = useRef(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    if (searchDebounceTimer.current) clearTimeout(searchDebounceTimer.current);

    searchDebounceTimer.current = setTimeout(async () => {
      try {
        const results = await searchPlaces(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => {
      if (searchDebounceTimer.current) clearTimeout(searchDebounceTimer.current);
    };
  }, [searchQuery]);

  const handleSelectLocation = (loc) => {
    if (activeSearchField === 'pickup') {
      onUpdatePickup({ address: loc.address, lat: loc.lat, lng: loc.lng });
    } else if (activeSearchField === 'dropoff') {
      onUpdateDropoff({ address: loc.address, lat: loc.lat, lng: loc.lng });
    } else if (activeSearchField) {
      // It's a stop ID
      onUpdateStop(activeSearchField, { address: loc.address, lat: loc.lat, lng: loc.lng });
    }
    setActiveSearchField(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSelectSavedPlace = (type) => {
    if (!userSavedAddresses || !userSavedAddresses[type]) return;
    const addr = userSavedAddresses[type];
    if (!addr.address) return;

    if (activeSearchField === 'pickup') {
      onUpdatePickup({ address: addr.address, lat: addr.lat, lng: addr.lng });
    } else {
      onUpdateDropoff({ address: addr.address, lat: addr.lat, lng: addr.lng });
    }
    setActiveSearchField(null);
  };

  return (
    <div className="bg-white rounded-3xl shadow-uber-lg border border-neutral-200 overflow-hidden flex flex-col transition-all">
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-uber-blue">
            Multi-Stop Route Engine
          </span>
          <h2 className="text-base sm:text-lg font-bold text-neutral-900">
            Where are you going?
          </h2>
        </div>

        {/* Quick Pin Drop Mode Button */}
        <button
          type="button"
          onClick={() => onTogglePinDropMode(activeSearchField || 'dropoff')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition ${
            isPinDropMode
              ? 'bg-black text-white shadow-md'
              : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
          }`}
          title="Drag map to set exact coordinates"
        >
          <Compass className="w-3.5 h-3.5 text-emerald-500" />
          <span>{isPinDropMode ? 'Confirm Map Pin' : 'Set on Map'}</span>
        </button>
      </div>

      {/* Inputs List */}
      <div className="p-4 sm:p-5 space-y-3">
        {/* 1. Source (Pickup) Input */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1 pl-9">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 flex items-center space-x-1">
              <span>● Source (Pickup Location)</span>
            </span>

            <button
              type="button"
              onClick={async () => {
                try {
                  setIsDetectingGPS(true);
                  const loc = await geoService.getCurrentLocationWithAddress();
                  onUpdatePickup({ address: loc.address, lat: loc.lat, lng: loc.lng });
                } catch (err) {
                  alert('GPS Error: ' + (err.message || 'Please enable browser location access.'));
                } finally {
                  setIsDetectingGPS(false);
                }
              }}
              disabled={isDetectingGPS}
              className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg flex items-center space-x-1 transition cursor-pointer"
              title="Detect current live GPS location"
            >
              <Navigation className={`w-3 h-3 text-emerald-600 ${isDetectingGPS ? 'animate-spin' : ''}`} />
              <span>{isDetectingGPS ? 'Detecting GPS...' : 'Use Live GPS'}</span>
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 flex flex-col items-center">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 ring-4 ring-emerald-100" />
              <div className="w-0.5 h-6 bg-neutral-300 my-0.5" />
            </div>

            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Enter Source / Pickup location"
                value={
                  activeSearchField === 'pickup'
                    ? searchQuery
                    : pickup?.address || ''
                }
                onFocus={() => {
                  setActiveSearchField('pickup');
                  setSearchQuery(pickup?.address || '');
                }}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2.5 bg-neutral-50 hover:bg-neutral-100/80 focus:bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-black focus:outline-none transition"
              />
              {activeSearchField === 'pickup' && searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-black"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. Intermediate Stops (Up to 5) */}
        {stops.map((stop, index) => (
          <div key={stop.id} className="relative">
            <div className="flex items-center space-x-3">
              <div className="w-6 flex flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-uber-blue text-white font-extrabold text-[10px] flex items-center justify-center shadow-sm">
                  {index + 1}
                </div>
                <div className="w-0.5 h-6 bg-neutral-300 my-0.5" />
              </div>

              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder={`Stop ${index + 1} address`}
                  value={
                    activeSearchField === stop.id
                      ? searchQuery
                      : stop.address || ''
                  }
                  onFocus={() => {
                    setActiveSearchField(stop.id);
                    setSearchQuery(stop.address || '');
                  }}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2.5 bg-neutral-50 hover:bg-neutral-100/80 focus:bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-black focus:outline-none transition"
                />
              </div>

              {/* Actions for stop: Reorder & Remove */}
              <div className="flex items-center space-x-1">
                {stops.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onReorderStops(index, (index + 1) % stops.length)}
                    className="p-1.5 text-neutral-400 hover:text-black rounded-lg hover:bg-neutral-100 transition"
                    title="Swap stop order"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onRemoveStop(stop.id)}
                  className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                  title="Remove this stop"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* 3. Destination (Dropoff) Input */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1 pl-9">
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-800 flex items-center space-x-1">
              <span>■ Destination (Dropoff Location)</span>
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 flex flex-col items-center">
              <div className="w-3.5 h-3.5 rounded-sm bg-black ring-4 ring-neutral-200" />
            </div>

            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Where to? (Enter Destination location)"
                value={
                  activeSearchField === 'dropoff'
                    ? searchQuery
                    : dropoff?.address || ''
                }
                onFocus={() => {
                  setActiveSearchField('dropoff');
                  setSearchQuery(dropoff?.address || '');
                }}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2.5 bg-neutral-50 hover:bg-neutral-100/80 focus:bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-black focus:outline-none transition"
              />
              {activeSearchField === 'dropoff' && searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-black"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* "+ Add Stop" Button (Max 5 intermediate stops) */}
        {stops.length < 5 && (
          <div className="pl-9 pt-1">
            <button
              type="button"
              onClick={onAddStop}
              className="text-xs font-bold text-neutral-800 hover:text-black flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition"
            >
              <Plus className="w-3.5 h-3.5 text-uber-blue" />
              <span>Add Stop ({stops.length}/5 max)</span>
            </button>
          </div>
        )}

        {/* Saved Places Quick Chips */}
        <div className="pt-2 flex flex-wrap items-center gap-1.5 pl-9">
          {userSavedAddresses?.home?.address && (
            <button
              type="button"
              onClick={() => handleSelectSavedPlace('home')}
              className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-[11px] font-semibold flex items-center space-x-1 transition"
            >
              <Home className="w-3 h-3 text-uber-blue" />
              <span>Home</span>
            </button>
          )}

          {userSavedAddresses?.work?.address && (
            <button
              type="button"
              onClick={() => handleSelectSavedPlace('work')}
              className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-[11px] font-semibold flex items-center space-x-1 transition"
            >
              <Briefcase className="w-3 h-3 text-emerald-600" />
              <span>Work</span>
            </button>
          )}
        </div>

        {/* Autocomplete Dropdown */}
        {activeSearchField && (
          <div className="mt-2 bg-neutral-900 text-white rounded-2xl p-2 shadow-2xl border border-neutral-700 animate-in fade-in duration-150 max-h-56 overflow-y-auto">
            <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-800">
              <span>Matching Places ({searchResults.length})</span>
              <button
                type="button"
                onClick={() => {
                  setActiveSearchField(null);
                  setSearchResults([]);
                }}
                className="text-neutral-400 hover:text-white"
              >
                Close ✕
              </button>
            </div>
            {/* Instant Current Location GPS Action */}
            <button
              type="button"
              onClick={async () => {
                try {
                  setIsDetectingGPS(true);
                  const loc = await geoService.getCurrentLocationWithAddress();
                  handleSelectLocation(loc);
                } catch (err) {
                  alert('GPS Error: ' + (err.message || 'Please enable browser location access.'));
                } finally {
                  setIsDetectingGPS(false);
                }
              }}
              className="w-full text-left p-2.5 hover:bg-neutral-800 rounded-xl flex items-center space-x-2.5 transition text-xs border-b border-neutral-800 text-emerald-400 group cursor-pointer mb-1"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Navigation className={`w-3.5 h-3.5 ${isDetectingGPS ? 'animate-spin' : ''}`} />
              </div>
              <div className="truncate">
                <div className="font-bold text-white flex items-center space-x-1">
                  <span>Use Current Live Location</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded-full font-mono">GPS</span>
                </div>
                <div className="text-[10px] text-neutral-400">Fetch real coordinates via device sensor</div>
              </div>
            </button>

            {isSearching ? (
              <div className="p-4 text-center text-xs text-neutral-400 flex items-center justify-center space-x-2">
                <Compass className="w-4 h-4 animate-spin text-uber-blue" />
                <span>Searching OpenStreetMap Nominatim...</span>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-3 text-center text-xs text-neutral-400">
                Type 2+ letters to search landmarks or addresses.
              </div>
            ) : (
              searchResults.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectLocation(item)}
                  className="w-full text-left p-2.5 hover:bg-neutral-800 rounded-xl flex items-start space-x-2.5 transition text-xs group"
                >
                  <MapPin className="w-4 h-4 text-uber-blue mt-0.5 flex-shrink-0 group-hover:scale-110 transition" />
                  <div className="truncate">
                    <div className="font-semibold text-white truncate">{item.address}</div>
                    <div className="text-[10px] text-neutral-400">
                      GPS: {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Route Summary Card & ETA Banner */}
      {routeStats && (
        <div className="bg-neutral-950 text-white p-4 sm:p-5 border-t border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1">
                <Clock className="w-3 h-3 mr-1" />
                <span>OSRM Road-Snapped Route</span>
              </div>
              <div className="flex items-baseline space-x-3 mt-1">
                <span className="text-2xl font-black">{routeStats.durationMins} mins</span>
                <span className="text-sm font-semibold text-neutral-400">
                  ({routeStats.distanceKm} km)
                </span>
              </div>
            </div>

            {stops.length > 0 && (
              <div className="text-right">
                <span className="text-xs bg-uber-blue/20 text-uber-blue border border-uber-blue/40 px-2 py-0.5 rounded-full font-bold">
                  {stops.length} {stops.length === 1 ? 'Stop' : 'Stops'}
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onProceedToModule3}
            className="mt-4 w-full py-3 bg-white hover:bg-neutral-100 text-black font-extrabold rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 transition shadow-lg active:scale-95"
          >
            <span>Proceed to Select Ride</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
