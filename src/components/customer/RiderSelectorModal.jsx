import React, { useState } from 'react';
import { User, Users, ChevronDown, Check, Plus, Phone, X, ShieldAlert } from 'lucide-react';

export const RiderSelectorModal = ({
  riderInfo,
  onUpdateRiderInfo,
  currentUser,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  const emergencyContacts = currentUser?.emergencyContacts || [];

  const handleSelectSelf = () => {
    onUpdateRiderInfo({
      isForSelf: true,
      riderName: currentUser?.fullName || 'Rider',
      riderPhone: currentUser?.phone || '',
    });
    setIsOpen(false);
    setIsCustomMode(false);
  };

  const handleSelectContact = (contact) => {
    onUpdateRiderInfo({
      isForSelf: false,
      riderName: contact.name,
      riderPhone: contact.phone,
    });
    setIsOpen(false);
    setIsCustomMode(false);
  };

  const handleSaveCustomGuest = (e) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim()) return;

    onUpdateRiderInfo({
      isForSelf: false,
      riderName: guestName.trim(),
      riderPhone: guestPhone.trim(),
    });
    setIsOpen(false);
    setIsCustomMode(false);
  };

  return (
    <>
      {/* Trigger Pill Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-full text-xs font-bold text-neutral-800 flex items-center space-x-1.5 transition"
      >
        <User className="w-3.5 h-3.5 text-uber-blue" />
        <span>{riderInfo.isForSelf ? 'For Me' : `For: ${riderInfo.riderName}`}</span>
        <ChevronDown className="w-3 h-3 text-neutral-500" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-5 shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Who is riding?</h3>
                <p className="text-xs text-neutral-500">Trip updates & PIN will be shared with the rider.</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-black p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Options */}
            <div className="space-y-2">
              {/* Myself Option */}
              <button
                type="button"
                onClick={handleSelectSelf}
                className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                  riderInfo.isForSelf
                    ? 'border-black bg-neutral-50 font-bold'
                    : 'border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                    Me
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900">
                      Myself ({currentUser?.fullName || 'Rider'})
                    </div>
                    <div className="text-[11px] text-neutral-500">{currentUser?.phone}</div>
                  </div>
                </div>
                {riderInfo.isForSelf && <Check className="w-4 h-4 text-emerald-600" />}
              </button>

              {/* Emergency Contacts as Quick Pick */}
              {emergencyContacts.map((contact, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectContact(contact)}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                    !riderInfo.isForSelf && riderInfo.riderName === contact.name
                      ? 'border-black bg-neutral-50 font-bold'
                      : 'border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
                      {contact.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-900 flex items-center space-x-1.5">
                        <span>{contact.name}</span>
                        <span className="text-[9px] bg-neutral-200 px-1 py-0.2 rounded font-normal">
                          {contact.relation}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-500">{contact.phone}</div>
                    </div>
                  </div>
                  {!riderInfo.isForSelf && riderInfo.riderName === contact.name && (
                    <Check className="w-4 h-4 text-emerald-600" />
                  )}
                </button>
              ))}

              {/* Enter Custom Someone Else */}
              {!isCustomMode ? (
                <button
                  type="button"
                  onClick={() => setIsCustomMode(true)}
                  className="w-full py-2.5 px-3 rounded-2xl border border-dashed border-neutral-300 hover:border-black text-neutral-700 font-bold text-xs flex items-center justify-center space-x-1.5 transition"
                >
                  <Plus className="w-4 h-4 text-uber-blue" />
                  <span>+ Choose Another Contact / Guest</span>
                </button>
              ) : (
                <form onSubmit={handleSaveCustomGuest} className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2.5 animate-in fade-in">
                  <div className="text-xs font-bold text-neutral-800">Enter Rider Contact:</div>
                  <input
                    type="text"
                    required
                    placeholder="Rider Full Name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-neutral-300 rounded-xl"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Rider Mobile (+91 / +1)"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-neutral-300 rounded-xl"
                  />
                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCustomMode(false)}
                      className="flex-1 py-1.5 text-xs text-neutral-600 hover:text-black font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-1.5 bg-black text-white font-bold rounded-xl text-xs"
                    >
                      Confirm Rider
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
