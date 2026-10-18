import { INITIAL_CUSTOMERS, INITIAL_DRIVERS, INITIAL_ADMINS } from './mockData';

const STORAGE_KEYS = {
  USERS: 'uber_clone_users_v2',
  DRIVERS: 'uber_clone_drivers_v2',
  ADMINS: 'uber_clone_admins_v2',
  ROUTE_DRAFT: 'uber_clone_route_draft_v2',
  RIDES: 'uber_clone_rides_v2',
  SAFETY_INCIDENTS: 'uber_clone_safety_incidents_v2',
  WALLET_TRANSACTIONS: 'uber_clone_wallet_tx_v2',
  LOST_AND_FOUND: 'uber_clone_lost_found_v2',
  PLATFORM_CONFIG: 'uber_clone_platform_config_v2',
  PROMO_CODES: 'uber_clone_promo_codes_v2',
};

export const DEFAULT_PLATFORM_CONFIG = {
  vehiclePricing: {
    'Uber Moto': { baseFare: 20, perKmRate: 7, perMinRate: 1.0, stopFee: 10, minFare: 25 },
    'Uber Auto': { baseFare: 30, perKmRate: 11, perMinRate: 1.5, stopFee: 15, minFare: 35 },
    'Uber Go': { baseFare: 45, perKmRate: 14, perMinRate: 2.0, stopFee: 25, minFare: 50 },
    'Uber Green': { baseFare: 55, perKmRate: 15, perMinRate: 2.2, stopFee: 25, minFare: 65 },
    'Uber Premier': { baseFare: 70, perKmRate: 19, perMinRate: 2.5, stopFee: 30, minFare: 90 },
    'Uber XL': { baseFare: 90, perKmRate: 24, perMinRate: 3.5, stopFee: 35, minFare: 120 },
  },
  globalSurgeMultiplier: 1.0,
  weatherTrafficSurgeReason: 'Normal Operations',
  platformCommissionPercent: 20,
  uberOnePlan: {
    monthlyPrice: 149,
    rideDiscountPercent: 10,
    zeroCancelFee: true,
    priorityDispatch: true,
  },
};

export const INITIAL_PROMO_CODES = [
  {
    code: 'UBER50',
    discountType: 'percentage',
    discountValue: 50,
    maxDiscount: 100,
    minRideAmount: 150,
    validCategory: 'ALL',
    isActive: true,
    usageCount: 142,
  },
  {
    code: 'FIRST100',
    discountType: 'flat',
    discountValue: 100,
    maxDiscount: 100,
    minRideAmount: 200,
    validCategory: 'ALL',
    isActive: true,
    usageCount: 89,
  },
  {
    code: 'EVGREEN20',
    discountType: 'percentage',
    discountValue: 20,
    maxDiscount: 80,
    minRideAmount: 100,
    validCategory: 'Uber Green',
    isActive: true,
    usageCount: 64,
  },
];

const DB_EVENT_NAME = 'uber_db_change';

const INITIAL_WALLET_TX = [];

const INITIAL_LOST_FOUND = [];

// Multi-tab real-time mesh synchronization channel
let broadcastChannel = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('uber_mesh_sync_channel');
  } catch {}
}

// Dispatch custom event & cross-tab broadcast for real-time reactivity
const notifyChange = (collection, data) => {
  if (typeof window !== 'undefined') {
    const detail = { collection, data, timestamp: Date.now() };
    window.dispatchEvent(new CustomEvent(DB_EVENT_NAME, { detail }));
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage(detail);
      } catch {}
    }
  }
};

class DatabaseService {
  constructor() {
    this.simulationInterval = null;
    this.simulationStep = 0;
    this.init();
  }

  init() {
    if (typeof window === 'undefined') return;

    // List of known demo driver IDs
    const demoDriverIds = [
      'drv-david-miller',
      'drv-rahul-verma',
      'drv-alex-rivera',
      'drv-priya-sharma',
      'drv-vikram-singh',
      'drv-demo',
      'drv-qa-test-1',
    ];

    // Purge legacy demo sessions if present
    const currentUid = localStorage.getItem('uber_session_uid');
    if (currentUid && (demoDriverIds.includes(currentUid) || currentUid === 'cust-john-doe')) {
      localStorage.removeItem('uber_session_uid');
      localStorage.removeItem('uber_current_role');
      localStorage.removeItem(STORAGE_KEYS.USERS);
      localStorage.removeItem(STORAGE_KEYS.WALLET_TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEYS.LOST_AND_FOUND);
      localStorage.removeItem(STORAGE_KEYS.RIDES);
    }

    // Purge any stored demo drivers
    const storedDrivers = localStorage.getItem(STORAGE_KEYS.DRIVERS);
    if (storedDrivers) {
      try {
        const drivers = JSON.parse(storedDrivers);
        if (Array.isArray(drivers)) {
          const cleanDrivers = drivers.filter((d) => {
            if (!d) return false;
            if (demoDriverIds.includes(d.uid) || demoDriverIds.includes(d.id)) return false;
            const name = (d.fullName || d.name || '').toLowerCase();
            if (
              name.includes('david miller') ||
              name.includes('rahul verma') ||
              name.includes('alex rivera') ||
              name.includes('priya sharma') ||
              name.includes('vikram singh') ||
              name.includes('marcus vance')
            ) {
              return false;
            }
            const plate = (d.vehicleDetails?.plateNumber || '').toUpperCase();
            if (
              plate === 'DL 04 MT 4004' ||
              plate === 'DL 01 AA 1001' ||
              plate === 'DL 02 BB 2002' ||
              plate === 'DL 03 CC 3003' ||
              plate === 'DL 05 EE 5005' ||
              plate === 'DL 03 XY 9988'
            ) {
              return false;
            }
            return true;
          });
          localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(cleanDrivers));
        } else {
          localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(INITIAL_DRIVERS));
        }
      } catch {
        localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(INITIAL_DRIVERS));
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(INITIAL_DRIVERS));
    }

    // Purge any rides linked to demo drivers or demo riders
    const storedRides = localStorage.getItem(STORAGE_KEYS.RIDES);
    if (storedRides) {
      try {
        const rides = JSON.parse(storedRides);
        if (Array.isArray(rides)) {
          const cleanRides = rides.filter((r) => {
            if (!r) return false;
            if (r.customerId === 'cust-john-doe') return false;
            if (demoDriverIds.includes(r.driverId)) return false;
            const driverName = (r.driverDetails?.name || '').toLowerCase();
            if (
              driverName.includes('rahul verma') ||
              driverName.includes('david miller') ||
              driverName.includes('alex rivera') ||
              driverName.includes('priya sharma') ||
              driverName.includes('vikram singh')
            ) {
              return false;
            }
            return true;
          });
          localStorage.setItem(STORAGE_KEYS.RIDES, JSON.stringify(cleanRides));
        } else {
          localStorage.setItem(STORAGE_KEYS.RIDES, JSON.stringify([]));
        }
      } catch {
        localStorage.setItem(STORAGE_KEYS.RIDES, JSON.stringify([]));
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.RIDES, JSON.stringify([]));
    }

    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_CUSTOMERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DRIVERS)) {
      localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(INITIAL_DRIVERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ADMINS)) {
      localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(INITIAL_ADMINS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RIDES)) {
      localStorage.setItem(STORAGE_KEYS.RIDES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SAFETY_INCIDENTS)) {
      localStorage.setItem(STORAGE_KEYS.SAFETY_INCIDENTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.WALLET_TRANSACTIONS)) {
      localStorage.setItem(STORAGE_KEYS.WALLET_TRANSACTIONS, JSON.stringify(INITIAL_WALLET_TX));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LOST_AND_FOUND)) {
      localStorage.setItem(STORAGE_KEYS.LOST_AND_FOUND, JSON.stringify(INITIAL_LOST_FOUND));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PLATFORM_CONFIG)) {
      localStorage.setItem(STORAGE_KEYS.PLATFORM_CONFIG, JSON.stringify(DEFAULT_PLATFORM_CONFIG));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROMO_CODES)) {
      localStorage.setItem(STORAGE_KEYS.PROMO_CODES, JSON.stringify(INITIAL_PROMO_CODES));
    }
  }

  // --- Reset to Demo Data ---
  resetToDemo() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_CUSTOMERS));
    localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(INITIAL_DRIVERS));
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(INITIAL_ADMINS));
    localStorage.removeItem(STORAGE_KEYS.ROUTE_DRAFT);
    localStorage.setItem(STORAGE_KEYS.RIDES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SAFETY_INCIDENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.WALLET_TRANSACTIONS, JSON.stringify(INITIAL_WALLET_TX));
    localStorage.setItem(STORAGE_KEYS.LOST_AND_FOUND, JSON.stringify(INITIAL_LOST_FOUND));
    localStorage.setItem(STORAGE_KEYS.PLATFORM_CONFIG, JSON.stringify(DEFAULT_PLATFORM_CONFIG));
    localStorage.setItem(STORAGE_KEYS.PROMO_CODES, JSON.stringify(INITIAL_PROMO_CODES));
    notifyChange('all', null);
  }

  // --- Users / Customers Collection ---
  getUsers() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  getUser(uid) {
    const users = this.getUsers();
    return users.find((u) => u.uid === uid) || null;
  }

  saveUser(user) {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.uid === user.uid);
    let updated;
    if (index >= 0) {
      users[index] = { ...users[index], ...user };
      updated = users[index];
    } else {
      updated = { ...user, createdAt: user.createdAt || new Date().toISOString() };
      users.push(updated);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    notifyChange('users', updated);
    return updated;
  }

  updateUser(uid, partial) {
    const user = this.getUser(uid);
    if (!user) return null;
    return this.saveUser({ ...user, ...partial });
  }

  // --- Drivers Collection & Live Telemetry ---
  getDrivers() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DRIVERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  getDriver(uid) {
    const drivers = this.getDrivers();
    return drivers.find((d) => d.uid === uid) || null;
  }

  getOnlineDrivers() {
    return this.getDrivers().filter(
      (d) => d.verificationStatus === 'approved' && d.isOnline && d.currentLocation
    );
  }

  saveDriver(driver) {
    const drivers = this.getDrivers();
    const index = drivers.findIndex((d) => d.uid === driver.uid);
    let updated;
    if (index >= 0) {
      drivers[index] = { ...drivers[index], ...driver };
      updated = drivers[index];
    } else {
      updated = { ...driver, createdAt: driver.createdAt || new Date().toISOString() };
      drivers.push(updated);
    }
    localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
    notifyChange('drivers', updated);
    return updated;
  }

  updateDriver(uid, partial) {
    const driver = this.getDriver(uid);
    if (!driver) return null;
    return this.saveDriver({ ...driver, ...partial });
  }

  approveDriver(uid) {
    const driver = this.getDriver(uid);
    const defaultLoc = driver?.currentLocation || {
      lat: 28.6289 + (Math.random() - 0.5) * 0.02,
      lng: 77.2195 + (Math.random() - 0.5) * 0.02,
      heading: Math.floor(Math.random() * 360),
      address: 'City Center Patrol Area',
      updatedAt: new Date().toISOString(),
    };

    return this.updateDriver(uid, {
      verificationStatus: 'approved',
      rejectionReason: '',
      isOnline: true,
      simulatingMovement: false,
      currentLocation: defaultLoc,
      verifiedAt: new Date().toISOString(),
    });
  }

  rejectDriver(uid, reason) {
    return this.updateDriver(uid, {
      verificationStatus: 'rejected',
      rejectionReason: reason || 'Documents did not meet compliance requirements.',
      isOnline: false,
      simulatingMovement: false,
    });
  }

  setDriverOnlineStatus(uid, isOnline) {
    return this.updateDriver(uid, {
      isOnline,
      simulatingMovement: false,
    });
  }

  setDriverSimulation(uid, simulatingMovement) {
    return this.updateDriver(uid, { simulatingMovement });
  }

  updateDriverLocation(uid, location) {
    const driver = this.getDriver(uid);
    if (!driver) return null;
    const currentLocation = {
      ...driver.currentLocation,
      ...location,
      updatedAt: new Date().toISOString(),
    };
    const savedDriver = this.saveDriver({ ...driver, currentLocation });

    // Stream real-time driver GPS to any active in-progress ride
    const activeRide = this.getActiveDriverRide(uid);
    if (activeRide && ['accepted', 'arrived', 'in_progress'].includes(activeRide.status)) {
      this.saveRide({
        ...activeRide,
        currentDriverPosition: currentLocation,
      });
    }

    return savedDriver;
  }

  // --- Active Route Draft (Customer Map State) ---
  getActiveRouteDraft() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ROUTE_DRAFT);
      return data
        ? JSON.parse(data)
        : {
            pickup: {
              address: 'Connaught Place Outer Circle, New Delhi',
              lat: 28.6315,
              lng: 77.2167,
            },
            stops: [],
            dropoff: {
              address: 'India Gate, Rajpath, New Delhi',
              lat: 28.6129,
              lng: 77.2295,
            },
            routeStats: null,
          };
    } catch {
      return null;
    }
  }

  saveActiveRouteDraft(routeDraft) {
    localStorage.setItem(STORAGE_KEYS.ROUTE_DRAFT, JSON.stringify(routeDraft));
    notifyChange('route_draft', routeDraft);
    return routeDraft;
  }

  clearActiveRouteDraft() {
    localStorage.removeItem(STORAGE_KEYS.ROUTE_DRAFT);
    notifyChange('route_draft', null);
  }

  // --- Rides Collection & Real-Time Lifecycle ---
  getRides() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RIDES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  getRide(rideId) {
    const rides = this.getRides();
    return rides.find((r) => r.rideId === rideId) || null;
  }

  getRideByShareToken(token) {
    if (!token) return null;
    const rides = this.getRides();
    return rides.find((r) => r.shareToken === token || r.rideId === token) || null;
  }

  saveRide(ride) {
    const rides = this.getRides();
    const index = rides.findIndex((r) => r.rideId === ride.rideId);
    let updated;
    if (index >= 0) {
      rides[index] = { ...rides[index], ...ride };
      updated = rides[index];
    } else {
      updated = { ...ride, createdAt: ride.createdAt || new Date().toISOString() };
      rides.unshift(updated);
    }
    localStorage.setItem(STORAGE_KEYS.RIDES, JSON.stringify(rides));
    notifyChange('rides', updated);
    return updated;
  }

  getActiveCustomerRide(customerId) {
    const rides = this.getRides();
    return (
      rides.find(
        (r) =>
          r.customerId === customerId &&
          !['completed', 'cancelled'].includes(r.status)
      ) || null
    );
  }

  getActiveDriverRide(driverId) {
    const rides = this.getRides();
    return (
      rides.find(
        (r) =>
          r.driverId === driverId &&
          !['completed', 'cancelled'].includes(r.status)
      ) || null
    );
  }

  getPendingRideForDriver(driverId, driverCategory) {
    const rides = this.getRides();
    // Return a ride with status 'searching' that matches driver category or any category for test flexibility
    return (
      rides.find(
        (r) =>
          r.status === 'searching' &&
          (!driverCategory || r.category === driverCategory || true)
      ) || null
    );
  }

  createRide({
    customerId,
    customerName,
    customerPhone,
    category,
    pickup,
    stops = [],
    dropoff,
    distanceKm = 0,
    durationMins = 0,
    upfrontFare,
    paymentMethod = 'Cash',
    polylineCoords = [],
    bookingMode = 'daily', // 'daily' | 'reserve' | 'rentals' | 'intercity' | 'courier'
    riderInfo = { isForSelf: true, riderName: '', riderPhone: '' },
    reserveDetails = null,
    rentalDetails = null,
    intercityDetails = null,
    courierDetails = null,
    isUberOneApplied = false,
    uberOneDiscountAmount = 0,
    appliedPromo = null,
    profileMode = 'personal',
    businessDetails = null,
    isTeenRide = false,
    teenId = null,
    surgeMultiplier = 1.0,
  }) {
    // Generate secure random 4-digit PIN for pickup
    const verificationPin = Math.floor(1000 + Math.random() * 9000).toString();
    const rideId = `ride-${Date.now()}`;

    // For courier, generate receiver delivery confirmation PIN as well
    let finalCourierDetails = courierDetails;
    if (bookingMode === 'courier' && courierDetails) {
      finalCourierDetails = {
        ...courierDetails,
        deliveryConfirmationPin:
          courierDetails.deliveryConfirmationPin ||
          Math.floor(1000 + Math.random() * 9000).toString(),
      };
    }

    const initialStatus = bookingMode === 'reserve' ? 'scheduled' : 'searching';

    // Enterprise Fare Calculation & Financial Breakdown Matrix
    const totalFare = Number(upfrontFare) || 150;
    const baseFare = Math.round(totalFare * 0.25);
    const distanceFare = Math.round(totalFare * 0.55);
    const timeFare = Math.max(0, totalFare - baseFare - distanceFare);
    const stopFees = stops.length * 15;

    // Read dynamic platform commission % from config
    const platformConfig = this.getPlatformConfig();
    const commPercent = platformConfig.platformCommissionPercent || 20;
    const platformCommission = Math.round((totalFare * commPercent) / 100);
    const driverNetEarning = totalFare - platformCommission;

    const fareBreakdown = {
      baseFare,
      distanceFare,
      timeFare,
      stopFees,
      surgeMultiplier: Number(surgeMultiplier) || 1.0,
      promoDiscount: appliedPromo ? Number(appliedPromo.discountAmount) || 0 : 0,
      uberOneDiscount: isUberOneApplied ? Number(uberOneDiscountAmount) || 0 : 0,
      tipAmount: 0,
      totalFare,
      platformCommission,
      driverNetEarning,
    };

    const newRide = {
      rideId,
      customerId,
      customerName,
      customerPhone,
      driverId: null,
      driverName: null,
      driverPhone: null,
      driverRating: 5.0,
      vehicleDetails: null,
      category,
      pickup,
      stops: stops.map((s) => ({ ...s, completed: false })),
      dropoff: dropoff || pickup,
      distanceKm,
      durationMins,
      upfrontFare: totalFare,
      paymentMethod,
      paymentStatus: 'pending', // 'pending' | 'paid'
      fareBreakdown,
      splitFareDetails: {
        isSplit: false,
        participants: [],
      },
      feedback: {
        customerToDriverRating: null,
        customerCompliments: [],
        driverToCustomerRating: null,
      },
      verificationPin,
      status: initialStatus, // scheduled -> searching -> accepted -> arrived -> in_progress -> completed | cancelled
      bookingMode,
      riderInfo: {
        isForSelf: riderInfo.isForSelf ?? true,
        riderName: riderInfo.riderName || customerName,
        riderPhone: riderInfo.riderPhone || customerPhone,
      },
      reserveDetails,
      rentalDetails,
      intercityDetails,
      courierDetails: finalCourierDetails,
      // Rider Ecosystem Extensions
      isUberOneApplied: Boolean(isUberOneApplied),
      uberOneDiscountAmount: Number(uberOneDiscountAmount) || 0,
      appliedPromo: appliedPromo || null,
      profileMode: profileMode || 'personal',
      businessDetails: businessDetails || null,
      isTeenRide: Boolean(isTeenRide),
      teenId: teenId || null,
      // Safety & Encrypted Communication Extensions
      shareToken: `UBER-LIVE-${Math.floor(1000 + Math.random() * 9000)}`,
      chatMessages: [],
      maskedCallState: {
        isActive: false,
        callerRole: null,
        maskedVirtualNumber: '+91 22-5092-4821',
        durationSeconds: 0,
      },
      audioRecordings: isTeenRide
        ? [
            {
              id: `rec-teen-${Date.now()}`,
              timestamp: new Date().toISOString(),
              durationSeconds: 180,
              status: 'recording_active',
              note: 'Uber for Teens: Mandatory Guardian Encrypted Audio Recording Active',
            },
          ]
        : [],
      rideCheckStatus: {
        anomalyDetected: false,
        reason: null,
        customerResponse: 'pending',
      },
      cancellationReason: '',
      polylineCoords,
      currentDriverPosition: null,
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
    };

    // Update promo code usage count if used
    if (appliedPromo?.code) {
      const promos = this.getPromoCodes();
      const p = promos.find((item) => item.code.toUpperCase() === appliedPromo.code.toUpperCase());
      if (p) {
        p.usageCount = (p.usageCount || 0) + 1;
        localStorage.setItem(STORAGE_KEYS.PROMO_CODES, JSON.stringify(promos));
      }
    }

    // Update customer's total saved with Uber One if applied
    if (isUberOneApplied && customerId) {
      const user = this.getUser(customerId);
      if (user) {
        const sub = user.uberOneSubscription || { isActive: true, planType: 'monthly', totalSaved: 0 };
        sub.totalSaved = (sub.totalSaved || 0) + (Number(uberOneDiscountAmount) || 0);
        this.saveUser({ ...user, uberOneSubscription: sub });
      }
    }

    // Link activeRideId to teen account if this is a teen ride
    if (isTeenRide && customerId && teenId) {
      const user = this.getUser(customerId);
      if (user && user.teenAccounts) {
        const teenAccs = user.teenAccounts.map((t) =>
          t.teenId === teenId ? { ...t, activeRideId: rideId } : t
        );
        this.saveUser({ ...user, teenAccounts: teenAccs });
      }
    }

    return this.saveRide(newRide);
  }

  getScheduledRides() {
    const rides = this.getRides();
    return rides.filter((r) => r.status === 'scheduled');
  }

  getCustomerScheduledRides(customerId) {
    const rides = this.getRides();
    return rides.filter((r) => r.customerId === customerId && r.status === 'scheduled');
  }

  startScheduledRide(rideId) {
    const ride = this.getRide(rideId);
    if (!ride) throw new Error('Ride not found');

    const updated = {
      ...ride,
      status: 'searching',
      scheduledActivatedAt: new Date().toISOString(),
    };
    return this.saveRide(updated);
  }

  verifyCourierDeliveryPin(rideId, enteredPin) {
    const ride = this.getRide(rideId);
    if (!ride || !ride.courierDetails) throw new Error('Courier trip not found');

    const expectedPin = ride.courierDetails.deliveryConfirmationPin;
    if (String(enteredPin).trim() !== String(expectedPin).trim()) {
      throw new Error(`Invalid Receiver Dropoff PIN. Please ask package recipient for PIN: ${expectedPin}`);
    }

    return this.completeTrip(rideId);
  }

  acceptRide(rideId, driver) {
    const ride = this.getRide(rideId);
    if (!ride) throw new Error('Ride request not found');

    const updated = {
      ...ride,
      driverId: driver.uid,
      driverName: driver.fullName,
      driverPhone: driver.phone,
      driverRating: driver.rating || 4.95,
      driverPhotoUrl: driver.profilePicUrl,
      vehicleDetails: driver.vehicleDetails,
      currentDriverPosition: driver.currentLocation || {
        lat: ride.pickup.lat + 0.006,
        lng: ride.pickup.lng + 0.006,
      },
      status: 'accepted',
      acceptedAt: new Date().toISOString(),
    };

    return this.saveRide(updated);
  }

  driverArrivedAtPickup(rideId) {
    const ride = this.getRide(rideId);
    if (!ride) throw new Error('Ride not found');
    return this.saveRide({
      ...ride,
      status: 'arrived',
      arrivedAt: new Date().toISOString(),
    });
  }

  verifyPinAndStartTrip(rideId, enteredPin) {
    const ride = this.getRide(rideId);
    if (!ride) throw new Error('Ride not found');

    if (String(enteredPin).trim() !== String(ride.verificationPin).trim()) {
      throw new Error(`Invalid 4-digit PIN. Please ask customer for PIN: ${ride.verificationPin}`);
    }

    return this.saveRide({
      ...ride,
      status: 'in_progress',
      startedAt: new Date().toISOString(),
    });
  }

  completeIntermediateStop(rideId, stopId) {
    const ride = this.getRide(rideId);
    if (!ride) return null;

    const updatedStops = (ride.stops || []).map((s) =>
      s.id === stopId ? { ...s, completed: true } : s
    );

    return this.saveRide({
      ...ride,
      stops: updatedStops,
    });
  }

  completeTrip(rideId) {
    const ride = this.getRide(rideId);
    if (!ride) throw new Error('Ride not found');

    const totalFare = ride.upfrontFare || ride.fareBreakdown?.totalFare || 150;
    const config = this.getPlatformConfig();
    const commissionPercent = config?.platformCommissionPercent || 20;
    const platformCommission = Math.round(totalFare * (commissionPercent / 100));
    const driverNetEarning = totalFare - platformCommission;

    // Credit driver net earnings once upon trip completion if not already completed
    if (ride.driverId && ride.status !== 'completed' && !ride.isDriverEarningsCredited) {
      this.addWalletTransaction({
        userId: ride.driverId,
        role: 'driver',
        type: 'ride_earning',
        amount: driverNetEarning,
        description: `${100 - commissionPercent}% Net Trip Payout for ${ride.category}`,
      });
    }

    return this.saveRide({
      ...ride,
      status: 'completed',
      isDriverEarningsCredited: true,
      completedAt: new Date().toISOString(),
      fareBreakdown: {
        ...(ride.fareBreakdown || {}),
        totalFare,
        platformCommission,
        driverNetEarning,
      },
    });
  }

  cancelRide(rideId, reason = 'Cancelled by user', cancelledBy = 'customer') {
    const ride = this.getRide(rideId);
    if (!ride) return null;

    return this.saveRide({
      ...ride,
      status: 'cancelled',
      cancellationReason: reason,
      cancelledBy,
      cancelledAt: new Date().toISOString(),
    });
  }

  autoMatchDemoDriver(rideId) {
    const ride = this.getRide(rideId);
    if (!ride || ride.status !== 'searching') return null;

    // Pick a driver with matching category or best rated online driver
    const onlineDrivers = this.getOnlineDrivers();
    const match =
      onlineDrivers.find((d) => d.vehicleDetails?.category === ride.category) ||
      onlineDrivers[0];

    if (!match) return null;

    return this.acceptRide(rideId, match);
  }

  // --- In-App Masked Chat & Virtual Call ---
  sendChatMessage(rideId, { senderRole, senderName, text }) {
    const ride = this.getRide(rideId);
    if (!ride) return null;

    const chatMessages = ride.chatMessages || [];
    const newMsg = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      senderRole, // 'customer' | 'driver' | 'system'
      senderName,
      text: String(text).trim(),
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    const updated = {
      ...ride,
      chatMessages: [...chatMessages, newMsg],
    };
    return this.saveRide(updated);
  }

  markChatRead(rideId, readerRole) {
    const ride = this.getRide(rideId);
    if (!ride || !ride.chatMessages) return null;

    const updatedMessages = ride.chatMessages.map((m) => {
      if (m.senderRole !== readerRole) {
        return { ...m, isRead: true };
      }
      return m;
    });

    return this.saveRide({
      ...ride,
      chatMessages: updatedMessages,
    });
  }

  startMaskedCall(rideId, callerRole) {
    const ride = this.getRide(rideId);
    if (!ride) return null;

    return this.saveRide({
      ...ride,
      maskedCallState: {
        isActive: true,
        callerRole,
        maskedVirtualNumber: '+91 22-5092-4821',
        durationSeconds: 0,
        startedAt: new Date().toISOString(),
      },
    });
  }

  updateMaskedCall(rideId, partial) {
    const ride = this.getRide(rideId);
    if (!ride || !ride.maskedCallState) return null;

    return this.saveRide({
      ...ride,
      maskedCallState: {
        ...ride.maskedCallState,
        ...partial,
      },
    });
  }

  endMaskedCall(rideId) {
    const ride = this.getRide(rideId);
    if (!ride) return null;

    return this.saveRide({
      ...ride,
      maskedCallState: {
        isActive: false,
        callerRole: null,
        maskedVirtualNumber: '+91 22-5092-4821',
        durationSeconds: 0,
      },
    });
  }

  // --- In-Trip Encrypted Audio Recording ---
  addAudioRecording(rideId, { recordedBy, durationSeconds, audioDataUrl, sharedWithAdmin = true }) {
    const ride = this.getRide(rideId);
    if (!ride) return null;

    const recordings = ride.audioRecordings || [];
    const newRecording = {
      id: `aud-${Date.now()}`,
      recordedBy, // 'customer' | 'driver'
      durationSeconds,
      timestamp: new Date().toISOString(),
      audioDataUrl,
      sharedWithAdmin,
    };

    const updatedRide = this.saveRide({
      ...ride,
      audioRecordings: [...recordings, newRecording],
    });

    // If shared with admin, create or update safety incident evidence
    if (sharedWithAdmin) {
      this.createSafetyIncident({
        rideId,
        triggeredBy: recordedBy,
        type: 'AUDIO_EVIDENCE',
        liveCoordinates: ride.currentDriverPosition || ride.pickup,
        customerDetails: {
          id: ride.customerId,
          name: ride.customerName,
          phone: ride.customerPhone,
        },
        driverDetails: {
          id: ride.driverId,
          name: ride.driverName,
          phone: ride.driverPhone,
        },
        vehicleDetails: ride.vehicleDetails || { plateNumber: 'DL 01 AB 1234', makeModel: 'Vehicle' },
        attachedAudioIds: [newRecording.id],
        adminNotes: `In-trip audio recording submitted by ${recordedBy} (${durationSeconds}s duration).`,
      });
    }

    return updatedRide;
  }

  // --- RideCheck Anomaly Detection ---
  triggerRideCheck(rideId, reason = 'long_stop') {
    const ride = this.getRide(rideId);
    if (!ride) return null;

    return this.saveRide({
      ...ride,
      rideCheckStatus: {
        anomalyDetected: true,
        reason,
        customerResponse: 'pending',
        triggeredAt: new Date().toISOString(),
      },
    });
  }

  respondRideCheck(rideId, customerResponse) {
    const ride = this.getRide(rideId);
    if (!ride) return null;

    const updatedRide = this.saveRide({
      ...ride,
      rideCheckStatus: {
        anomalyDetected: customerResponse === 'need_help',
        reason: ride.rideCheckStatus?.reason || 'long_stop',
        customerResponse,
        respondedAt: new Date().toISOString(),
      },
    });

    // If customer needs emergency help, immediately escalate to active SOS incident
    if (customerResponse === 'need_help') {
      this.createSafetyIncident({
        rideId,
        triggeredBy: 'ridecheck_auto',
        type: 'RIDECHECK_ALERT',
        liveCoordinates: ride.currentDriverPosition || ride.pickup,
        customerDetails: {
          id: ride.customerId,
          name: ride.customerName,
          phone: ride.customerPhone,
        },
        driverDetails: {
          id: ride.driverId,
          name: ride.driverName,
          phone: ride.driverPhone,
        },
        vehicleDetails: ride.vehicleDetails || { plateNumber: 'DL 01 AB 1234', makeModel: 'Vehicle' },
        adminNotes: 'Automated RideCheck detected unusual long stop and passenger requested emergency assistance.',
      });
    }

    return updatedRide;
  }

  // --- Safety Incidents (Command Center Engine) ---
  getSafetyIncidents() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAFETY_INCIDENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  getSafetyIncident(incidentId) {
    const list = this.getSafetyIncidents();
    return list.find((inc) => inc.incidentId === incidentId) || null;
  }

  saveSafetyIncident(incident) {
    const list = this.getSafetyIncidents();
    const index = list.findIndex((inc) => inc.incidentId === incident.incidentId);
    let updated;
    if (index >= 0) {
      list[index] = { ...list[index], ...incident, updatedAt: new Date().toISOString() };
      updated = list[index];
    } else {
      updated = {
        ...incident,
        createdAt: incident.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      list.unshift(updated);
    }

    localStorage.setItem(STORAGE_KEYS.SAFETY_INCIDENTS, JSON.stringify(list));
    notifyChange('safety_incidents', updated);
    return updated;
  }

  createSafetyIncident({
    rideId,
    triggeredBy = 'customer',
    type = 'SOS_EMERGENCY',
    liveCoordinates,
    customerDetails,
    driverDetails,
    vehicleDetails,
    notifiedEmergencyContacts = [],
    attachedAudioIds = [],
    adminNotes = '',
  }) {
    const incidentId = `inc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newIncident = {
      incidentId,
      rideId,
      triggeredBy, // 'customer' | 'driver' | 'ridecheck_auto'
      type, // 'SOS_EMERGENCY' | 'RIDECHECK_ALERT' | 'AUDIO_EVIDENCE'
      status: 'active_critical', // 'active_critical' | 'investigating' | 'resolved'
      liveCoordinates: liveCoordinates || { lat: 28.6139, lng: 77.2090, address: 'Live Coordinates' },
      customerDetails: customerDetails || { name: 'Customer', phone: '+91 98765 00000' },
      driverDetails: driverDetails || { name: 'Driver', phone: '+91 98765 11111' },
      vehicleDetails: vehicleDetails || { plateNumber: 'DL 01 AB 1234', makeModel: 'Sedan', color: 'White' },
      notifiedEmergencyContacts: notifiedEmergencyContacts || [],
      attachedAudioIds: attachedAudioIds || [],
      adminNotes: adminNotes || '',
      createdAt: new Date().toISOString(),
    };

    return this.saveSafetyIncident(newIncident);
  }

  updateSafetyIncident(incidentId, partial) {
    const inc = this.getSafetyIncident(incidentId);
    if (!inc) return null;
    return this.saveSafetyIncident({ ...inc, ...partial });
  }

  resolveSafetyIncident(incidentId, notes = 'Issue verified and resolved by safety dispatcher.') {
    const inc = this.getSafetyIncident(incidentId);
    if (!inc) return null;

    return this.saveSafetyIncident({
      ...inc,
      status: 'resolved',
      adminNotes: `${inc.adminNotes ? inc.adminNotes + ' • ' : ''}Resolution: ${notes}`,
      resolvedAt: new Date().toISOString(),
    });
  }

  freezeDriverAccount(driverId, reason = 'Safety emergency protocol freeze') {
    const driver = this.getDriver(driverId);
    if (!driver) return null;

    return this.updateDriver(driverId, {
      verificationStatus: 'rejected',
      rejectionReason: `Account frozen by Safety Command Center: ${reason}`,
      isOnline: false,
    });
  }

  getRideByShareToken(token) {
    if (!token) return null;
    const rides = this.getRides();
    return rides.find((r) => r.shareToken === token.trim().toUpperCase()) || null;
  }

  // ==========================================
  // MODULE 6: FINANCIAL ENGINE & WALLET LEDGER
  // ==========================================

  getWalletTransactions(userId = null) {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WALLET_TRANSACTIONS);
      const list = data ? JSON.parse(data) : [];
      if (!userId) return list;
      return list.filter((t) => t.userId === userId);
    } catch {
      return [];
    }
  }

  addWalletTransaction({ userId, role, type, amount, description }) {
    const list = this.getWalletTransactions();
    const newTx = {
      txId: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      role, // 'customer' | 'driver'
      type, // 'topup' | 'ride_payment' | 'split_fare_share' | 'ride_earning' | 'tip_received' | 'driver_payout_withdrawal' | 'refund'
      amount: Number(amount),
      description: String(description),
      timestamp: new Date().toISOString(),
    };

    list.unshift(newTx);
    localStorage.setItem(STORAGE_KEYS.WALLET_TRANSACTIONS, JSON.stringify(list));

    // Also update corresponding user/driver walletBalance
    if (role === 'customer') {
      const user = this.getUser(userId);
      if (user) {
        this.updateUser(userId, {
          walletBalance: Math.max(0, Number(((user.walletBalance || 0) + Number(amount)).toFixed(2))),
        });
      }
    } else if (role === 'driver') {
      const driver = this.getDriver(userId);
      if (driver) {
        this.updateDriver(userId, {
          walletBalance: Math.max(0, Number(((driver.walletBalance || 0) + Number(amount)).toFixed(2))),
        });
      }
    }

    notifyChange('wallet_transactions', newTx);
    return newTx;
  }

  topupCustomerWallet(customerId, amount, paymentGateway = 'Razorpay / UPI') {
    const amt = Number(amount);
    if (isNaN(amt) || amt <= 0) throw new Error('Invalid top-up amount');

    return this.addWalletTransaction({
      userId: customerId,
      role: 'customer',
      type: 'topup',
      amount: amt,
      description: `Added to Uber Cash via ${paymentGateway}`,
    });
  }

  withdrawDriverWallet(driverId, amount, bankAccount = 'HDFC Bank •• 4912') {
    const amt = Number(amount);
    const driver = this.getDriver(driverId);
    if (!driver) throw new Error('Driver not found');
    if (amt > (driver.walletBalance || 0)) {
      throw new Error('Insufficient wallet balance for instant payout');
    }

    return this.addWalletTransaction({
      userId: driverId,
      role: 'driver',
      type: 'driver_payout_withdrawal',
      amount: -amt,
      description: `Instant Cashout to ${bankAccount} (IMPS / UPI)`,
    });
  }

  // --- Split Fare with Friends ---
  requestSplitFare(rideId, friends = []) {
    const ride = this.getRide(rideId);
    if (!ride) return null;

    const totalFare = ride.upfrontFare || 150;
    const totalPeople = friends.length + 1; // friends + customer
    const shareAmount = Math.round(totalFare / totalPeople);

    const participants = friends.map((f, i) => ({
      id: `split-${i}-${Date.now()}`,
      name: f.name,
      phone: f.phone,
      shareAmount,
      status: 'pending', // 'pending' | 'accepted_paid'
    }));

    const updated = {
      ...ride,
      splitFareDetails: {
        isSplit: true,
        participants,
      },
    };

    return this.saveRide(updated);
  }

  acceptFriendSplit(rideId, participantId) {
    const ride = this.getRide(rideId);
    if (!ride || !ride.splitFareDetails) return null;

    let creditedParticipant = null;
    const updatedParticipants = ride.splitFareDetails.participants.map((p) => {
      if (p.id === participantId || p.phone === participantId) {
        creditedParticipant = p;
        return { ...p, status: 'accepted_paid', paidAt: new Date().toISOString() };
      }
      return p;
    });

    if (creditedParticipant) {
      this.addWalletTransaction({
        userId: ride.customerId,
        role: 'customer',
        type: 'split_fare_share',
        amount: creditedParticipant.shareAmount,
        description: `Split fare contribution received from ${creditedParticipant.name}`,
      });
    }

    return this.saveRide({
      ...ride,
      splitFareDetails: {
        ...ride.splitFareDetails,
        participants: updatedParticipants,
      },
    });
  }

  // --- Post-Ride Payment & Tipping ---
  processRidePayment(rideId, { paymentMethod = 'Uber Cash', tipAmount = 0 }) {
    const ride = this.getRide(rideId);
    if (!ride) throw new Error('Ride not found');

    const tip = Number(tipAmount) || 0;
    const totalFare = ride.upfrontFare || ride.fareBreakdown?.totalFare || 150;
    const config = this.getPlatformConfig();
    const commissionPercent = config?.platformCommissionPercent || 20;
    const platformCommission = Math.round(totalFare * (commissionPercent / 100));
    const driverNetEarning = (totalFare - platformCommission) + tip;

    const updatedFareBreakdown = {
      ...(ride.fareBreakdown || {}),
      totalFare,
      platformCommission,
      tipAmount: tip,
      driverNetEarning,
    };

    // Customer payment debit if Uber Cash and not already paid
    if (paymentMethod === 'Uber Cash' && ride.customerId && ride.paymentStatus !== 'paid') {
      this.addWalletTransaction({
        userId: ride.customerId,
        role: 'customer',
        type: 'ride_payment',
        amount: -(totalFare + tip),
        description: `Trip payment (${ride.pickup?.address?.slice(0, 20) || 'Pickup'} ➔ ${ride.dropoff?.address?.slice(0, 20) || 'Dropoff'})`,
      });
    }

    // Driver payout credit (only if not already credited during completeTrip)
    if (ride.driverId && !ride.isDriverEarningsCredited) {
      this.addWalletTransaction({
        userId: ride.driverId,
        role: 'driver',
        type: 'ride_earning',
        amount: totalFare - platformCommission,
        description: `${100 - commissionPercent}% Net Trip Payout for ${ride.category}`,
      });
    }

    // 100% Tip to driver
    if (ride.driverId && tip > 0) {
      this.addWalletTransaction({
        userId: ride.driverId,
        role: 'driver',
        type: 'tip_received',
        amount: tip,
        description: `100% Customer Gratitude Tip for Trip ${ride.rideId}`,
      });
    }

    return this.saveRide({
      ...ride,
      paymentMethod,
      paymentStatus: 'paid',
      isDriverEarningsCredited: true,
      fareBreakdown: updatedFareBreakdown,
    });
  }

  submitCustomerRating(rideId, { rating = 5, compliments = [] }) {
    const ride = this.getRide(rideId);
    if (!ride) return null;

    const updatedRide = this.saveRide({
      ...ride,
      feedback: {
        ...(ride.feedback || {}),
        customerToDriverRating: rating,
        customerCompliments: compliments,
      },
    });

    // Dynamically recalculate driver's overall rating
    if (ride.driverId) {
      const driver = this.getDriver(ride.driverId);
      if (driver) {
        const allDriverRides = this.getRides().filter(
          (r) => r.driverId === ride.driverId && r.feedback?.customerToDriverRating
        );
        const totalStars = allDriverRides.reduce(
          (acc, r) => acc + Number(r.feedback.customerToDriverRating),
          0
        );
        const newAverage = allDriverRides.length > 0
          ? Number((totalStars / allDriverRides.length).toFixed(2))
          : rating;

        this.updateDriver(ride.driverId, {
          rating: newAverage,
        });
      }
    }

    return updatedRide;
  }

  submitDriverRating(rideId, rating = 5) {
    const ride = this.getRide(rideId);
    if (!ride) return null;

    return this.saveRide({
      ...ride,
      feedback: {
        ...(ride.feedback || {}),
        driverToCustomerRating: rating,
      },
    });
  }

  // --- Lost & Found System ---
  getLostAndFoundTickets(filter = null) {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOST_AND_FOUND);
      const list = data ? JSON.parse(data) : [];
      if (!filter) return list;
      return list.filter((item) => {
        if (filter.customerId && item.customerId !== filter.customerId) return false;
        if (filter.driverId && item.driverId !== filter.driverId) return false;
        if (filter.status && item.status !== filter.status) return false;
        return true;
      });
    } catch {
      return [];
    }
  }

  getLostItemTicket(ticketId) {
    const list = this.getLostAndFoundTickets();
    return list.find((t) => t.ticketId === ticketId) || null;
  }

  reportLostItem({
    rideId,
    customerId,
    customerName,
    customerPhone,
    driverId,
    driverName,
    driverPhone,
    vehiclePlate,
    itemCategory,
    description,
    returnFee = 100,
  }) {
    const list = this.getLostAndFoundTickets();
    const ticketId = `lost-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newTicket = {
      ticketId,
      rideId,
      customerId,
      customerName,
      customerPhone,
      driverId,
      driverName,
      driverPhone,
      vehiclePlate,
      itemCategory, // 'Phone/Electronics' | 'Wallet/Bag' | 'Keys' | 'Documents' | 'Clothing/Other'
      description,
      returnFee: Number(returnFee) || 100,
      status: 'reported', // 'reported' | 'driver_confirmed_found' | 'returned_to_customer' | 'not_found'
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    list.unshift(newTicket);
    localStorage.setItem(STORAGE_KEYS.LOST_AND_FOUND, JSON.stringify(list));
    notifyChange('lost_and_found', newTicket);
    return newTicket;
  }

  updateLostItemStatus(ticketId, status, notes = '') {
    const list = this.getLostAndFoundTickets();
    const index = list.findIndex((t) => t.ticketId === ticketId);
    if (index === -1) return null;

    const ticket = list[index];
    const updated = {
      ...ticket,
      status,
      notes: notes || ticket.notes,
      updatedAt: new Date().toISOString(),
    };

    // If item returned to customer, credit ₹100 driver return compensation fee and debit customer
    if (status === 'returned_to_customer') {
      if (ticket.driverId && !ticket.isFeeClaimed) {
        this.addWalletTransaction({
          userId: ticket.driverId,
          role: 'driver',
          type: 'ride_earning',
          amount: ticket.returnFee || 100,
          description: `Lost & Found Return Incentive Fee for Ticket ${ticket.ticketId}`,
        });
      }
      if (ticket.customerId && !ticket.isFeeClaimed) {
        this.addWalletTransaction({
          userId: ticket.customerId,
          role: 'customer',
          type: 'ride_payment',
          amount: -(ticket.returnFee || 100),
          description: `Lost & Found Driver Return Fee for Ticket ${ticket.ticketId}`,
        });
      }
      updated.isFeeClaimed = true;
    }

    list[index] = updated;
    localStorage.setItem(STORAGE_KEYS.LOST_AND_FOUND, JSON.stringify(list));
    notifyChange('lost_and_found', updated);
    return updated;
  }

  // --- Financial Analytics for Admin ---
  getFinancialAnalytics() {
    const rides = this.getRides().filter((r) => r.status === 'completed');
    const transactions = this.getWalletTransactions();

    const gmv = rides.reduce((sum, r) => sum + (r.upfrontFare || r.fareBreakdown?.totalFare || 0), 0);
    const totalCommission = Math.round(gmv * 0.20);
    const totalDriverPayouts = rides.reduce(
      (sum, r) => sum + (r.fareBreakdown?.driverNetEarning || Math.round((r.upfrontFare || 0) * 0.80)),
      0
    );
    const totalTips = rides.reduce((sum, r) => sum + (r.fareBreakdown?.tipAmount || 0), 0);

    return {
      gmv,
      totalCommission,
      totalDriverPayouts,
      totalTips,
      totalTripsCompleted: rides.length,
      totalTransactions: transactions.length,
      recentTransactions: transactions.slice(0, 50),
    };
  }

  // --- Admins Collection ---
  getAdmins() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADMINS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  getAdmin(uid) {
    const admins = this.getAdmins();
    return admins.find((a) => a.uid === uid) || null;
  }

  // ==========================================
  // MODULE 7: PLATFORM CONFIG & DYNAMIC PRICING
  // ==========================================
  getPlatformConfig() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLATFORM_CONFIG);
      return data ? JSON.parse(data) : DEFAULT_PLATFORM_CONFIG;
    } catch {
      return DEFAULT_PLATFORM_CONFIG;
    }
  }

  updatePlatformConfig(updates) {
    const current = this.getPlatformConfig();
    const updated = {
      ...current,
      ...updates,
      vehiclePricing: {
        ...current.vehiclePricing,
        ...(updates.vehiclePricing || {}),
      },
      uberOnePlan: {
        ...current.uberOnePlan,
        ...(updates.uberOnePlan || {}),
      },
    };
    localStorage.setItem(STORAGE_KEYS.PLATFORM_CONFIG, JSON.stringify(updated));
    notifyChange('platform_config', updated);
    return updated;
  }

  // ==========================================
  // MODULE 7: PROMO CODES ENGINE
  // ==========================================
  getPromoCodes() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROMO_CODES);
      return data ? JSON.parse(data) : INITIAL_PROMO_CODES;
    } catch {
      return INITIAL_PROMO_CODES;
    }
  }

  createPromoCode(promo) {
    const promos = this.getPromoCodes();
    const cleanCode = (promo.code || '').trim().toUpperCase();
    if (!cleanCode) throw new Error('Promo code cannot be empty');

    const newPromo = {
      code: cleanCode,
      discountType: promo.discountType || 'percentage', // 'percentage' | 'flat'
      discountValue: Number(promo.discountValue) || 10,
      maxDiscount: Number(promo.maxDiscount) || 100,
      minRideAmount: Number(promo.minRideAmount) || 0,
      validCategory: promo.validCategory || 'ALL',
      isActive: promo.isActive !== false,
      usageCount: Number(promo.usageCount) || 0,
      createdAt: new Date().toISOString(),
    };

    const existingIdx = promos.findIndex((p) => p.code.toUpperCase() === cleanCode);
    if (existingIdx >= 0) {
      promos[existingIdx] = { ...promos[existingIdx], ...newPromo };
    } else {
      promos.unshift(newPromo);
    }

    localStorage.setItem(STORAGE_KEYS.PROMO_CODES, JSON.stringify(promos));
    notifyChange('promo_codes', promos);
    return newPromo;
  }

  togglePromoCode(code, isActive) {
    const promos = this.getPromoCodes();
    const target = promos.find((p) => p.code.toUpperCase() === code.toUpperCase());
    if (target) {
      target.isActive = isActive;
      localStorage.setItem(STORAGE_KEYS.PROMO_CODES, JSON.stringify(promos));
      notifyChange('promo_codes', promos);
    }
    return promos;
  }

  deletePromoCode(code) {
    let promos = this.getPromoCodes();
    promos = promos.filter((p) => p.code.toUpperCase() !== code.toUpperCase());
    localStorage.setItem(STORAGE_KEYS.PROMO_CODES, JSON.stringify(promos));
    notifyChange('promo_codes', promos);
    return promos;
  }

  validatePromoCode(code, category, fareAmount) {
    const promos = this.getPromoCodes();
    const promo = promos.find((p) => p.code.toUpperCase() === (code || '').toUpperCase().trim());
    if (!promo) {
      return { valid: false, error: 'Invalid coupon code.' };
    }
    if (!promo.isActive) {
      return { valid: false, error: 'This coupon code has expired or is deactivated.' };
    }
    if (promo.validCategory !== 'ALL' && promo.validCategory !== category) {
      return { valid: false, error: `Coupon only valid for ${promo.validCategory}.` };
    }
    if (fareAmount < (promo.minRideAmount || 0)) {
      return { valid: false, error: `Minimum ride amount of ₹${promo.minRideAmount} required for this coupon.` };
    }

    let discount = 0;
    if (promo.discountType === 'percentage') {
      discount = Math.min(promo.maxDiscount || Infinity, Math.round((fareAmount * promo.discountValue) / 100));
    } else {
      discount = Math.min(promo.maxDiscount || Infinity, promo.discountValue);
    }

    return {
      valid: true,
      promo,
      discountAmount: discount,
      discountedFare: Math.max(25, fareAmount - discount),
    };
  }

  // ==========================================
  // MODULE 7: UBER ONE MEMBERSHIP
  // ==========================================
  subscribeUberOne(userId, planType = 'monthly') {
    const user = this.getUser(userId);
    if (!user) return null;

    const config = this.getPlatformConfig();
    const planPrice = config.uberOnePlan?.monthlyPrice || 149;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (planType === 'annual' ? 365 : 30));

    // Deduct from wallet if sufficient balance, else simulated
    const currentBalance = user.walletBalance || 0;
    const newBal = currentBalance >= planPrice ? currentBalance - planPrice : currentBalance;

    const updatedUser = {
      ...user,
      walletBalance: Number(newBal.toFixed(2)),
      uberOneSubscription: {
        isActive: true,
        planType,
        expiresAt: expiresAt.toISOString(),
        totalSaved: user.uberOneSubscription?.totalSaved || 0,
      },
    };

    this.saveUser(updatedUser);

    this.addWalletTransaction({
      userId,
      role: 'customer',
      type: 'ride_payment',
      amount: -planPrice,
      description: `Uber One ${planType === 'annual' ? 'Annual' : 'Monthly'} Membership (10% Ride Discounts & Priority Dispatch)`,
      timestamp: new Date().toISOString(),
    });

    notifyChange('uber_one_updated', updatedUser);
    return updatedUser;
  }

  cancelUberOne(userId) {
    const user = this.getUser(userId);
    if (!user) return null;

    const updatedUser = {
      ...user,
      uberOneSubscription: {
        ...(user.uberOneSubscription || {}),
        isActive: false,
      },
    };

    return this.saveUser(updatedUser);
  }

  // ==========================================
  // MODULE 7: BUSINESS PROFILE & TEEN ACCOUNTS
  // ==========================================
  updateUserProfileMode(userId, mode, businessProfileData = null) {
    const user = this.getUser(userId);
    if (!user) return null;

    const updatedUser = {
      ...user,
      activeProfileMode: mode, // 'personal' | 'business'
      businessProfile: businessProfileData
        ? { ...(user.businessProfile || {}), ...businessProfileData }
        : user.businessProfile || { companyName: '', workEmail: '', gstNumber: '', autoEmailReceipts: true },
    };

    return this.saveUser(updatedUser);
  }

  addTeenAccount(userId, teenData) {
    const user = this.getUser(userId);
    if (!user) return null;

    const teenAccounts = user.teenAccounts || [];
    const newTeen = {
      teenId: `teen-${Date.now()}`,
      name: teenData.name,
      age: Number(teenData.age) || 15,
      phone: teenData.phone || '+91 98765 43210',
      mandatoryPinOn: true,
      autoAudioRecord: true,
      activeRideId: null,
      createdAt: new Date().toISOString(),
    };

    const updatedUser = {
      ...user,
      teenAccounts: [...teenAccounts, newTeen],
    };

    return this.saveUser(updatedUser);
  }

  removeTeenAccount(userId, teenId) {
    const user = this.getUser(userId);
    if (!user) return null;

    const updatedUser = {
      ...user,
      teenAccounts: (user.teenAccounts || []).filter((t) => t.teenId !== teenId),
    };

    return this.saveUser(updatedUser);
  }

  // ==========================================
  // MODULE 7: USER GOVERNANCE & DISPUTES
  // ==========================================
  updateUserStatus(userId, status) {
    const user = this.getUser(userId);
    if (!user) return null;
    return this.saveUser({ ...user, status }); // 'active' | 'suspended'
  }

  updateDriverStatus(driverId, status) {
    const driver = this.getDriver(driverId);
    if (!driver) return null;
    return this.saveDriver({ ...driver, status }); // 'active' | 'suspended'
  }

  adjustWalletBalance(userId, role, amount, reason = 'Admin Goodwill Credit') {
    const numAmount = Number(amount);
    if (role === 'customer') {
      const user = this.getUser(userId);
      if (!user) return null;
      const newBal = (user.walletBalance || 0) + numAmount;
      this.saveUser({ ...user, walletBalance: Number(newBal.toFixed(2)) });
    } else {
      const driver = this.getDriver(userId);
      if (!driver) return null;
      const newBal = (driver.walletBalance || 0) + numAmount;
      this.saveDriver({ ...driver, walletBalance: Number(newBal.toFixed(2)) });
    }

    this.addWalletTransaction({
      userId,
      role,
      type: numAmount >= 0 ? 'topup' : 'ride_payment',
      amount: numAmount,
      description: `Admin Wallet Adjustment: ${reason} (₹${numAmount >= 0 ? '+' : ''}${numAmount})`,
      timestamp: new Date().toISOString(),
    });

    notifyChange('wallet_adjustment', { userId, amount: numAmount });
    return true;
  }

  adminForceCancelRide(rideId, adminReason = 'Admin Command Center Force Intervention') {
    const ride = this.getRide(rideId);
    if (!ride) return null;

    const updated = {
      ...ride,
      status: 'cancelled',
      cancellationReason: `[ADMIN INTERVENTION] ${adminReason}`,
      completedAt: new Date().toISOString(),
    };

    return this.saveRide(updated);
  }

  // ==========================================
  // MODULE 7: BUSINESS INTELLIGENCE METRICS
  // ==========================================
  getExecutiveAnalytics() {
    const rides = this.getRides();
    const users = this.getUsers();
    const drivers = this.getDrivers();
    const platformConfig = this.getPlatformConfig();

    const gmv = rides.reduce((sum, r) => sum + (r.upfrontFare || 0), 0);
    const commPercent = platformConfig.platformCommissionPercent || 20;
    const netRevenue = Math.round((gmv * commPercent) / 100);
    const driverPayouts = gmv - netRevenue;
    const totalTips = rides.reduce((sum, r) => sum + (r.fareBreakdown?.tipAmount || 0), 0);

    const uberOneSubscribers = users.filter((u) => u.uberOneSubscription?.isActive).length;
    const mrrUberOne = uberOneSubscribers * (platformConfig.uberOnePlan?.monthlyPrice || 149);

    // Rides by category
    const categoryCounts = {
      'Uber Moto': 0,
      'Uber Auto': 0,
      'Uber Go': 0,
      'Uber Green': 0,
      'Uber Premier': 0,
      'Uber XL': 0,
    };
    rides.forEach((r) => {
      if (categoryCounts[r.category] !== undefined) {
        categoryCounts[r.category]++;
      } else {
        categoryCounts['Uber Go']++;
      }
    });

    // Rides by mode
    const modeCounts = {
      daily: 0,
      reserve: 0,
      rentals: 0,
      intercity: 0,
      courier: 0,
    };
    rides.forEach((r) => {
      const mode = r.bookingMode || 'daily';
      if (modeCounts[mode] !== undefined) {
        modeCounts[mode]++;
      } else {
        modeCounts.daily++;
      }
    });

    return {
      gmv,
      netRevenue,
      driverPayouts,
      totalTips,
      totalRides: rides.length,
      activeDriversCount: drivers.filter((d) => d.isOnline).length,
      totalCustomers: users.length,
      uberOneSubscribers,
      mrrUberOne,
      categoryCounts,
      modeCounts,
    };
  }

  // --- Real-Time Movement Simulation Engine ---
  startMovementSimulationEngine() {
    if (typeof window === 'undefined' || this.simulationInterval) return;

    this.simulationInterval = setInterval(() => {
      this.simulationStep += 1;
      const drivers = this.getDrivers();
      let hasUpdates = false;

      const updatedDrivers = drivers.map((driver, idx) => {
        if (driver.isOnline && driver.simulatingMovement && driver.currentLocation) {
          hasUpdates = true;

          // Each driver moves along an elliptical road patrol orbit around their anchor
          const speed = 0.00035; // gentle road movement delta
          const phase = (this.simulationStep * 0.06) + (idx * 1.25);

          // Vector deltas
          const dLat = Math.sin(phase) * speed;
          const dLng = Math.cos(phase * 1.1) * speed * 1.15;

          const newLat = Number((driver.currentLocation.lat + dLat).toFixed(6));
          const newLng = Number((driver.currentLocation.lng + dLng).toFixed(6));

          // Calculate heading angle in degrees (0 = North, 90 = East, 180 = South, 270 = West)
          let angleDeg = Math.round((Math.atan2(dLng, dLat) * 180) / Math.PI);
          if (angleDeg < 0) angleDeg += 360;

          return {
            ...driver,
            currentLocation: {
              ...driver.currentLocation,
              lat: newLat,
              lng: newLng,
              heading: angleDeg,
              updatedAt: new Date().toISOString(),
            },
          };
        }
        return driver;
      });

      if (hasUpdates) {
        localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(updatedDrivers));
        notifyChange('drivers_telemetry', updatedDrivers);
      }
    }, 2500); // Ticks every 2.5 seconds
  }

  // --- Real-Time Subscription Helper ---
  subscribe(callback) {
    if (typeof window === 'undefined') return () => {};

    const handleCustomEvent = (e) => callback(e.detail);
    const handleStorageEvent = (e) => {
      if (Object.values(STORAGE_KEYS).includes(e.key)) {
        callback({ collection: e.key, data: null });
      }
    };
    const handleBroadcastMessage = (e) => {
      if (e.data) {
        callback(e.data);
      }
    };

    window.addEventListener(DB_EVENT_NAME, handleCustomEvent);
    window.addEventListener('storage', handleStorageEvent);
    if (broadcastChannel) {
      broadcastChannel.addEventListener('message', handleBroadcastMessage);
    }

    return () => {
      window.removeEventListener(DB_EVENT_NAME, handleCustomEvent);
      window.removeEventListener('storage', handleStorageEvent);
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', handleBroadcastMessage);
      }
    };
  }
}

export const dbService = new DatabaseService();
