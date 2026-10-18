import React, { useState } from 'react';
import { dbService } from '../../services/db';
import { 
  Users, 
  UserPlus, 
  X, 
  Check, 
  Clock, 
  Sparkles, 
  Phone, 
  Trash2,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

export const SplitFareModal = ({ ride, currentUser, onClose }) => {
  const [friends, setFriends] = useState([
    { name: 'Sarah Jenkins', phone: '+91 98111 55443' },
    { name: 'Alex Rivera', phone: '+91 98222 66778' },
  ]);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [isRequested, setIsRequested] = useState(ride?.splitFareDetails?.isSplit || false);

  if (!ride) return null;

  const totalFare = ride.upfrontFare || 150;
  const currentParticipants = ride.splitFareDetails?.participants || [];
  const totalPeople = (isRequested ? currentParticipants.length : friends.length) + 1; // friends + host
  const perPersonShare = Math.round(totalFare / Math.max(1, totalPeople));

  const handleAddFriend = () => {
    if (!newName.trim() || !newPhone.trim()) return;
    if (friends.length >= 3) {
      alert('You can split fare with up to 3 friends (4 people total).');
      return;
    }
    setFriends([...friends, { name: newName.trim(), phone: newPhone.trim() }]);
    setNewName('');
    setNewPhone('');
  };

  const handleRemoveFriend = (index) => {
    setFriends(friends.filter((_, i) => i !== index));
  };

  const handleConfirmSplitRequest = () => {
    if (friends.length === 0) return;
    dbService.requestSplitFare(ride.rideId, friends);
    setIsRequested(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-neutral-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-400 text-black flex items-center justify-center shadow font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold flex items-center space-x-2">
                <span>Split Fare with Friends</span>
              </h2>
              <div className="text-[11px] text-neutral-400">
                Total Ride Cost: <strong className="text-white">₹{totalFare}</strong>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Fare Distribution Summary Card */}
          <div className="bg-gradient-to-r from-amber-50 to-neutral-50 p-4 rounded-2xl border border-amber-200/80 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                Equal Split ({totalPeople} Riders):
              </span>
              <div className="text-2xl font-black text-neutral-900 mt-0.5">
                ₹{perPersonShare} <span className="text-xs font-normal text-neutral-500">/ person</span>
              </div>
            </div>

            <div className="text-right text-[11px] text-neutral-500">
              Total: <strong>₹{totalFare}</strong>
              <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                Zero processing charges
              </div>
            </div>
          </div>

          {/* If Split Request Sent: Live Status & Participant Tracking */}
          {isRequested ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-800">Split Participants Status:</span>
                <span className="text-[10px] text-neutral-500">Auto-updating</span>
              </div>

              {/* Host You */}
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-neutral-900">{currentUser.fullName} (You / Host)</div>
                  <div className="text-[10px] text-neutral-500">{currentUser.phone}</div>
                </div>
                <div className="text-right">
                  <span className="font-black text-neutral-900">₹{perPersonShare}</span>
                  <div className="text-[10px] text-emerald-600 font-semibold">Primary Payer</div>
                </div>
              </div>

              {/* Friends list */}
              {currentParticipants.map((p) => {
                const isPaid = p.status === 'accepted_paid';
                return (
                  <div
                    key={p.id}
                    className={`p-3 rounded-2xl border text-xs flex items-center justify-between transition ${
                      isPaid ? 'bg-emerald-50 border-emerald-300' : 'bg-neutral-50 border-neutral-200'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-neutral-900">{p.name}</div>
                      <div className="text-[10px] text-neutral-500">{p.phone}</div>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="font-black text-neutral-900">₹{p.shareAmount}</div>
                      {isPaid ? (
                        <div className="text-[10px] text-emerald-700 font-bold flex items-center justify-end space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Accepted & Paid</span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 font-bold px-2 py-0.5 rounded-md flex items-center justify-end space-x-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Invite Pending</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="p-3 bg-neutral-100 rounded-xl text-[11px] text-neutral-600 text-center">
                Split invitation sent via in-app push and SMS to confirm their share of ₹{perPersonShare}.
              </div>
            </div>
          ) : (
            /* Configure Friends to Split With */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-800">Select Friends to Invite:</span>
                <span className="text-[10px] text-neutral-500">{friends.length}/3 Friends</span>
              </div>

              {/* Current Friends list */}
              <div className="space-y-2">
                {friends.map((friend, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-neutral-900">{friend.name}</div>
                      <div className="text-[10px] text-neutral-500">{friend.phone}</div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-neutral-700">₹{perPersonShare}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFriend(idx)}
                        className="p-1 text-neutral-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Custom Friend */}
              {friends.length < 3 && (
                <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2 text-xs">
                  <div className="font-bold text-neutral-700 text-[11px]">Add Another Friend:</div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Friend's Name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="p-2 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Phone (+91...)"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="p-2 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFriend}
                    className="w-full py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold rounded-xl text-xs transition"
                  >
                    + Add to Split
                  </button>
                </div>
              )}

              {/* Submit Split Request Button */}
              <button
                type="button"
                onClick={handleConfirmSplitRequest}
                className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-extrabold rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-2 transition shadow-xl mt-4"
              >
                <Users className="w-4 h-4 text-amber-400" />
                <span>Send Split Fare Requests (₹{perPersonShare} each)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
