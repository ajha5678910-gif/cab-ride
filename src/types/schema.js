/**
 * Unified Database Schema Definitions for Firestore Collections
 * 
 * Collections:
 * 1. 'users' (Customers)
 * 2. 'drivers' (Drivers)
 * 3. 'admins' (System Admins)
 */

export const VEHICLE_CATEGORIES = [
  {
    id: 'Uber Moto',
    name: 'Uber Moto',
    tagline: 'Affordable, fast motorcycle rides',
    capacity: 1,
    icon: 'Bike',
    baseFare: 25,
    perKm: 8,
  },
  {
    id: 'Uber Auto',
    name: 'Uber Auto',
    tagline: 'Everyday auto-rickshaw rides',
    capacity: 3,
    icon: 'CarFront',
    baseFare: 40,
    perKm: 12,
  },
  {
    id: 'Uber Go',
    name: 'Uber Go',
    tagline: 'Affordable, compact sedans/hatchbacks',
    capacity: 4,
    icon: 'Car',
    baseFare: 65,
    perKm: 15,
  },
  {
    id: 'Uber Premier',
    name: 'Uber Premier',
    tagline: 'Premium sedans with top-rated drivers',
    capacity: 4,
    icon: 'ShieldCheck',
    baseFare: 110,
    perKm: 22,
  },
  {
    id: 'Uber XL',
    name: 'Uber XL',
    tagline: 'Spacious SUVs for groups & luggage',
    capacity: 6,
    icon: 'Truck',
    baseFare: 150,
    perKm: 26,
  },
  {
    id: 'Uber Green',
    name: 'Uber Green',
    tagline: '100% Electric sustainable rides',
    capacity: 4,
    icon: 'Leaf',
    baseFare: 75,
    perKm: 16,
  },
];

export const createDefaultCustomer = (uid, overrides = {}) => ({
  uid,
  role: 'customer',
  fullName: overrides.fullName || '',
  phone: overrides.phone || '',
  email: overrides.email || '',
  profilePicUrl: overrides.profilePicUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  emergencyContacts: overrides.emergencyContacts || [],
  savedAddresses: overrides.savedAddresses || {
    home: { address: '', lat: 28.6139, lng: 77.2090 },
    work: { address: '', lat: 28.5355, lng: 77.3910 },
  },
  walletBalance: overrides.walletBalance ?? 0,
  createdAt: overrides.createdAt || new Date().toISOString(),
});

export const createDefaultDriver = (uid, overrides = {}) => ({
  uid,
  role: 'driver',
  fullName: overrides.fullName || '',
  phone: overrides.phone || '',
  email: overrides.email || '',
  profilePicUrl: overrides.profilePicUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  vehicleDetails: {
    category: overrides.vehicleDetails?.category || 'Uber Go',
    makeModel: overrides.vehicleDetails?.makeModel || '',
    plateNumber: overrides.vehicleDetails?.plateNumber || '',
    color: overrides.vehicleDetails?.color || '',
  },
  kycDocuments: {
    drivingLicenseUrl: overrides.kycDocuments?.drivingLicenseUrl || '',
    rcBookUrl: overrides.kycDocuments?.rcBookUrl || '',
    aadharPanUrl: overrides.kycDocuments?.aadharPanUrl || '',
    vehiclePhotoUrl: overrides.kycDocuments?.vehiclePhotoUrl || '',
  },
  verificationStatus: overrides.verificationStatus || 'pending', // 'pending' | 'approved' | 'rejected'
  rejectionReason: overrides.rejectionReason || '',
  isOnline: overrides.isOnline ?? false,
  rating: overrides.rating ?? 5.0,
  walletBalance: overrides.walletBalance ?? 0,
  createdAt: overrides.createdAt || new Date().toISOString(),
});

export const createDefaultAdmin = (uid, overrides = {}) => ({
  uid,
  role: 'admin',
  email: overrides.email || '',
  name: overrides.name || 'System Admin',
});
