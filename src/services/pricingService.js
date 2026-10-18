/**
 * Pricing & Dynamic Fare Calculation Matrix
 * Upfront fare calculation for:
 * 1. Daily Rides (Moto, Auto, Go, Green, Premier, XL)
 * 2. Uber Reserve (Scheduled rides + ₹50 lock fee)
 * 3. Uber Rentals (Hourly Packages)
 * 4. Uber Intercity (Outstation Trips)
 * 5. Uber Connect (Parcel Courier Delivery)
 */
import { dbService } from './db';

export const PRICING_MATRIX = {
  'Uber Moto': {
    id: 'Uber Moto',
    name: 'Uber Moto',
    tagline: 'Affordable, swift motorbike commute',
    baseFare: 20,
    perKm: 7,
    perMin: 1.0,
    stopFee: 10,
    capacity: 1,
    icon: 'Bike',
    etaMinsOffset: 2,
  },
  'Uber Auto': {
    id: 'Uber Auto',
    name: 'Uber Auto',
    tagline: 'Everyday pocket-friendly 3-wheeler rides',
    baseFare: 30,
    perKm: 11,
    perMin: 1.5,
    stopFee: 15,
    capacity: 3,
    icon: 'CarFront',
    etaMinsOffset: 3,
  },
  'Uber Go': {
    id: 'Uber Go',
    name: 'Uber Go',
    tagline: 'Affordable, compact sedans & hatchbacks',
    baseFare: 45,
    perKm: 14,
    perMin: 2.0,
    stopFee: 25,
    capacity: 4,
    icon: 'Car',
    etaMinsOffset: 4,
  },
  'Uber Green': {
    id: 'Uber Green',
    name: 'Uber Green',
    tagline: '100% Electric sustainable emission-free rides',
    baseFare: 50,
    perKm: 13,
    perMin: 2.0,
    stopFee: 25,
    capacity: 4,
    icon: 'Leaf',
    etaMinsOffset: 5,
  },
  'Uber Premier': {
    id: 'Uber Premier',
    name: 'Uber Premier',
    tagline: 'Premium sedans with top-tier partners & AC',
    baseFare: 65,
    perKm: 18,
    perMin: 2.5,
    stopFee: 35,
    capacity: 4,
    icon: 'ShieldCheck',
    etaMinsOffset: 3,
  },
  'Uber XL': {
    id: 'Uber XL',
    name: 'Uber XL',
    tagline: 'Spacious 6-seater SUVs for groups & luggage',
    baseFare: 90,
    perKm: 24,
    perMin: 3.0,
    stopFee: 50,
    capacity: 6,
    icon: 'Truck',
    etaMinsOffset: 6,
  },
};

// 1. Uber Reserve Fee
export const UBER_RESERVE_FEE = 50;

// 2. Uber Rentals Hourly Packages
export const RENTAL_PACKAGES = [
  { hours: 1, km: 10, basePriceGo: 249, basePricePremier: 349, basePriceXL: 499 },
  { hours: 2, km: 20, basePriceGo: 449, basePricePremier: 599, basePriceXL: 799 },
  { hours: 4, km: 40, basePriceGo: 849, basePricePremier: 1099, basePriceXL: 1499 },
  { hours: 8, km: 80, basePriceGo: 1599, basePricePremier: 1999, basePriceXL: 2699 },
  { hours: 12, km: 120, basePriceGo: 2299, basePricePremier: 2899, basePriceXL: 3799 },
];

export const RENTAL_EXTRA_RATES = {
  extraKmRate: 15, // ₹15/km after package limit
  extraMinRate: 2.5, // ₹2.5/min after package limit
};

// 3. Uber Intercity Popular Outstation Destinations (from Delhi NCR / Mumbai)
export const POPULAR_INTERCITY_CITIES = [
  { name: 'Agra (Taj Mahal)', distanceKm: 215, estHours: 3.5, tollCharges: 450, lat: 27.1767, lng: 78.0081 },
  { name: 'Jaipur (Pink City)', distanceKm: 280, estHours: 5.0, tollCharges: 520, lat: 26.9124, lng: 75.7873 },
  { name: 'Chandigarh', distanceKm: 245, estHours: 4.5, tollCharges: 380, lat: 30.7333, lng: 76.7794 },
  { name: 'Dehradun / Mussoorie', distanceKm: 260, estHours: 5.5, tollCharges: 320, lat: 30.3165, lng: 78.0322 },
  { name: 'Mathura / Vrindavan', distanceKm: 160, estHours: 2.5, tollCharges: 350, lat: 27.4924, lng: 77.6737 },
  { name: 'Pune (from Mumbai)', distanceKm: 150, estHours: 3.0, tollCharges: 320, lat: 18.5204, lng: 73.8567 },
  { name: 'Lonavala (from Mumbai)', distanceKm: 85, estHours: 2.0, tollCharges: 220, lat: 18.7557, lng: 73.4091 },
];

export const INTERCITY_RATES = {
  driverAllowancePerDay: 300,
  perKmRate: 14, // Intercity base rate per km
};

// 4. Uber Connect (Courier Parcel) Pricing
export const COURIER_PACKAGES = {
  baseFare: 40,
  perKm: 9,
  perKg: 5,
  maxWeightKg: 15,
};

/**
 * Get dynamic vehicle rates from Admin Platform Config
 */
export function getDynamicVehiclePricing(category) {
  try {
    const config = dbService.getPlatformConfig();
    if (config?.vehiclePricing?.[category]) {
      return {
        baseFare: Number(config.vehiclePricing[category].baseFare) || 25,
        perKm: Number(config.vehiclePricing[category].perKmRate) || 12,
        perMin: Number(config.vehiclePricing[category].perMinRate) || 2,
        stopFee: Number(config.vehiclePricing[category].stopFee) || 15,
        minFare: Number(config.vehiclePricing[category].minFare) || 30,
      };
    }
  } catch {}
  return PRICING_MATRIX[category] || PRICING_MATRIX['Uber Go'];
}

/**
 * Calculate dynamic upfront fare for Daily & Reserve
 */
export function calculateFare(category, distanceKm = 5, durationMins = 15, stopCount = 0, overrideSurge = null) {
  const tier = PRICING_MATRIX[category] || PRICING_MATRIX['Uber Go'];
  const dynamicPricing = getDynamicVehiclePricing(category);

  let activeSurge = overrideSurge;
  if (activeSurge === null || activeSurge === undefined) {
    try {
      const config = dbService.getPlatformConfig();
      activeSurge = config.globalSurgeMultiplier || 1.0;
    } catch {
      activeSurge = 1.0;
    }
  }

  const rawFare =
    dynamicPricing.baseFare +
    distanceKm * dynamicPricing.perKm +
    durationMins * dynamicPricing.perMin +
    stopCount * dynamicPricing.stopFee;

  const totalWithSurge = Math.round(rawFare * activeSurge);
  return Math.max(dynamicPricing.minFare || dynamicPricing.baseFare, totalWithSurge);
}

/**
 * Generate upfront estimates for all categories with Uber One and Promo Code support
 */
export function calculateAllCategoryFares(
  distanceKm = 5,
  durationMins = 15,
  stopCount = 0,
  overrideSurge = null,
  appliedPromo = null,
  isUberOneMember = false
) {
  let effectiveSurge = overrideSurge;
  if (effectiveSurge === null || effectiveSurge === undefined) {
    try {
      const config = dbService.getPlatformConfig();
      effectiveSurge = config.globalSurgeMultiplier || 1.0;
    } catch {
      effectiveSurge = 1.0;
    }
  }

  return Object.values(PRICING_MATRIX).map((tier) => {
    const originalFare = calculateFare(tier.id, distanceKm, durationMins, stopCount, effectiveSurge);
    let finalFare = originalFare;
    let promoDiscountAmount = 0;
    let uberOneDiscountAmount = 0;

    // 1. Uber One 10% Member Discount
    if (isUberOneMember) {
      uberOneDiscountAmount = Math.round(originalFare * 0.10);
      finalFare = Math.max(25, finalFare - uberOneDiscountAmount);
    }

    // 2. Applied Promo Code Discount
    if (appliedPromo) {
      const check = dbService.validatePromoCode(appliedPromo.code, tier.id, finalFare);
      if (check.valid) {
        promoDiscountAmount = check.discountAmount;
        finalFare = Math.max(25, finalFare - promoDiscountAmount);
      }
    }

    const discountAmount = uberOneDiscountAmount + promoDiscountAmount;

    return {
      ...tier,
      originalFare,
      fare: finalFare,
      discountAmount,
      uberOneDiscountAmount,
      promoDiscountAmount,
      isDiscounted: discountAmount > 0,
      currency: '₹',
      etaText: `${tier.etaMinsOffset} mins away`,
      surgeMultiplier: effectiveSurge,
    };
  });
}

/**
 * Calculate Uber Rentals Package Fare
 */
export function calculateRentalFare(hours, category = 'Uber Go') {
  const pkg = RENTAL_PACKAGES.find((p) => p.hours === hours) || RENTAL_PACKAGES[1]; // default 2 hrs
  if (category === 'Uber Premier') return pkg.basePricePremier;
  if (category === 'Uber XL') return pkg.basePriceXL;
  return pkg.basePriceGo;
}

/**
 * Calculate Uber Intercity Outstation Fare
 */
export function calculateIntercityFare(distanceKm, tripType = 'one_way', days = 1) {
  const effectiveKm = tripType === 'round_trip' ? distanceKm * 2 : distanceKm;
  const kmCost = effectiveKm * INTERCITY_RATES.perKmRate;
  const allowance = INTERCITY_RATES.driverAllowancePerDay * days;
  return Math.round(kmCost + allowance);
}

/**
 * Calculate Uber Connect Parcel Delivery Fare
 */
export function calculateCourierFare(distanceKm = 5, weightKg = 2) {
  const fare =
    COURIER_PACKAGES.baseFare +
    distanceKm * COURIER_PACKAGES.perKm +
    weightKg * COURIER_PACKAGES.perKg;
  return Math.round(Math.max(COURIER_PACKAGES.baseFare, fare));
}
