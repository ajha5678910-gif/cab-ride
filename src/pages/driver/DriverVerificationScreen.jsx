import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db';
import { geoService } from '../../services/geolocationService';
import { MapView } from '../../components/map/MapView';
import { 
  createDriverGPSIcon, 
  createPickupIcon, 
  createDropoffIcon, 
  createStopIcon 
} from '../../components/map/MapMarkers';
import { IncomingRideAlertModal } from '../../components/driver/IncomingRideAlertModal';
import { PinVerificationKeypad } from '../../components/driver/PinVerificationKeypad';
import { InAppChatDrawer } from '../../components/chat/InAppChatDrawer';
import { MaskedCallOverlay } from '../../components/call/MaskedCallOverlay';
import { SafetyToolkitModal } from '../../components/safety/SafetyToolkitModal';
import { RideCheckModal } from '../../components/safety/RideCheckModal';
import { DriverEarningsModal } from '../../components/driver/DriverEarningsModal';
import { RateCustomerModal } from '../../components/driver/RateCustomerModal';
import { DriverLostItemBanner } from '../../components/driver/DriverLostItemBanner';
import { 
  Clock, 
  XCircle, 
  CheckCircle2, 
  Car, 
  Power, 
  DollarSign, 
  Star, 
  ShieldCheck, 
  AlertTriangle, 
  Radio, 
  Play, 
  Square, 
  Compass, 
  Navigation, 
  Sparkles, 
  KeyRound, 
  Package, 
  CalendarClock, 
  Hourglass, 
  User, 
  Check,
  Phone,
  MessageSquare,
  Wallet,
  LogOut
} from 'lucide-react';

export const DriverVerificationScreen = ({ onEditKYC }) => {
  const { currentUser, refreshUser, logout } = useAuth();
  const [togglingOnline, setTogglingOnline] = useState(false);

  // Active Assigned Ride for this driver
  const [assignedRide, setAssignedRide] = useState(null);

  // Communication & Safety Modals
  const [showDriverChat, setShowDriverChat] = useState(false);
  const [showDriverSafetyToolkit, setShowDriverSafetyToolkit] = useState(false);

  // Financial Earnings & Rating Modals
  const [showEarningsModal, setShowEarningsModal] = useState(false);
  const [showRateCustomerModal, setShowRateCustomerModal] = useState(false);
  const [completedRideToRate, setCompletedRideToRate] = useState(null);

  // Pending incoming ride alert (for 15s modal)
  const [incomingRide, setIncomingRide] = useState(null);

  // Scheduled rides pool
  const [scheduledRides, setScheduledRides] = useState([]);
  const [showScheduledPool, setShowScheduledPool] = useState(false);

  // PIN keypad modal toggle
  const [showPinPad, setShowPinPad] = useState(false);
  const [pinMode, setPinMode] = useState('pickup'); // 'pickup' | 'delivery'

  // Driver GPS coordinates
  const driverLat = currentUser?.currentLocation?.lat || 28.6289;
  const driverLng = currentUser?.currentLocation?.lng || 77.2195;
  const driverHeading = currentUser?.currentLocation?.heading || 0;

  // Real-world Live Hardware GPS State
  const [gpsTrackingActive, setGpsTrackingActive] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [gpsSpeedKmh, setGpsSpeedKmh] = useState(0);
  const [gpsAddress, setGpsAddress] = useState(currentUser?.currentLocation?.address || '');

  if (!currentUser) return null;

  const isApproved = currentUser.verificationStatus === 'approved';
  const isRejected = currentUser.verificationStatus === 'rejected';
  const isPending = !isApproved && !isRejected;
  const isOnline = !!currentUser.isOnline;

  // Poll / Listen for rides and assignments
  const refreshDriverRides = () => {
    if (!currentUser?.uid) return;

    // Check for currently assigned active ride
    const currentActive = dbService.getActiveDriverRide(currentUser.uid);
    setAssignedRide(currentActive);

    // Get available scheduled rides
    const scheduled = dbService.getScheduledRides();
    setScheduledRides(scheduled);

    // If approved, online, and no active ride, look for searching rides
    if (isApproved && currentUser.isOnline && !currentActive) {
      const pending = dbService.getPendingRideForDriver(
        currentUser.uid,
        currentUser.vehicleDetails?.category
      );
      setIncomingRide(pending);
    } else {
      setIncomingRide(null);
    }
  };

  useEffect(() => {
    refreshDriverRides();
    const unsubscribe = dbService.subscribe(() => {
      refreshDriverRides();
    });
    return unsubscribe;
  }, [currentUser?.uid, currentUser?.isOnline]);

  // Continuous Real-World GPS Hardware Watcher
  useEffect(() => {
    if (!isOnline || !currentUser?.uid) {
      setGpsTrackingActive(false);
      return;
    }

    const unwatch = geoService.startLiveTracking(
      (coords) => {
        setGpsTrackingActive(true);
        setGpsAccuracy(coords.accuracy);
        setGpsSpeedKmh(coords.speedKmh);

        dbService.updateDriverLocation(currentUser.uid, {
          lat: coords.lat,
          lng: coords.lng,
          heading: coords.heading,
          speedKmh: coords.speedKmh,
          accuracy: coords.accuracy,
        });
      },
      (err) => {
        console.warn('Driver live GPS watch notice:', err.message);
      }
    );

    return () => {
      unwatch();
    };
  }, [isOnline, currentUser?.uid]);

  // Actions
  const handleToggleOnline = async () => {
    if (!isApproved) return;
    setTogglingOnline(true);
    const nextStatus = !isOnline;

    if (nextStatus) {
      try {
        const loc = await geoService.getCurrentLocationWithAddress();
        setGpsAccuracy(loc.accuracy);
        setGpsAddress(loc.address);
        dbService.updateDriverLocation(currentUser.uid, {
          lat: loc.lat,
          lng: loc.lng,
          heading: loc.heading || 0,
          accuracy: loc.accuracy,
          address: loc.address,
        });
      } catch (err) {
        console.warn('Initial GPS query when going online:', err.message);
      }
    }

    dbService.setDriverOnlineStatus(currentUser.uid, nextStatus);
    refreshUser();
    setTimeout(() => setTogglingOnline(false), 200);
  };

  const handleRecenterDriverGPS = async () => {
    try {
      const loc = await geoService.getCurrentLocationWithAddress();
      setGpsAccuracy(loc.accuracy);
      setGpsAddress(loc.address);
      dbService.updateDriverLocation(currentUser.uid, {
        lat: loc.lat,
        lng: loc.lng,
        heading: loc.heading || 0,
        accuracy: loc.accuracy,
        address: loc.address,
      });
      refreshUser();
    } catch (err) {
      alert('Could not detect device GPS: ' + err.message);
    }
  };

  // Accept incoming ride
  const handleAcceptRide = (rideId) => {
    try {
      const accepted = dbService.acceptRide(rideId, currentUser);
      setAssignedRide(accepted);
      setIncomingRide(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeclineRide = () => {
    setIncomingRide(null);
  };

  // Pre-claim & activate a scheduled ride immediately
  const handleClaimAndStartScheduled = (rideId) => {
    try {
      dbService.startScheduledRide(rideId);
      dbService.acceptRide(rideId, currentUser);
      refreshDriverRides();
      setShowScheduledPool(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDriverArrived = () => {
    if (!assignedRide) return;
    dbService.driverArrivedAtPickup(assignedRide.rideId);
  };

  // PIN Verification handler (Handles both Pickup PIN and Courier Delivery PIN)
  const handleVerifyPin = async (enteredPin) => {
    if (!assignedRide) return;

    if (pinMode === 'delivery' && assignedRide.bookingMode === 'courier') {
      const finished = await dbService.verifyCourierDeliveryPin(assignedRide.rideId, enteredPin);
      setShowPinPad(false);
      setCompletedRideToRate(finished || assignedRide);
      setShowRateCustomerModal(true);
      refreshUser();
    } else {
      await dbService.verifyPinAndStartTrip(assignedRide.rideId, enteredPin);
      setShowPinPad(false);
    }
  };

  const handleCompleteTrip = () => {
    if (!assignedRide) return;
    const finished = dbService.completeTrip(assignedRide.rideId);
    setCompletedRideToRate(finished || assignedRide);
    setShowRateCustomerModal(true);
    refreshUser();
  };

  // Map Markers
  const driverMarkers = [
    {
      id: `driver-gps-${currentUser.uid}`,
      position: [driverLat, driverLng],
      icon: createDriverGPSIcon(driverHeading),
      popupContent: <div>{currentUser.fullName} (Your Car)</div>,
    },
  ];

  if (assignedRide) {
    if (assignedRide.pickup?.lat) {
      driverMarkers.push({
        id: 'assigned-pickup',
        position: [assignedRide.pickup.lat, assignedRide.pickup.lng],
        icon: createPickupIcon(),
        popupContent: <div>Pickup: {assignedRide.pickup.address}</div>,
      });
    }

    (assignedRide.stops || []).forEach((stop, idx) => {
      if (stop.lat && stop.lng) {
        driverMarkers.push({
          id: `assigned-stop-${stop.id}`,
          position: [stop.lat, stop.lng],
          icon: createStopIcon(idx + 1),
          popupContent: <div>Stop {idx + 1}: {stop.address}</div>,
        });
      }
    });

    if (assignedRide.dropoff?.lat) {
      driverMarkers.push({
        id: 'assigned-dropoff',
        position: [assignedRide.dropoff.lat, assignedRide.dropoff.lng],
        icon: createDropoffIcon(),
        popupContent: <div>Dropoff: {assignedRide.dropoff.address}</div>,
      });
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* CASE 1: PENDING VERIFICATION */}
      {isPending && (
        <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-black text-white rounded-3xl p-6 sm:p-10 border border-neutral-800 shadow-uber-lg relative overflow-hidden">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <Clock className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-400 text-black">
                Verification in Progress
              </span>
              <h1 className="text-2xl font-bold mt-2 font-sans">
                Welcome, {currentUser.fullName}! Your Application is Under Review.
              </h1>
            </div>
          </div>
        </div>
      )}

      {/* CASE 2: REJECTED VERIFICATION */}
      {isRejected && (
        <div className="bg-red-50 border-2 border-red-500 rounded-3xl p-6 sm:p-8 shadow-uber">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 bg-red-200 text-red-900 rounded-full">
                KYC Verification Rejected
              </span>
              <h2 className="text-xl font-bold text-red-950 mt-1">
                Your Documents Were Not Approved
              </h2>
            </div>
            <button
              onClick={onEditKYC}
              className="px-5 py-2.5 bg-red-600 text-white font-bold rounded-xl text-xs"
            >
              Re-upload Documents
            </button>
          </div>
        </div>
      )}

      {/* CASE 3: APPROVED DRIVER */}
      {isApproved && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Bar with Online/Offline & Available Reservations Button */}
          <div className="bg-black text-white rounded-3xl p-6 shadow-uber-lg relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center space-x-4">
                <img
                  src={currentUser.profilePicUrl}
                  alt={currentUser.fullName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white/20 shadow-lg"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';
                  }}
                />

                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-extrabold">{currentUser.fullName}</h1>
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                      Verified Partner
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-neutral-400 mt-1">
                    <span className="flex items-center text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 mr-1 fill-amber-400 text-amber-400" />
                      {currentUser.rating?.toFixed(2) || '5.00'}
                    </span>
                    <span>•</span>
                    <span>{currentUser.vehicleDetails?.category}</span>
                    <span>•</span>
                    <span className="font-mono">{currentUser.vehicleDetails?.plateNumber}</span>
                  </div>
                </div>
              </div>

              {/* Toggles & Pre-Claim Drawer Button */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Available Reservations Button */}
                <button
                  type="button"
                  onClick={() => setShowScheduledPool(!showScheduledPool)}
                  className="px-4 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-neutral-700 font-bold text-xs flex items-center space-x-2 transition"
                >
                  <CalendarClock className="w-4 h-4" />
                  <span>Reserve Trips ({scheduledRides.length})</span>
                </button>

                {/* Driver Earnings & Payout Wallet */}
                <button
                  type="button"
                  onClick={() => setShowEarningsModal(true)}
                  className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-2 transition shadow-md"
                >
                  <Wallet className="w-4 h-4 text-emerald-200" />
                  <span>Earnings (₹{currentUser.walletBalance || 0})</span>
                </button>

                <button
                  onClick={handleToggleOnline}
                  disabled={togglingOnline || !!assignedRide}
                  className={`px-5 py-3 rounded-2xl font-bold text-xs transition-all flex items-center space-x-2.5 shadow-lg ${
                    isOnline
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white ring-4 ring-emerald-500/30'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
                  }`}
                >
                  <Power className={`w-4 h-4 ${isOnline ? 'animate-pulse' : 'text-neutral-400'}`} />
                  <span>{isOnline ? 'ONLINE • READY' : 'OFFLINE'}</span>
                </button>

                <button
                  onClick={logout}
                  className="px-4 py-3 rounded-2xl font-bold text-xs bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 transition flex items-center space-x-1.5 cursor-pointer"
                  title="Sign Out of Driver Partner Portal"
                >
                  <LogOut className="w-4 h-4 text-neutral-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Real-World Hardware GPS Telemetry Banner */}
          {isApproved && isOnline && (
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
              <div className="flex items-center space-x-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-emerald-300">Live Hardware GPS Stream Active:</span>
                <span className="text-neutral-300 truncate max-w-xs sm:max-w-md">
                  {currentUser?.currentLocation?.address || gpsAddress || 'Transmitting real coordinates'}
                </span>
              </div>
              <div className="flex items-center space-x-3 text-[11px] text-neutral-400 font-mono">
                <span>Lat: {(currentUser?.currentLocation?.lat || driverLat).toFixed(4)}</span>
                <span>Lng: {(currentUser?.currentLocation?.lng || driverLng).toFixed(4)}</span>
                <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md font-bold">
                  ±{gpsAccuracy || 5}m Accuracy
                </span>
                {gpsSpeedKmh > 0 && (
                  <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-md font-bold">
                    {gpsSpeedKmh} km/h
                  </span>
                )}
              </div>
            </div>
          )}

          {/* AVAILABLE SCHEDULED RESERVATIONS MODAL/DRAWER */}
          {showScheduledPool && (
            <div className="bg-neutral-900 text-white rounded-3xl p-5 border border-amber-500/50 shadow-2xl space-y-4 animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base flex items-center space-x-2">
                    <CalendarClock className="w-5 h-5 text-amber-400" />
                    <span>Available Uber Reserve Trips for Pre-Claim</span>
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Lock in guaranteed scheduled rides ahead of time. Accept trips that match your schedule.
                  </p>
                </div>
                <button
                  onClick={() => setShowScheduledPool(false)}
                  className="text-xs text-neutral-400 hover:text-white"
                >
                  ✕ Close
                </button>
              </div>

              {scheduledRides.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-400 bg-neutral-950 rounded-2xl">
                  No upcoming scheduled rides right now. Switch to the <strong>Customer App (Reserve Mode)</strong> to schedule one!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {scheduledRides.map((ride) => (
                    <div
                      key={ride.rideId}
                      className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2 text-xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-amber-300">
                          {ride.reserveDetails?.scheduledPickupTime
                            ? new Date(ride.reserveDetails.scheduledPickupTime).toLocaleString([], {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })
                            : 'Upcoming'}
                        </span>
                        <span className="font-black text-emerald-400 text-sm">
                          ₹{Math.round(ride.upfrontFare * 0.85)} Net
                        </span>
                      </div>

                      <div className="space-y-1 text-neutral-300 text-[11px]">
                        <div className="truncate"><strong className="text-emerald-500">From:</strong> {ride.pickup.address}</div>
                        <div className="truncate"><strong className="text-white">To:</strong> {ride.dropoff.address}</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleClaimAndStartScheduled(ride.rideId)}
                        className="w-full mt-2 py-2 bg-amber-400 hover:bg-amber-500 text-black font-extrabold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition shadow"
                      >
                        <Check className="w-3.5 h-3.5 text-black" />
                        <span>Accept & Claim Reservation</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Lost & Found Item Report Banner */}
          <DriverLostItemBanner driverId={currentUser.uid} />

          {/* ACTIVE ASSIGNED TRIP CONTROLS */}
          {assignedRide && (
            <div className="bg-neutral-950 text-white rounded-3xl p-6 border-2 border-uber-blue shadow-2xl space-y-6 animate-in slide-in-from-top-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-uber-blue text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                      {assignedRide.bookingMode?.toUpperCase()} • {assignedRide.status.toUpperCase()}
                    </span>
                    {assignedRide.riderInfo && !assignedRide.riderInfo.isForSelf && (
                      <span className="bg-amber-400 text-black text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                        Guest: {assignedRide.riderInfo.riderName}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold mt-1">
                    {assignedRide.riderInfo?.riderName || assignedRide.customerName} • {assignedRide.category}
                  </h2>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-emerald-400">
                    ₹{Math.round(assignedRide.upfrontFare * 0.85)}
                  </div>
                  <div className="text-xs text-neutral-400">Net Driver Payout</div>
                </div>
              </div>

              {/* In-Trip Communication & Safety Action Bar */}
              <div className="grid grid-cols-4 gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowDriverChat(true)}
                  className="relative py-2.5 px-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-2xl text-[11px] flex flex-col items-center justify-center space-y-1 transition border border-neutral-800 shadow"
                >
                  <MessageSquare className="w-4 h-4 text-neutral-300" />
                  <span>Chat</span>
                  {assignedRide.chatMessages?.filter((m) => m.senderRole !== 'driver' && !m.isRead).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center">
                      {assignedRide.chatMessages.filter((m) => m.senderRole !== 'driver' && !m.isRead).length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => dbService.startMaskedCall(assignedRide.rideId, 'driver')}
                  className="py-2.5 px-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-2xl text-[11px] flex flex-col items-center justify-center space-y-1 transition border border-neutral-800 shadow"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Masked Call</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowDriverSafetyToolkit(true)}
                  className="py-2.5 px-2 bg-blue-950/70 hover:bg-blue-900 text-cyan-300 font-bold rounded-2xl text-[11px] flex flex-col items-center justify-center space-y-1 transition border border-blue-500/40 shadow"
                >
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Safety Toolkit</span>
                </button>

                <button
                  type="button"
                  onClick={() => dbService.triggerRideCheck(assignedRide.rideId, 'long_stop')}
                  className="py-2.5 px-2 bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 font-bold rounded-2xl text-[11px] flex flex-col items-center justify-center space-y-1 transition border border-amber-500/40 shadow"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>RideCheck</span>
                </button>
              </div>

              {/* COURIER SPECIALIZED BANNER */}
              {assignedRide.bookingMode === 'courier' && (
                <div className="bg-emerald-950/40 border border-emerald-500/50 p-4 rounded-2xl space-y-2 text-xs">
                  <div className="font-bold text-emerald-300 flex items-center space-x-1.5">
                    <Package className="w-4 h-4 text-emerald-400" />
                    <span>Courier Package Details:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-300">
                    <div><strong>Category:</strong> {assignedRide.courierDetails?.packageCategory} ({assignedRide.courierDetails?.packageWeightKg} kg)</div>
                    <div><strong>Recipient:</strong> {assignedRide.courierDetails?.receiverName} ({assignedRide.courierDetails?.receiverPhone})</div>
                  </div>
                </div>
              )}

              {/* STAGE 1: ACCEPTED -> NAVIGATE TO PICKUP */}
              {assignedRide.status === 'accepted' && (
                <div className="space-y-4">
                  <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 flex items-start space-x-3">
                    <Navigation className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-neutral-400">
                        {assignedRide.bookingMode === 'courier' ? 'Package Pickup Point:' : 'Customer Pickup Location:'}
                      </div>
                      <div className="text-sm font-bold text-white mt-0.5">
                        {assignedRide.pickup.address}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleDriverArrived}
                      className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold rounded-2xl text-xs flex items-center justify-center space-x-2 transition shadow-lg"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>I HAVE ARRIVED AT PICKUP POINT</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 2: ARRIVED -> 4-DIGIT PIN VERIFICATION */}
              {assignedRide.status === 'arrived' && (
                <div className="space-y-4">
                  <div className="bg-amber-950/40 border border-amber-500/50 p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <KeyRound className="w-6 h-6 text-amber-400" />
                      <div>
                        <div className="font-bold text-sm text-amber-300">
                          {assignedRide.bookingMode === 'courier'
                            ? 'Verify Sender Pickup PIN'
                            : `Waiting at Pickup for ${assignedRide.customerName}`}
                        </div>
                        <div className="text-xs text-neutral-300 mt-0.5">
                          Ask for the 4-digit PIN to unlock & begin the trip.
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setPinMode('pickup');
                        setShowPinPad(true);
                      }}
                      className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-black font-extrabold rounded-2xl text-xs flex items-center space-x-2 transition shadow-lg active:scale-95"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>ENTER 4-DIGIT PIN</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 3: IN_PROGRESS -> TRIP EXECUTION */}
              {assignedRide.status === 'in_progress' && (
                <div className="space-y-4">
                  <div className="bg-emerald-950/60 border border-emerald-500/50 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-emerald-400">
                        En Route to Destination:
                      </div>
                      <div className="text-sm font-bold text-white mt-0.5">
                        {assignedRide.dropoff.address}
                      </div>
                      <div className="text-xs text-neutral-400 mt-1">
                        Total Distance: {assignedRide.distanceKm} km
                      </div>
                    </div>
                  </div>

                  {/* Complete Trip / Courier Delivery PIN */}
                  {assignedRide.bookingMode === 'courier' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setPinMode('delivery');
                        setShowPinPad(true);
                      }}
                      className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold rounded-2xl text-sm flex items-center justify-center space-x-2 transition shadow-xl active:scale-95"
                    >
                      <KeyRound className="w-5 h-5 text-black" />
                      <span>VERIFY RECIPIENT DROPOFF PIN & DELIVER</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCompleteTrip}
                      className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold rounded-2xl text-sm flex items-center justify-center space-x-2 transition shadow-xl active:scale-95"
                    >
                      <CheckCircle2 className="w-5 h-5 text-black" />
                      <span>COMPLETE TRIP & COLLECT FARE</span>
                    </button>
                  )}
                </div>
              )}

              {/* STAGE 4: COMPLETED SUMMARY */}
              {assignedRide.status === 'completed' && (
                <div className="bg-neutral-900 p-5 rounded-2xl border border-neutral-800 space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Trip Successfully Settled!</span>
                  </div>

                  <div className="p-3 bg-black rounded-xl text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Total Collected:</span>
                      <strong className="text-white text-sm">
                        ₹{assignedRide.upfrontFare} ({assignedRide.paymentMethod})
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Net Driver Wallet Credit:</span>
                      <strong className="text-emerald-400 text-sm">
                        +₹{Math.round(assignedRide.upfrontFare * 0.85)}
                      </strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAssignedRide(null);
                      refreshDriverRides();
                    }}
                    className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl text-xs"
                  >
                    Ready for Next Dispatch
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Interactive Radar Map */}
          <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-uber-subtle space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-neutral-900 text-sm flex items-center space-x-2">
                  <Navigation className="w-4 h-4 text-uber-blue" />
                  <span>Live Driver Radar & Map Telemetry</span>
                </h3>
                <p className="text-xs text-neutral-500">
                  {assignedRide
                    ? `Mode: ${assignedRide.bookingMode?.toUpperCase()} • Destination: ${assignedRide.dropoff.address.slice(0, 30)}...`
                    : isOnline
                    ? 'Broadcasting live GPS radar. Incoming ride pings will alert here.'
                    : 'Turn "Go Online" on to start receiving ride dispatches.'}
                </p>
              </div>
            </div>

            <div className="h-[360px] rounded-2xl overflow-hidden border border-neutral-200 shadow-inner">
              <MapView
                center={[currentUser?.currentLocation?.lat || driverLat, currentUser?.currentLocation?.lng || driverLng]}
                zoom={15}
                markers={driverMarkers}
                polyline={assignedRide?.polylineCoords || null}
                onLocateMe={handleRecenterDriverGPS}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* 15-SECOND INCOMING RIDE REQUEST ALERT */}
      {incomingRide && !assignedRide && (
        <IncomingRideAlertModal
          ride={incomingRide}
          onAccept={handleAcceptRide}
          onDecline={handleDeclineRide}
        />
      )}

      {/* PIN VERIFICATION KEYPAD */}
      {showPinPad && assignedRide && (
        <PinVerificationKeypad
          customerName={
            pinMode === 'delivery'
              ? assignedRide.courierDetails?.receiverName || 'Recipient'
              : assignedRide.riderInfo?.riderName || assignedRide.customerName
          }
          onVerify={handleVerifyPin}
          onCancel={() => setShowPinPad(false)}
        />
      )}

      {/* IN-APP CHAT DRAWER */}
      {showDriverChat && assignedRide && (
        <InAppChatDrawer
          ride={assignedRide}
          currentRole="driver"
          currentUserName={currentUser?.fullName || 'Driver Partner'}
          onClose={() => setShowDriverChat(false)}
          onTriggerCall={() => dbService.startMaskedCall(assignedRide.rideId, 'driver')}
        />
      )}

      {/* MASKED PRIVACY CALL OVERLAY */}
      {assignedRide?.maskedCallState?.isActive && (
        <MaskedCallOverlay
          ride={assignedRide}
          currentRole="driver"
          onClose={() => dbService.endMaskedCall(assignedRide.rideId)}
        />
      )}

      {/* SAFETY TOOLKIT MODAL */}
      {showDriverSafetyToolkit && assignedRide && (
        <SafetyToolkitModal
          ride={assignedRide}
          currentUser={currentUser}
          currentRole="driver"
          onClose={() => setShowDriverSafetyToolkit(false)}
        />
      )}

      {/* RIDECHECK ANOMALY MODAL */}
      {assignedRide?.rideCheckStatus?.anomalyDetected && (
        <RideCheckModal
          ride={assignedRide}
          onDismiss={() => refreshDriverRides()}
        />
      )}

      {/* MODULE 6: DRIVER EARNINGS & WALLET MODAL */}
      {showEarningsModal && (
        <DriverEarningsModal
          driver={currentUser}
          onClose={() => {
            setShowEarningsModal(false);
            refreshUser();
            refreshDriverRides();
          }}
        />
      )}

      {/* MODULE 6: RATE CUSTOMER MODAL */}
      {showRateCustomerModal && (
        <RateCustomerModal
          ride={completedRideToRate || assignedRide}
          onClose={() => {
            setShowRateCustomerModal(false);
            setCompletedRideToRate(null);
            refreshUser();
            refreshDriverRides();
          }}
        />
      )}
    </div>
  );
};
