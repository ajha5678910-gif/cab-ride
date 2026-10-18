import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle, 
  Camera, 
  Home, 
  Briefcase, 
  AlertCircle,
  LogOut
} from 'lucide-react';

export const CustomerProfile = ({ onClose }) => {
  const { currentUser, refreshUser, logout } = useAuth();

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [profilePicUrl, setProfilePicUrl] = useState(
    currentUser?.profilePicUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  );

  // Emergency contacts state (max 3)
  const [emergencyContacts, setEmergencyContacts] = useState(
    currentUser?.emergencyContacts || []
  );
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('Family');

  // Saved addresses state
  const [homeAddress, setHomeAddress] = useState(
    currentUser?.savedAddresses?.home?.address || ''
  );
  const [homeLat, setHomeLat] = useState(
    currentUser?.savedAddresses?.home?.lat || 28.6139
  );
  const [homeLng, setHomeLng] = useState(
    currentUser?.savedAddresses?.home?.lng || 77.2090
  );

  const [workAddress, setWorkAddress] = useState(
    currentUser?.savedAddresses?.work?.address || ''
  );
  const [workLat, setWorkLat] = useState(
    currentUser?.savedAddresses?.work?.lat || 28.4595
  );
  const [workLng, setWorkLng] = useState(
    currentUser?.savedAddresses?.work?.lng || 77.0266
  );

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sample Avatar presets
  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  ];

  const handleAddEmergencyContact = (e) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) {
      setErrorMsg('Please enter both contact name and phone number.');
      return;
    }
    if (emergencyContacts.length >= 3) {
      setErrorMsg('You can add a maximum of 3 emergency contacts.');
      return;
    }
    setErrorMsg('');
    const updated = [
      ...emergencyContacts,
      {
        name: newContactName.trim(),
        phone: newContactPhone.trim(),
        relation: newContactRelation,
      },
    ];
    setEmergencyContacts(updated);
    setNewContactName('');
    setNewContactPhone('');
  };

  const handleRemoveContact = (indexToRemove) => {
    setEmergencyContacts(emergencyContacts.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSaving(true);

    try {
      dbService.updateUser(currentUser.uid, {
        fullName,
        email,
        phone,
        profilePicUrl,
        emergencyContacts,
        savedAddresses: {
          home: { address: homeAddress, lat: Number(homeLat), lng: Number(homeLng) },
          work: { address: workAddress, lat: Number(workLat), lng: Number(workLng) },
        },
      });

      refreshUser();
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        if (onClose) onClose();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-neutral-100 overflow-hidden my-auto animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-black text-white px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-sans">Rider Profile & Safety Settings</h2>
            <p className="text-xs text-neutral-400">
              Manage personal info, emergency contacts for SOS, and saved places.
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800 transition"
            >
              ✕
            </button>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveProfile} className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="font-semibold">Profile & Emergency Contacts updated successfully!</span>
            </div>
          )}

          {/* Section 1: Basic Info & Profile Photo */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-3 flex items-center space-x-1.5">
              <User className="w-4 h-4 text-black" />
              <span>1. Personal Information</span>
            </h3>

            <div className="flex flex-col sm:flex-row items-center sm:space-x-5 gap-4 bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
              <div className="relative">
                <img
                  src={profilePicUrl}
                  alt={fullName}
                  className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                  }}
                />
                <div className="absolute bottom-0 right-0 p-1.5 bg-black text-white rounded-full shadow-sm">
                  <Camera className="w-3 h-3" />
                </div>
              </div>

              <div className="flex-1 w-full space-y-2">
                <label className="text-xs font-semibold text-neutral-600">
                  Profile Picture URL or Choose Avatar:
                </label>
                <input
                  type="url"
                  value={profilePicUrl}
                  onChange={(e) => setProfilePicUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full text-xs px-3 py-1.5 bg-white border border-neutral-300 rounded-lg focus:ring-1 focus:ring-black"
                />
                <div className="flex items-center space-x-2 pt-1">
                  <span className="text-[11px] text-neutral-500">Presets:</span>
                  {avatarPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setProfilePicUrl(preset)}
                      className={`w-6 h-6 rounded-full overflow-hidden border-2 transition ${
                        profilePicUrl === preset ? 'border-black ring-2 ring-black/20' : 'border-transparent'
                      }`}
                    >
                      <img src={preset} alt="preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-black"
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
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Emergency Contacts Manager */}
          <div className="border-t border-neutral-200 pt-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>2. Emergency SOS Contacts ({emergencyContacts.length}/3)</span>
              </h3>
              <span className="text-[11px] font-medium text-neutral-500">
                Alerted in later SOS module
              </span>
            </div>

            <p className="text-xs text-neutral-500 mb-3">
              Add trusted contacts who will receive emergency trip details and live GPS coordinates when you tap the SOS button during rides.
            </p>

            {/* List of current emergency contacts */}
            <div className="space-y-2 mb-3">
              {emergencyContacts.length === 0 ? (
                <div className="p-3 bg-neutral-50 rounded-xl border border-dashed border-neutral-300 text-xs text-neutral-500 text-center">
                  No emergency contacts added yet. Add at least one contact below.
                </div>
              ) : (
                emergencyContacts.map((contact, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-neutral-50 border border-neutral-200 px-3.5 py-2.5 rounded-xl text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center text-xs">
                        {contact.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-neutral-900 flex items-center space-x-2">
                          <span>{contact.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-neutral-200 text-neutral-700 rounded-md font-normal">
                            {contact.relation}
                          </span>
                        </div>
                        <div className="text-neutral-500">{contact.phone}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveContact(idx)}
                      className="text-neutral-400 hover:text-red-600 p-1 rounded-md transition"
                      title="Remove contact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Contact Form */}
            {emergencyContacts.length < 3 && (
              <div className="p-3 bg-neutral-100/70 border border-neutral-200 rounded-xl space-y-2">
                <div className="text-xs font-semibold text-neutral-700">Add New Contact:</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    placeholder="Contact Name"
                    className="px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs"
                  />
                  <input
                    type="tel"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    placeholder="+1 555-0000"
                    className="px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs"
                  />
                  <select
                    value={newContactRelation}
                    onChange={(e) => setNewContactRelation(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Friend">Friend</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleAddEmergencyContact}
                  className="w-full py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Emergency Contact</span>
                </button>
              </div>
            )}
          </div>

          {/* Section 3: Saved Places */}
          <div className="border-t border-neutral-200 pt-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-3 flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-black" />
              <span>3. Saved Places (Home & Work)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Home */}
              <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-neutral-800">
                  <Home className="w-4 h-4 text-uber-blue" />
                  <span>Home Address</span>
                </div>
                <input
                  type="text"
                  value={homeAddress}
                  onChange={(e) => setHomeAddress(e.target.value)}
                  placeholder="e.g. 742 Evergreen Terrace, Springfield"
                  className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs"
                />
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <label className="text-neutral-500">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={homeLat}
                      onChange={(e) => setHomeLat(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-neutral-300 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-500">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={homeLng}
                      onChange={(e) => setHomeLng(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-neutral-300 rounded text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Work */}
              <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-neutral-800">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <span>Work Address</span>
                </div>
                <input
                  type="text"
                  value={workAddress}
                  onChange={(e) => setWorkAddress(e.target.value)}
                  placeholder="e.g. 100 Cyber City Tower B"
                  className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs"
                />
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <label className="text-neutral-500">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={workLat}
                      onChange={(e) => setWorkLat(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-neutral-300 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-500">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={workLng}
                      onChange={(e) => setWorkLng(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-neutral-300 rounded text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-neutral-200 flex items-center justify-between space-x-3">
            <button
              type="button"
              onClick={() => {
                logout();
                if (onClose) onClose();
              }}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-xs transition flex items-center space-x-1.5 cursor-pointer border border-red-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>

            <div className="flex items-center space-x-3">
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 font-semibold rounded-xl text-xs hover:bg-neutral-50 transition"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white font-semibold rounded-xl text-xs transition flex items-center space-x-2 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Profile Settings'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
