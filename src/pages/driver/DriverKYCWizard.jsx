import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db';
import { geoService } from '../../services/geolocationService';
import { VEHICLE_CATEGORIES } from '../../types/schema';
import { 
  User, 
  Car, 
  FileText, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  Camera, 
  Sparkles, 
  ShieldCheck, 
  Eye, 
  Bike, 
  CarFront, 
  Truck, 
  Leaf, 
  HelpCircle 
} from 'lucide-react';

export const DriverKYCWizard = ({ onComplete, onCancel }) => {
  const { currentUser, signUpDriver, refreshUser } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Personal Info
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [profilePicUrl, setProfilePicUrl] = useState(
    currentUser?.profilePicUrl || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80'
  );

  // Step 2: Vehicle Details
  const [category, setCategory] = useState(currentUser?.vehicleDetails?.category || 'Uber Go');
  const [makeModel, setMakeModel] = useState(currentUser?.vehicleDetails?.makeModel || '');
  const [plateNumber, setPlateNumber] = useState(currentUser?.vehicleDetails?.plateNumber || '');
  const [color, setColor] = useState(currentUser?.vehicleDetails?.color || '');

  // Step 3: Document Uploads
  const [drivingLicenseUrl, setDrivingLicenseUrl] = useState(
    currentUser?.kycDocuments?.drivingLicenseUrl || ''
  );
  const [rcBookUrl, setRcBookUrl] = useState(
    currentUser?.kycDocuments?.rcBookUrl || ''
  );
  const [aadharPanUrl, setAadharPanUrl] = useState(
    currentUser?.kycDocuments?.aadharPanUrl || ''
  );
  const [vehiclePhotoUrl, setVehiclePhotoUrl] = useState(
    currentUser?.kycDocuments?.vehiclePhotoUrl || ''
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');


  const getVehicleIcon = (iconName) => {
    switch (iconName) {
      case 'Bike': return <Bike className="w-5 h-5" />;
      case 'CarFront': return <CarFront className="w-5 h-5" />;
      case 'Car': return <Car className="w-5 h-5" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5" />;
      case 'Truck': return <Truck className="w-5 h-5" />;
      case 'Leaf': return <Leaf className="w-5 h-5" />;
      default: return <Car className="w-5 h-5" />;
    }
  };

  const handleNext = (e) => {
    e?.preventDefault?.();
    setError('');

    if (currentStep === 1) {
      if (!fullName.trim() || !phone.trim() || !email.trim()) {
        setError('Please fill out all personal details.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!makeModel.trim() || !plateNumber.trim() || !color.trim()) {
        setError('Please enter make/model, license plate, and color.');
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!drivingLicenseUrl || !rcBookUrl || !aadharPanUrl || !vehiclePhotoUrl) {
      setError('Please upload or autofill all 4 required KYC compliance documents.');
      return;
    }

    setSubmitting(true);
    try {
      let initialLocation = currentUser?.currentLocation || null;
      try {
        const liveGps = await geoService.getCurrentLocationWithAddress();
        initialLocation = {
          lat: liveGps.lat,
          lng: liveGps.lng,
          heading: 0,
          accuracy: liveGps.accuracy,
          address: liveGps.address,
          updatedAt: new Date().toISOString(),
        };
      } catch (e) {
        console.warn('Driver KYC GPS capture notice:', e.message);
      }

      const payload = {
        fullName,
        phone,
        email,
        profilePicUrl,
        vehicleDetails: {
          category,
          makeModel,
          plateNumber: plateNumber.toUpperCase(),
          color,
        },
        kycDocuments: {
          drivingLicenseUrl,
          rcBookUrl,
          aadharPanUrl,
          vehiclePhotoUrl,
        },
        verificationStatus: 'pending',
        rejectionReason: '',
        isOnline: false,
        ...(initialLocation ? { currentLocation: initialLocation } : {}),
      };

      if (currentUser?.uid && currentUser?.role === 'driver') {
        dbService.updateDriver(currentUser.uid, payload);
      } else {
        await signUpDriver(payload);
      }

      refreshUser();
      if (onComplete) onComplete();
    } catch (err) {
      setError(err.message || 'Failed to submit KYC registration.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Wizard Card */}
      <div className="bg-white rounded-3xl shadow-uber-lg border border-neutral-200 overflow-hidden">
        {/* Wizard Top Header */}
        <div className="bg-black text-white p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Driver Onboarding Portal
              </span>
              <h1 className="text-2xl font-bold font-sans mt-1">
                Partner Registration & KYC Verification
              </h1>
              <p className="text-xs text-neutral-400 mt-1">
                Complete these 3 steps to submit your application for fleet admin review.
              </p>
            </div>

            {onCancel && (
              <button
                onClick={onCancel}
                className="text-xs text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg border border-neutral-800 hover:bg-neutral-900 transition self-start sm:self-center"
              >
                Exit Wizard
              </button>
            )}
          </div>

          {/* Stepper Dots & Labels */}
          <div className="mt-8 grid grid-cols-3 gap-2">
            {[
              { step: 1, label: 'Personal Info', icon: User },
              { step: 2, label: 'Vehicle Details', icon: Car },
              { step: 3, label: 'KYC Documents', icon: FileText },
            ].map(({ step, label, icon: Icon }) => {
              const isActive = currentStep === step;
              const isDone = currentStep > step;
              return (
                <div key={step} className="flex flex-col items-center text-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isDone
                        ? 'bg-emerald-500 text-white'
                        : isActive
                        ? 'bg-white text-black ring-4 ring-white/20'
                        : 'bg-neutral-800 text-neutral-500'
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium ${
                      isActive ? 'text-white font-bold' : isDone ? 'text-emerald-400' : 'text-neutral-500'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Body */}
        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          {/* STEP 1: Personal Info */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <h2 className="text-lg font-bold text-neutral-900">Step 1: Driver Personal Details</h2>

              <div className="flex flex-col sm:flex-row items-center gap-4 bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
                <img
                  src={profilePicUrl}
                  alt={fullName}
                  className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80';
                  }}
                />
                <div className="flex-1 w-full space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700">Profile Photo URL:</label>
                  <input
                    type="url"
                    value={profilePicUrl}
                    onChange={(e) => setProfilePicUrl(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-neutral-300 rounded-xl"
                  />
                  <p className="text-[11px] text-neutral-500">
                    Use a clear, front-facing professional headshot.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Marcus Vance"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555-0729"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="driver@example.com"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white font-semibold rounded-xl text-xs flex items-center space-x-2 transition"
                >
                  <span>Continue to Vehicle Selection</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Vehicle Details */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <h2 className="text-lg font-bold text-neutral-900">Step 2: Vehicle Category & Specs</h2>

              {/* Vehicle Category Selector */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-2">
                  Select Ride Category:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {VEHICLE_CATEGORIES.map((cat) => {
                    const isSelected = category === cat.id;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition text-left flex flex-col justify-between ${
                          isSelected
                            ? 'border-black bg-black text-white shadow-md ring-2 ring-black/10'
                            : 'border-neutral-200 bg-neutral-50 hover:bg-white text-neutral-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className={`p-2 rounded-xl ${isSelected ? 'bg-neutral-800 text-white' : 'bg-neutral-200 text-neutral-800'}`}>
                            {getVehicleIcon(cat.icon)}
                          </div>
                          <span className={`text-[10px] font-bold ${isSelected ? 'text-amber-400' : 'text-neutral-500'}`}>
                            Cap: {cat.capacity}
                          </span>
                        </div>
                        <div className="font-bold text-xs">{cat.name}</div>
                        <div className={`text-[10px] line-clamp-1 mt-0.5 ${isSelected ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          {cat.tagline}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Vehicle Specs Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Vehicle Make & Model
                  </label>
                  <input
                    type="text"
                    required
                    value={makeModel}
                    onChange={(e) => setMakeModel(e.target.value)}
                    placeholder="e.g. Maruti Suzuki Dzire"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    License Plate Number
                  </label>
                  <input
                    type="text"
                    required
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. MH 02 AB 1234"
                    className="w-full uppercase font-mono px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Vehicle Color
                  </label>
                  <input
                    type="text"
                    required
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g. Pearl White"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 font-semibold rounded-xl text-xs flex items-center space-x-1.5 hover:bg-neutral-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Personal Details</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white font-semibold rounded-xl text-xs flex items-center space-x-2 transition"
                >
                  <span>Continue to Document Upload</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Document Uploads */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">
                    Step 3: Upload Compliance Documents
                  </h2>
                  <p className="text-xs text-neutral-500">
                    All 4 documents are verified by the fleet administration panel.
                  </p>
                </div>
              </div>

              {/* 4 Document Dropzone Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Driving License */}
                <div className="border border-neutral-200 bg-neutral-50 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-neutral-800">
                        1. Driving License (Front & Back)
                      </span>
                      {drivingLicenseUrl ? (
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center">
                          <Check className="w-3 h-3 mr-0.5" /> Uploaded
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-neutral-400">Required</span>
                      )}
                    </div>

                    {drivingLicenseUrl ? (
                      <div className="relative rounded-xl overflow-hidden h-36 bg-neutral-900 border border-neutral-300 group">
                        <img
                          src={drivingLicenseUrl}
                          alt="Driving License"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <button
                            type="button"
                            onClick={() => window.open(drivingLicenseUrl, '_blank')}
                            className="bg-white/90 text-black px-2.5 py-1 rounded text-xs font-bold flex items-center space-x-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> <span>Inspect</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-36 border-2 border-dashed border-neutral-300 rounded-xl flex flex-col items-center justify-center text-neutral-400 p-4">
                        <Upload className="w-6 h-6 mb-1 text-neutral-400" />
                        <span className="text-xs">Provide image link or tap autofill</span>
                      </div>
                    )}
                  </div>

                  <input
                    type="url"
                    value={drivingLicenseUrl}
                    onChange={(e) => setDrivingLicenseUrl(e.target.value)}
                    placeholder="https://... license image URL"
                    className="mt-3 text-xs px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg w-full"
                  />
                </div>

                {/* 2. Vehicle RC Book */}
                <div className="border border-neutral-200 bg-neutral-50 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-neutral-800">
                        2. Vehicle Registration Certificate (RC)
                      </span>
                      {rcBookUrl ? (
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center">
                          <Check className="w-3 h-3 mr-0.5" /> Uploaded
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-neutral-400">Required</span>
                      )}
                    </div>

                    {rcBookUrl ? (
                      <div className="relative rounded-xl overflow-hidden h-36 bg-neutral-900 border border-neutral-300 group">
                        <img
                          src={rcBookUrl}
                          alt="RC Book"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <button
                            type="button"
                            onClick={() => window.open(rcBookUrl, '_blank')}
                            className="bg-white/90 text-black px-2.5 py-1 rounded text-xs font-bold flex items-center space-x-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> <span>Inspect</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-36 border-2 border-dashed border-neutral-300 rounded-xl flex flex-col items-center justify-center text-neutral-400 p-4">
                        <Upload className="w-6 h-6 mb-1 text-neutral-400" />
                        <span className="text-xs">Provide RC document link</span>
                      </div>
                    )}
                  </div>

                  <input
                    type="url"
                    value={rcBookUrl}
                    onChange={(e) => setRcBookUrl(e.target.value)}
                    placeholder="https://... RC image URL"
                    className="mt-3 text-xs px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg w-full"
                  />
                </div>

                {/* 3. Aadhar / PAN Card */}
                <div className="border border-neutral-200 bg-neutral-50 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-neutral-800">
                        3. Government ID (Aadhar / PAN)
                      </span>
                      {aadharPanUrl ? (
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center">
                          <Check className="w-3 h-3 mr-0.5" /> Uploaded
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-neutral-400">Required</span>
                      )}
                    </div>

                    {aadharPanUrl ? (
                      <div className="relative rounded-xl overflow-hidden h-36 bg-neutral-900 border border-neutral-300 group">
                        <img
                          src={aadharPanUrl}
                          alt="ID Card"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <button
                            type="button"
                            onClick={() => window.open(aadharPanUrl, '_blank')}
                            className="bg-white/90 text-black px-2.5 py-1 rounded text-xs font-bold flex items-center space-x-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> <span>Inspect</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-36 border-2 border-dashed border-neutral-300 rounded-xl flex flex-col items-center justify-center text-neutral-400 p-4">
                        <Upload className="w-6 h-6 mb-1 text-neutral-400" />
                        <span className="text-xs">Provide ID card link</span>
                      </div>
                    )}
                  </div>

                  <input
                    type="url"
                    value={aadharPanUrl}
                    onChange={(e) => setAadharPanUrl(e.target.value)}
                    placeholder="https://... ID card image URL"
                    className="mt-3 text-xs px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg w-full"
                  />
                </div>

                {/* 4. Vehicle Front Photo */}
                <div className="border border-neutral-200 bg-neutral-50 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-neutral-800">
                        4. Vehicle Front Photo (With Number Plate)
                      </span>
                      {vehiclePhotoUrl ? (
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center">
                          <Check className="w-3 h-3 mr-0.5" /> Uploaded
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-neutral-400">Required</span>
                      )}
                    </div>

                    {vehiclePhotoUrl ? (
                      <div className="relative rounded-xl overflow-hidden h-36 bg-neutral-900 border border-neutral-300 group">
                        <img
                          src={vehiclePhotoUrl}
                          alt="Vehicle Photo"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <button
                            type="button"
                            onClick={() => window.open(vehiclePhotoUrl, '_blank')}
                            className="bg-white/90 text-black px-2.5 py-1 rounded text-xs font-bold flex items-center space-x-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> <span>Inspect</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-36 border-2 border-dashed border-neutral-300 rounded-xl flex flex-col items-center justify-center text-neutral-400 p-4">
                        <Camera className="w-6 h-6 mb-1 text-neutral-400" />
                        <span className="text-xs">Provide vehicle exterior photo</span>
                      </div>
                    )}
                  </div>

                  <input
                    type="url"
                    value={vehiclePhotoUrl}
                    onChange={(e) => setVehiclePhotoUrl(e.target.value)}
                    placeholder="https://... vehicle image URL"
                    className="mt-3 text-xs px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg w-full"
                  />
                </div>
              </div>

              {/* Step 3 Action buttons */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 font-semibold rounded-xl text-xs flex items-center space-x-1.5 hover:bg-neutral-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Vehicle Selection</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={submitting}
                  className="px-8 py-3 bg-black hover:bg-neutral-800 text-white font-bold rounded-xl text-xs flex items-center space-x-2 transition shadow-md"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{submitting ? 'Submitting Application...' : 'Submit KYC for Admin Approval'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
