import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db';
import { calculateOSRMRoute, reverseGeocode } from '../../services/gisService';
import { geoService } from '../../services/geolocationService';
import { MapView } from '../../components/map/MapView';
import { 
  createVehicleIcon, 
  createPickupIcon, 
  createDropoffIcon, 
  createStopIcon 
} from '../../components/map/MapMarkers';
import { MultiStopRouteBuilder } from '../../components/customer/MultiStopRouteBuilder';
import { RideBookingSheet } from '../../components/customer/RideBookingSheet';
import { ActiveRideOverlay } from '../../components/customer/ActiveRideOverlay';
import { ModeSelectorBar } from '../../components/customer/ModeSelectorBar';
import { RiderSelectorModal } from '../../components/customer/RiderSelectorModal';
import { ReserveDatePickerModal } from '../../components/customer/ReserveDatePickerModal';
import { RentalsPackageSheet } from '../../components/customer/RentalsPackageSheet';
import { IntercityBookingSheet } from '../../components/customer/IntercityBookingSheet';
import { CourierBookingSheet } from '../../components/customer/CourierBookingSheet';
import { UpcomingReservationsDrawer } from '../../components/customer/UpcomingReservationsDrawer';
import { InAppChatDrawer } from '../../components/chat/InAppChatDrawer';
import { MaskedCallOverlay } from '../../components/call/MaskedCallOverlay';
import { SafetyToolkitModal } from '../../components/safety/SafetyToolkitModal';
import { RideCheckModal } from '../../components/safety/RideCheckModal';
import { UberCashModal } from '../../components/wallet/UberCashModal';
import { SplitFareModal } from '../../components/customer/SplitFareModal';
import { PostRideRatingModal } from '../../components/customer/PostRideRatingModal';
import { ActivityTripsModal } from '../../components/customer/ActivityTripsModal';
import { UberOneHubModal } from '../../components/customer/UberOneHubModal';
import { BusinessProfileModal } from '../../components/customer/BusinessProfileModal';
import { UberForTeensModal } from '../../components/customer/UberForTeensModal';
import { 
  Wallet, 
  Settings, 
  ShieldAlert, 
  ShieldCheck,
  Sparkles, 
  MapPin, 
  UserCheck,
  Clock,
  Crown,
  Briefcase,
  Building2,
  Users
} from 'lucide-react';

export const CustomerDashboard = ({ onOpenProfile }) => {
  const { currentUser, refreshUser } = useAuth();

  // Active Booking Mode: 'daily' | 'reserve' | 'rentals' | 'intercity' | 'courier'
  const [activeMode, setActiveMode] = useState('daily');

  // Rider info (For Me vs Book for Someone Else)
  const [riderInfo, setRiderInfo] = useState({
    isForSelf: true,
    riderName: currentUser?.fullName || '',
    riderPhone: currentUser?.phone || '',
  });

  // Active Ride State from DB
  const [activeRide, setActiveRide] = useState(null);
  const [scheduledRides, setScheduledRides] = useState([]);

  // Online drivers list
  const [onlineDrivers, setOnlineDrivers] = useState([]);

  // Modals & Sheets toggles
  const [showBookingSheet, setShowBookingSheet] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [reserveScheduleTime, setReserveScheduleTime] = useState(null);
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [showSafetyToolkit, setShowSafetyToolkit] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showSplitFareModal, setShowSplitFareModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showUberOneModal, setShowUberOneModal] = useState(false);
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [showTeensModal, setShowTeensModal] = useState(false);
  const [profileMode, setProfileMode] = useState(currentUser?.activeProfileMode || 'personal');

  // Active Route State (Starts clean for user to input or pick on map)
  const [pickup, setPickup] = useState({
    address: '',
    lat: null,
    lng: null,
  });

  const [stops, setStops] = useState([]);
  const [dropoff, setDropoff] = useState({
    address: '',
    lat: null,
    lng: null,
  });

  const [routeStats, setRouteStats] = useState(null);
  const [driverEnRouteStats, setDriverEnRouteStats] = useState(null);

  // Pin on map mode
  const [isPinDropMode, setIsPinDropMode] = useState(false);
  const [activePinField, setActivePinField] = useState('dropoff');
  const [currentMapCenter, setCurrentMapCenter] = useState([28.6250, 77.2200]);

  // Load online drivers, active ride, and scheduled rides
  const refreshCustomerState = () => {
    setOnlineDrivers(dbService.getOnlineDrivers());
    if (currentUser?.uid) {
      const active = dbService.getActiveCustomerRide(currentUser.uid);
      setActiveRide(active);

      const scheduled = dbService.getCustomerScheduledRides(currentUser.uid);
      setScheduledRides(scheduled);
    }
  };

  // Real-World Device GPS: Auto-detect on mount
  useEffect(() => {
    let isMounted = true;
    const fetchLiveGps = async () => {
      try {
        const loc = await geoService.getCurrentLocationWithAddress();
        if (isMounted && loc) {
          setCurrentMapCenter([loc.lat, loc.lng]);
          setPickup((prev) => {
            if (!prev.lat && !prev.address) {
              return { address: loc.address, lat: loc.lat, lng: loc.lng };
            }
            return prev;
          });
        }
      } catch (err) {
        console.warn('Initial device GPS notice:', err.message);
      }
    };
    fetchLiveGps();
    return () => { isMounted = false; };
  }, []);

  const handleLocateMe = async () => {
    try {
      const loc = await geoService.getCurrentLocationWithAddress();
      setCurrentMapCenter([loc.lat, loc.lng]);
      setPickup({ address: loc.address, lat: loc.lat, lng: loc.lng });
    } catch (err) {
      alert('Could not retrieve GPS location. Please check browser location permissions.');
    }
  };

  useEffect(() => {
    refreshCustomerState();
    const unsubscribe = dbService.subscribe(() => {
      refreshCustomerState();
    });
    return unsubscribe;
  }, [currentUser?.uid]);

  // Automatically display rating & invoice receipt when trip reaches 'completed'
  useEffect(() => {
    if (activeRide?.status === 'completed' && !activeRide?.feedback?.customerToDriverRating) {
      setShowRatingModal(true);
    }
  }, [activeRide?.status, activeRide?.feedback?.customerToDriverRating]);

  // Compute OSRM Route whenever pickup, stops, or dropoff change
  useEffect(() => {
    let isCancelled = false;

    const computeRoute = async () => {
      if (!pickup?.lat || !dropoff?.lat) return;

      const waypoints = [
        pickup,
        ...stops.filter((s) => s.lat && s.lng),
        dropoff,
      ];

      try {
        const stats = await calculateOSRMRoute(waypoints);
        if (!isCancelled && stats) {
          setRouteStats(stats);
        }
      } catch (err) {
        console.error('Route calculation error:', err);
      }
    };

    const timer = setTimeout(computeRoute, 300);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [pickup, stops, dropoff]);

  // Dynamic Driver-to-Pickup Route & ETA computation for accepted ride
  useEffect(() => {
    if (!activeRide || activeRide.status !== 'accepted') {
      setDriverEnRouteStats(null);
      return;
    }

    const assignedDriverPos =
      activeRide.currentDriverPosition ||
      onlineDrivers.find((d) => d.uid === activeRide.driverId)?.currentLocation;

    if (!assignedDriverPos?.lat || !activeRide.pickup?.lat) return;

    let isCancelled = false;

    const computeDriverRoute = async () => {
      try {
        const stats = await calculateOSRMRoute([
          { lat: assignedDriverPos.lat, lng: assignedDriverPos.lng },
          { lat: activeRide.pickup.lat, lng: activeRide.pickup.lng },
        ]);
        if (!isCancelled && stats) {
          setDriverEnRouteStats(stats);
        }
      } catch (err) {
        console.warn('En-route OSRM calculation error:', err);
      }
    };

    computeDriverRoute();

    return () => {
      isCancelled = true;
    };
  }, [
    activeRide?.status,
    activeRide?.driverId,
    activeRide?.currentDriverPosition?.lat,
    activeRide?.currentDriverPosition?.lng,
    activeRide?.pickup?.lat,
    activeRide?.pickup?.lng,
  ]);

  // Multi-stop handlers
  const handleAddStop = () => {
    if (stops.length >= 5) return;
    const newStop = {
      id: `stop-${Date.now()}`,
      address: 'Barakhamba Road, New Delhi',
      lat: 28.6300 + stops.length * 0.005,
      lng: 77.2240 + stops.length * 0.005,
    };
    setStops([...stops, newStop]);
  };

  const handleUpdateStop = (id, newStopData) => {
    setStops(stops.map((s) => (s.id === id ? { ...s, ...newStopData } : s)));
  };

  const handleRemoveStop = (id) => {
    setStops(stops.filter((s) => s.id !== id));
  };

  const handleReorderStops = (fromIndex, toIndex) => {
    const updated = [...stops];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setStops(updated);
  };

  // Center pin drop handler
  const handleTogglePinDropMode = async (field) => {
    if (isPinDropMode) {
      const [lat, lng] = currentMapCenter;
      const addr = await reverseGeocode(lat, lng);

      if (activePinField === 'pickup') {
        setPickup({ address: addr, lat, lng });
      } else if (activePinField === 'dropoff') {
        setDropoff({ address: addr, lat, lng });
      } else {
        handleUpdateStop(activePinField, { address: addr, lat, lng });
      }
      setIsPinDropMode(false);
    } else {
      setActivePinField(field || 'dropoff');
      setIsPinDropMode(true);
    }
  };

  // BOOKING HANDLERS ACROSS ALL 5 MODES:

  // 1. Daily Ride Booking
  const handleConfirmDailyBooking = ({
    category,
    upfrontFare,
    originalFare,
    paymentMethod,
    isUberOneApplied,
    uberOneDiscountAmount,
    appliedPromo,
    surgeMultiplier,
  }) => {
    const newRide = dbService.createRide({
      customerId: currentUser.uid,
      customerName: currentUser.fullName,
      customerPhone: currentUser.phone,
      category,
      pickup,
      stops,
      dropoff,
      distanceKm: routeStats?.distanceKm || 5,
      durationMins: routeStats?.durationMins || 15,
      upfrontFare,
      paymentMethod,
      bookingMode: 'daily',
      riderInfo,
      isUberOneApplied,
      uberOneDiscountAmount,
      appliedPromo,
      profileMode,
      businessDetails: profileMode === 'business' ? currentUser?.businessProfile : null,
      surgeMultiplier,
      polylineCoords: routeStats?.polylineCoords || [],
    });

    setActiveRide(newRide);
    setShowBookingSheet(false);
  };

  // 2. Reserve (Scheduled Ride) Booking
  const handleConfirmReservation = ({ scheduledPickupTime, reservationFee, formattedDate }) => {
    const newRide = dbService.createRide({
      customerId: currentUser.uid,
      customerName: currentUser.fullName,
      customerPhone: currentUser.phone,
      category: 'Uber Premier',
      pickup,
      dropoff,
      distanceKm: routeStats?.distanceKm || 8,
      durationMins: routeStats?.durationMins || 20,
      upfrontFare: (routeStats?.distanceKm ? Math.round(routeStats.distanceKm * 18 + 65) : 220) + reservationFee,
      paymentMethod: 'Cash',
      bookingMode: 'reserve',
      riderInfo,
      reserveDetails: {
        scheduledPickupTime,
        reservationFee,
      },
      polylineCoords: routeStats?.polylineCoords || [],
    });

    setShowReserveModal(false);
    refreshCustomerState();
    alert(`📅 Ride Reserved Successfully for ${formattedDate}!\n\nYour ride is locked upfront and added to 'Upcoming Reservations'. You can test activate it anytime!`);
  };

  // 3. Rentals Booking
  const handleConfirmRentalsBooking = ({ category, upfrontFare, paymentMethod, rentalDetails }) => {
    const newRide = dbService.createRide({
      customerId: currentUser.uid,
      customerName: currentUser.fullName,
      customerPhone: currentUser.phone,
      category,
      pickup,
      dropoff: { address: 'Multiple Local Stops (Hourly Rental)', lat: pickup.lat, lng: pickup.lng },
      distanceKm: rentalDetails.includedKm,
      durationMins: rentalDetails.packageHours * 60,
      upfrontFare,
      paymentMethod,
      bookingMode: 'rentals',
      riderInfo,
      rentalDetails,
      polylineCoords: routeStats?.polylineCoords || [],
    });

    setActiveRide(newRide);
  };

  // 4. Intercity Booking
  const handleConfirmIntercityBooking = ({ category, upfrontFare, paymentMethod, dropoff: outstationDropoff, intercityDetails }) => {
    const newRide = dbService.createRide({
      customerId: currentUser.uid,
      customerName: currentUser.fullName,
      customerPhone: currentUser.phone,
      category,
      pickup,
      dropoff: outstationDropoff,
      distanceKm: intercityDetails.distanceKm,
      durationMins: Math.round(intercityDetails.distanceKm * 1.5),
      upfrontFare,
      paymentMethod,
      bookingMode: 'intercity',
      riderInfo,
      intercityDetails,
      polylineCoords: routeStats?.polylineCoords || [],
    });

    setActiveRide(newRide);
  };

  // 5. Courier / Connect Booking
  const handleConfirmCourierBooking = ({ category, upfrontFare, paymentMethod, courierDetails }) => {
    const newRide = dbService.createRide({
      customerId: currentUser.uid,
      customerName: currentUser.fullName,
      customerPhone: currentUser.phone,
      category,
      pickup,
      dropoff,
      distanceKm: routeStats?.distanceKm || 5,
      durationMins: routeStats?.durationMins || 15,
      upfrontFare,
      paymentMethod,
      bookingMode: 'courier',
      riderInfo,
      courierDetails,
      polylineCoords: routeStats?.polylineCoords || [],
    });

    setActiveRide(newRide);
  };

  // Cancel a scheduled ride
  const handleCancelScheduledRide = (rideId) => {
    dbService.cancelRide(rideId, 'Cancelled from scheduled drawer', 'customer');
    refreshCustomerState();
  };

  // Check if an accepted/in-progress ride is active
  const isRideActive = Boolean(
    activeRide && ['accepted', 'arrived', 'in_progress'].includes(activeRide.status)
  );

  // Map Markers: Isolate assigned driver when a ride is active
  const markers = [];

  if (isRideActive) {
    // 1. Pickup Pin
    if (activeRide.pickup?.lat && activeRide.pickup?.lng) {
      markers.push({
        id: 'pickup-marker',
        position: [activeRide.pickup.lat, activeRide.pickup.lng],
        zIndexOffset: 1200,
        icon: createPickupIcon(),
        popupContent: (
          <div>
            <strong>Pickup Location</strong>
            <div>{activeRide.pickup.address}</div>
          </div>
        ),
      });
    }

    // 2. Dropoff Destination (Only visible when trip is in progress to keep focus on driver arrival)
    if (activeRide.status === 'in_progress' && activeRide.dropoff?.lat && activeRide.dropoff?.lng) {
      markers.push({
        id: 'dropoff-marker',
        position: [activeRide.dropoff.lat, activeRide.dropoff.lng],
        zIndexOffset: 1200,
        icon: createDropoffIcon(),
        popupContent: (
          <div>
            <strong>Destination</strong>
            <div>{activeRide.dropoff.address}</div>
          </div>
        ),
      });
    }

    // 3. ONLY THE ASSIGNED DRIVER WHO ACCEPTED THE TRIP
    const assignedDriverPos =
      activeRide.currentDriverPosition ||
      onlineDrivers.find((d) => d.uid === activeRide.driverId)?.currentLocation;

    if (assignedDriverPos?.lat && assignedDriverPos?.lng) {
      const category = activeRide.vehicleDetails?.category || activeRide.category || 'Uber Go';
      const heading = assignedDriverPos.heading || 0;
      const etaMins = driverEnRouteStats?.durationMins ?? Math.max(1, Math.round((driverEnRouteStats?.distanceKm || 1) * 3));
      const distKm = driverEnRouteStats?.distanceKm || '1.0';

      markers.push({
        id: `assigned-driver-${activeRide.driverId}`,
        position: [assignedDriverPos.lat, assignedDriverPos.lng],
        zIndexOffset: 1500, // Top priority above all map pins
        icon: createVehicleIcon(category, heading, true),
        popupContent: (
          <div className="p-1">
            <strong className="text-sm font-bold text-black">{activeRide.driverName || 'Driver Partner'}</strong>
            <div className="text-xs text-neutral-600">{category} • {activeRide.vehicleDetails?.plateNumber}</div>
            <div className="mt-1 text-xs font-bold text-emerald-600">
              {activeRide.status === 'arrived'
                ? 'Driver has arrived at pickup point'
                : activeRide.status === 'in_progress'
                ? 'Trip in progress'
                : `Arriving in ~${etaMins} mins (${distKm} km)`}
            </div>
          </div>
        ),
      });
    }
  } else {
    // Normal booking stage: Render pickup, intermediate stops, dropoff, and online drivers
    if (pickup?.lat && pickup?.lng) {
      markers.push({
        id: 'pickup-marker',
        position: [pickup.lat, pickup.lng],
        zIndexOffset: 1200,
        icon: createPickupIcon(),
        popupContent: <div>Pickup: {pickup.address}</div>,
      });
    }

    stops.forEach((stop, index) => {
      if (stop.lat && stop.lng) {
        markers.push({
          id: stop.id,
          position: [stop.lat, stop.lng],
          zIndexOffset: 1000,
          icon: createStopIcon(index + 1),
          popupContent: <div>Stop {index + 1}: {stop.address}</div>,
        });
      }
    });

    if (dropoff?.lat && dropoff?.lng) {
      markers.push({
        id: 'dropoff-marker',
        position: [dropoff.lat, dropoff.lng],
        zIndexOffset: 1200,
        icon: createDropoffIcon(),
        popupContent: <div>Dropoff: {dropoff.address}</div>,
      });
    }

    onlineDrivers.forEach((driver) => {
      if (driver.currentLocation?.lat && driver.currentLocation?.lng) {
        const isOverPickup = pickup?.lat && Math.abs(driver.currentLocation.lat - pickup.lat) < 0.0003 && Math.abs(driver.currentLocation.lng - pickup.lng) < 0.0003;
        const isOverDropoff = dropoff?.lat && Math.abs(driver.currentLocation.lat - dropoff.lat) < 0.0003 && Math.abs(driver.currentLocation.lng - dropoff.lng) < 0.0003;
        if (isOverPickup || isOverDropoff) return;

        markers.push({
          id: `driver-${driver.uid}`,
          position: [driver.currentLocation.lat, driver.currentLocation.lng],
          zIndexOffset: 100,
          icon: createVehicleIcon(
            driver.vehicleDetails?.category || 'Uber Go',
            driver.currentLocation.heading || 0,
            true
          ),
          popupContent: (
            <div>
              <strong>{driver.fullName}</strong>
              <div>{driver.vehicleDetails?.category} • {driver.vehicleDetails?.plateNumber}</div>
            </div>
          ),
        });
      }
    });
  }

  // Active Polyline: Driver to Pickup when accepted, or Trip route when in progress
  const activePolyline = isRideActive
    ? (activeRide.status === 'accepted'
        ? (driverEnRouteStats?.polylineCoords || null)
        : (activeRide.polylineCoords || routeStats?.polylineCoords || null))
    : (routeStats?.polylineCoords || null);

  return (
    <div className="relative w-full h-[calc(100vh-65px)] overflow-hidden bg-[#F8F9FA] flex flex-col md:flex-row">
      {/* Map View Container */}
      <div className="w-full h-[38vh] sm:h-[44vh] md:h-full relative z-0 flex-1 order-1 md:order-2">
        <MapView
          center={currentMapCenter}
          zoom={14}
          markers={markers}
          polyline={activePolyline}
          fitBoundsOnPolyline={!isPinDropMode}
          onCenterChange={setCurrentMapCenter}
          onLocateMe={handleLocateMe}
          showCenterCrosshair={isPinDropMode}
          className="w-full h-full"
        />

        {/* Top Floating Controls: Mode Selector & Telemetry Badge */}
        <div className="absolute top-4 left-4 right-4 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pointer-events-none">
          {/* Mode Selector Bar */}
          <div className="pointer-events-auto">
            <ModeSelectorBar activeMode={activeMode} onSelectMode={setActiveMode} />
          </div>

          {/* Right Action Icons */}
          <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto pointer-events-auto">
            {/* Personal vs Business Mode Pill */}
            <div className="bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-uber border border-neutral-200 flex items-center space-x-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setProfileMode('personal');
                  if (currentUser?.uid) {
                    dbService.updateUserProfileMode(currentUser.uid, 'personal');
                  }
                }}
                className={`px-2.5 py-1 rounded-xl transition flex items-center space-x-1 ${
                  profileMode === 'personal'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-neutral-500 hover:text-black'
                }`}
              >
                <Briefcase className="w-3 h-3" />
                <span>Personal</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfileMode('business');
                  if (!currentUser?.businessProfile?.companyName) {
                    setShowBusinessModal(true);
                  } else if (currentUser?.uid) {
                    dbService.updateUserProfileMode(currentUser.uid, 'business');
                  }
                }}
                className={`px-2.5 py-1 rounded-xl transition flex items-center space-x-1 ${
                  profileMode === 'business'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-neutral-500 hover:text-black'
                }`}
              >
                <Building2 className="w-3 h-3" />
                <span>Business</span>
              </button>
            </div>

            {/* Uber One Gold Crown Button */}
            <button
              type="button"
              onClick={() => setShowUberOneModal(true)}
              className={`px-3 py-1.5 rounded-2xl shadow-uber border transition flex items-center space-x-1.5 text-xs font-bold ${
                currentUser?.uberOneSubscription?.isActive
                  ? 'bg-amber-400 text-black border-amber-300 ring-2 ring-amber-400/30'
                  : 'bg-white/95 hover:bg-neutral-100 text-neutral-800 border-neutral-200'
              }`}
              title="Uber One VIP Membership"
            >
              <Crown className={`w-3.5 h-3.5 ${currentUser?.uberOneSubscription?.isActive ? 'fill-black' : 'text-amber-500'}`} />
              <span>{currentUser?.uberOneSubscription?.isActive ? 'Uber One' : 'Get Uber One'}</span>
            </button>

            {/* Uber for Teens Button */}
            <button
              type="button"
              onClick={() => setShowTeensModal(true)}
              className="bg-white/95 hover:bg-neutral-100 text-purple-900 px-3 py-1.5 rounded-2xl shadow-uber border border-purple-200 transition flex items-center space-x-1.5 text-xs font-bold"
              title="Uber for Teens Guardian Mode"
            >
              <Users className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden sm:inline">Teens</span>
            </button>

            {/* Wallet Button */}
            <button
              type="button"
              onClick={() => setShowWalletModal(true)}
              className="bg-white/95 hover:bg-neutral-100 text-neutral-900 px-3 py-1.5 rounded-2xl shadow-uber border border-neutral-200 transition flex items-center space-x-1.5 text-xs font-bold"
              title="Uber Cash Wallet"
            >
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>₹{currentUser?.walletBalance || 0}</span>
            </button>

            {/* Past Rides Activity */}
            <button
              type="button"
              onClick={() => setShowActivityModal(true)}
              className="bg-white/95 hover:bg-neutral-100 text-neutral-900 px-3 py-1.5 rounded-2xl shadow-uber border border-neutral-200 transition flex items-center space-x-1.5 text-xs font-bold"
              title="Activity & Invoices"
            >
              <Clock className="w-4 h-4 text-neutral-700" />
              <span className="hidden sm:inline">Activity</span>
            </button>

            {activeRide && ['accepted', 'arrived', 'in_progress'].includes(activeRide.status) && (
              <button
                type="button"
                onClick={() => setShowSafetyToolkit(true)}
                className="bg-uber-blue hover:bg-blue-600 text-white px-3 py-1.5 rounded-2xl shadow-uber transition flex items-center space-x-1.5 text-xs font-bold animate-in zoom-in"
                title="Uber Safety Toolkit"
              >
                <ShieldCheck className="w-4 h-4 text-white" />
                <span className="hidden sm:inline">Safety</span>
              </button>
            )}

            <div className="hidden md:flex bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-uber border border-neutral-200 text-xs font-bold text-neutral-800 items-center space-x-2">
              {isRideActive ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-blue-900 font-extrabold">Assigned Driver Connected</span>
                </>
              ) : (
                <>
                  <span className={`w-2 h-2 rounded-full ${onlineDrivers.length > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'}`} />
                  <span>{onlineDrivers.length} {onlineDrivers.length === 1 ? 'Driver' : 'Drivers'} Available</span>
                </>
              )}
            </div>

            <button
              onClick={onOpenProfile}
              className="bg-black hover:bg-neutral-800 text-white p-2 rounded-2xl shadow-uber transition"
              title="Profile & Safety Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real-Time Live Driver Arrival & Navigation Floating HUD */}
        {!isPinDropMode && isRideActive && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 pointer-events-auto">
            {activeRide.status === 'accepted' && (
              <div className="bg-black/95 text-white px-5 py-3 rounded-2xl shadow-2xl border border-neutral-700 flex items-center space-x-3 text-xs animate-in slide-in-from-top-2 max-w-[92vw]">
                <div className="relative flex items-center justify-center shrink-0">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping absolute" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 relative" />
                </div>
                <div className="truncate">
                  <div className="font-extrabold text-sm text-white flex items-center space-x-2">
                    <span>Driver arriving in {driverEnRouteStats?.durationMins ?? Math.max(1, Math.round((driverEnRouteStats?.distanceKm || 1) * 3))} mins</span>
                    <span className="text-[10px] text-neutral-400 font-mono">({driverEnRouteStats?.distanceKm || '1.0'} km away)</span>
                  </div>
                  <div className="text-[11px] text-neutral-300 truncate">
                    {activeRide.driverName} • {activeRide.vehicleDetails?.makeModel || activeRide.category} ({activeRide.vehicleDetails?.plateNumber})
                  </div>
                </div>
              </div>
            )}

            {activeRide.status === 'arrived' && (
              <div className="bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-400 flex items-center space-x-3 text-xs animate-in slide-in-from-top-2 max-w-[92vw]">
                <CheckCircle2 className="w-5 h-5 text-white animate-bounce flex-shrink-0" />
                <div>
                  <div className="font-extrabold text-sm text-white">Driver Has Arrived at Pickup!</div>
                  <div className="text-[11px] text-emerald-100 flex items-center space-x-1.5 mt-0.5">
                    <span>Share 4-Digit PIN with driver:</span>
                    <strong className="bg-black text-amber-400 px-2 py-0.5 rounded font-mono text-xs tracking-widest">{activeRide.verificationPin}</strong>
                  </div>
                </div>
              </div>
            )}

            {activeRide.status === 'in_progress' && (
              <div className="bg-neutral-900/95 text-white px-5 py-3 rounded-2xl shadow-2xl border border-neutral-700 flex items-center space-x-3 text-xs animate-in slide-in-from-top-2 max-w-[92vw]">
                <Navigation className="w-4 h-4 text-uber-blue animate-pulse flex-shrink-0" />
                <div>
                  <div className="font-extrabold text-sm text-white">
                    On Trip to Destination
                  </div>
                  <div className="text-[11px] text-neutral-300">
                    Heading to {activeRide.dropoff.address.slice(0, 30)}...
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pin Drop Mode Banner */}
        {isPinDropMode && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 bg-black text-white px-5 py-2.5 rounded-2xl shadow-2xl border border-neutral-700 flex items-center space-x-3 text-xs animate-in slide-in-from-top-2">
            <MapPin className="w-4 h-4 text-emerald-400 animate-bounce" />
            <span>
              Drag map to position pin for <strong>{activePinField.toUpperCase()}</strong>
            </span>
            <button
              onClick={() => handleTogglePinDropMode()}
              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl text-[11px] transition shadow"
            >
              Confirm Spot
            </button>
          </div>
        )}
      </div>

      {/* Left/Floating Dynamic Route & Booking Panel (Source & Destination) */}
      <div className="w-full md:w-[450px] md:max-w-[480px] p-4 sm:p-5 z-20 flex flex-col justify-start overflow-y-auto max-h-[60vh] md:max-h-full space-y-4 order-2 md:order-1 bg-white md:bg-[#FAFAFA] md:border-r border-neutral-200 shrink-0 shadow-lg md:shadow-none">
        {/* Switch Rider ("For Me" vs "Book for Someone Else") Header - Only visible before booking */}
        {!activeRide && (
          <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-uber border border-neutral-200 flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-700">Rider Profile:</span>
            <RiderSelectorModal
              riderInfo={riderInfo}
              onUpdateRiderInfo={setRiderInfo}
              currentUser={currentUser}
            />
          </div>
        )}

        {/* Guest Rider Active Banner */}
        {!activeRide && !riderInfo.isForSelf && (
          <div className="bg-amber-50 border border-amber-300 p-3.5 rounded-2xl text-xs text-amber-900 flex items-center justify-between animate-in fade-in shadow-sm">
            <div>
              <strong>Booking for Guest:</strong> {riderInfo.riderName} ({riderInfo.riderPhone})
              <div className="text-[10px] text-amber-700 mt-0.5">Trip alerts & 4-Digit PIN will be sent to their phone.</div>
            </div>
          </div>
        )}

        {/* Guardian Alert Banner for Active Teen Ride */}
        {activeRide?.isTeenRide && (
          <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-3.5 rounded-2xl border border-purple-400 shadow-xl space-y-1.5 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <span className="font-black text-xs text-purple-300 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-300" />
                <span>GUARDIAN ALERT: TEEN IN-TRANSIT</span>
              </span>
              <span className="bg-purple-700 font-mono text-[10px] font-black px-2 py-0.5 rounded-full border border-purple-500">
                PIN: {activeRide.verificationPin}
              </span>
            </div>
            <p className="text-[11px] text-purple-100">
              Your teen is travelling with Top-Rated Driver <strong>{activeRide.driverName || 'Partner'}</strong>. Live GPS tracking and audio recording are active.
            </p>
          </div>
        )}

        {/* CASE 1: ACTIVE RIDE IN PROGRESS OR SEARCHING */}
        {activeRide ? (
          <ActiveRideOverlay
            ride={activeRide}
            driverEnRouteStats={driverEnRouteStats}
            onDismiss={() => {
              setActiveRide(null);
              refreshCustomerState();
            }}
            onTriggerSOS={() => setShowSafetyToolkit(true)}
            onOpenChat={() => setShowChatDrawer(true)}
            onOpenCall={() => dbService.startMaskedCall(activeRide.rideId, 'customer')}
            onOpenSafetyToolkit={() => setShowSafetyToolkit(true)}
            onTriggerRideCheck={() => dbService.triggerRideCheck(activeRide.rideId, 'long_stop')}
            onOpenSplitFare={() => setShowSplitFareModal(true)}
            onOpenRatingModal={() => setShowRatingModal(true)}
          />
        ) : (
          /* CASE 2: DYNAMIC MODE SHEET ACCORDING TO activeMode */
          <>
            {/* MODE 1: DAILY RIDE */}
            {activeMode === 'daily' && (
              showBookingSheet ? (
                <RideBookingSheet
                  distanceKm={routeStats?.distanceKm || 5}
                  durationMins={routeStats?.durationMins || 15}
                  stopCount={stops.length}
                  pickup={pickup}
                  dropoff={dropoff}
                  currentUser={currentUser}
                  onConfirmBooking={handleConfirmDailyBooking}
                  onClose={() => setShowBookingSheet(false)}
                />
              ) : (
                <MultiStopRouteBuilder
                  pickup={pickup}
                  stops={stops}
                  dropoff={dropoff}
                  routeStats={routeStats}
                  onUpdatePickup={setPickup}
                  onAddStop={handleAddStop}
                  onUpdateStop={handleUpdateStop}
                  onRemoveStop={handleRemoveStop}
                  onReorderStops={handleReorderStops}
                  onUpdateDropoff={setDropoff}
                  onTogglePinDropMode={handleTogglePinDropMode}
                  isPinDropMode={isPinDropMode}
                  activePinField={activePinField}
                  userSavedAddresses={currentUser?.savedAddresses}
                  onProceedToModule3={() => setShowBookingSheet(true)}
                />
              )
            )}

            {/* MODE 2: UBER RESERVE (SCHEDULED RIDES) */}
            {activeMode === 'reserve' && (
              <div className="bg-white rounded-3xl shadow-uber-lg border border-neutral-200 p-5 space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                    Uber Reserve
                  </span>
                  <h3 className="text-base font-bold text-neutral-900">
                    Schedule a Ride up to 90 Days Ahead
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Lock in your price with 15 mins free wait time included.
                  </p>
                </div>

                <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2 text-xs">
                  <div>
                    <span className="text-neutral-500 font-semibold">Pickup:</span>
                    <div className="font-bold text-neutral-900 truncate">{pickup.address}</div>
                  </div>
                  <div>
                    <span className="text-neutral-500 font-semibold">Destination:</span>
                    <div className="font-bold text-neutral-900 truncate">{dropoff.address}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowReserveModal(true)}
                  className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-lg transition"
                >
                  Pick Reservation Date & Time
                </button>
              </div>
            )}

            {/* MODE 3: UBER RENTALS */}
            {activeMode === 'rentals' && (
              <RentalsPackageSheet
                pickup={pickup}
                onConfirmRental={handleConfirmRentalsBooking}
                onClose={() => setActiveMode('daily')}
              />
            )}

            {/* MODE 4: UBER INTERCITY */}
            {activeMode === 'intercity' && (
              <IntercityBookingSheet
                pickup={pickup}
                onConfirmIntercity={handleConfirmIntercityBooking}
                onClose={() => setActiveMode('daily')}
              />
            )}

            {/* MODE 5: UBER CONNECT (COURIER) */}
            {activeMode === 'courier' && (
              <CourierBookingSheet
                pickup={pickup}
                dropoff={dropoff}
                distanceKm={routeStats?.distanceKm || 5}
                currentUser={currentUser}
                onConfirmCourier={handleConfirmCourierBooking}
                onClose={() => setActiveMode('daily')}
              />
            )}

            {/* UPCOMING RESERVATIONS DRAWER (If any exist) */}
            <UpcomingReservationsDrawer
              scheduledRides={scheduledRides}
              onCancelRide={handleCancelScheduledRide}
            />
          </>
        )}
      </div>

      {/* RESERVE DATE & TIME PICKER MODAL */}
      {showReserveModal && (
        <ReserveDatePickerModal
          onConfirmReservation={handleConfirmReservation}
          onClose={() => setShowReserveModal(false)}
        />
      )}

      {/* IN-APP CHAT DRAWER */}
      {showChatDrawer && activeRide && (
        <InAppChatDrawer
          ride={activeRide}
          currentRole="customer"
          currentUserName={currentUser?.fullName || 'Customer'}
          onClose={() => setShowChatDrawer(false)}
          onTriggerCall={() => dbService.startMaskedCall(activeRide.rideId, 'customer')}
        />
      )}

      {/* MASKED PRIVACY CALL OVERLAY */}
      {activeRide?.maskedCallState?.isActive && (
        <MaskedCallOverlay
          ride={activeRide}
          currentRole="customer"
          onClose={() => dbService.endMaskedCall(activeRide.rideId)}
        />
      )}

      {/* SAFETY TOOLKIT MODAL */}
      {showSafetyToolkit && activeRide && (
        <SafetyToolkitModal
          ride={activeRide}
          currentUser={currentUser}
          currentRole="customer"
          onClose={() => setShowSafetyToolkit(false)}
        />
      )}

      {/* RIDECHECK ANOMALY MODAL */}
      {activeRide?.rideCheckStatus?.anomalyDetected && (
        <RideCheckModal
          ride={activeRide}
          onDismiss={() => refreshCustomerState()}
        />
      )}

      {/* MODULE 6: UBER CASH WALLET MODAL */}
      {showWalletModal && (
        <UberCashModal
          currentUser={currentUser}
          onClose={() => {
            setShowWalletModal(false);
            refreshCustomerState();
          }}
        />
      )}

      {/* MODULE 6: PAST TRIPS ACTIVITY & TAX INVOICE MODAL */}
      {showActivityModal && (
        <ActivityTripsModal
          customerId={currentUser?.uid}
          onClose={() => setShowActivityModal(false)}
        />
      )}

      {/* MODULE 6: SPLIT FARE WITH FRIENDS MODAL */}
      {showSplitFareModal && activeRide && (
        <SplitFareModal
          ride={activeRide}
          onClose={() => {
            setShowSplitFareModal(false);
            refreshCustomerState();
          }}
        />
      )}

      {/* MODULE 6: POST-RIDE INVOICE, RATING & TIPPING MODAL */}
      {showRatingModal && activeRide && (
        <PostRideRatingModal
          ride={activeRide}
          currentUser={currentUser}
          onClose={() => {
            setShowRatingModal(false);
            refreshCustomerState();
          }}
        />
      )}

      {/* MODULE 7: UBER ONE MEMBERSHIP HUB MODAL */}
      {showUberOneModal && (
        <UberOneHubModal
          currentUser={currentUser}
          onClose={() => setShowUberOneModal(false)}
          onUpdated={() => {
            refreshUser();
            refreshCustomerState();
          }}
        />
      )}

      {/* MODULE 7: BUSINESS PROFILE SETUP MODAL */}
      {showBusinessModal && (
        <BusinessProfileModal
          currentUser={currentUser}
          onClose={() => setShowBusinessModal(false)}
          onUpdated={() => {
            refreshUser();
            refreshCustomerState();
          }}
        />
      )}

      {/* UBER FOR TEENS (GUARDIAN FAMILY HUB) */}
      {showTeensModal && (
        <UberForTeensModal
          currentUser={currentUser}
          onClose={() => setShowTeensModal(false)}
          onUpdated={() => {
            refreshUser();
            refreshCustomerState();
          }}
        />
      )}
    </div>
  );
};
