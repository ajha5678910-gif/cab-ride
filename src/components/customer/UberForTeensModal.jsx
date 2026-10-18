import React, { useState } from 'react';
import { dbService } from '../../services/db';
import confetti from 'canvas-confetti';
import { 
  Users, 
  ShieldCheck, 
  Lock, 
  Radio, 
  Mic, 
  Phone, 
  Check, 
  Plus, 
  Trash2, 
  X, 
  Sparkles, 
  Star,
  CheckCircle2,
  Play
} from 'lucide-react';

export const UberForTeensModal = ({ currentUser, onClose, onUpdated }) => {
  const [teenAccounts, setTeenAccounts] = useState(currentUser?.teenAccounts || []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [teenName, setTeenName] = useState('');
  const [teenAge, setTeenAge] = useState(15);
  const [teenPhone, setTeenPhone] = useState('+91 98765 43210');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAddTeen = (e) => {
    e.preventDefault();
    if (!teenName.trim()) return;

    const updated = dbService.addTeenAccount(currentUser.uid, {
      name: teenName.trim(),
      age: Number(teenAge),
      phone: teenPhone,
    });

    setTeenAccounts(updated.teenAccounts || []);
    setShowAddForm(false);
    setTeenName('');
    setSuccessMsg(`Teen profile for ${teenName} successfully added! Mandatory Guardian Safety features activated.`);
    try {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    } catch {}
    if (onUpdated) onUpdated(updated);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleRemoveTeen = (teenId) => {
    if (window.confirm('Remove this teen profile?')) {
      const updated = dbService.removeTeenAccount(currentUser.uid, teenId);
      setTeenAccounts(updated.teenAccounts || []);
      if (onUpdated) onUpdated(updated);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-neutral-200 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
                Guardian Family Mode
              </span>
              <h3 className="text-base font-extrabold text-neutral-900">
                Uber for Teens (Ages 13–17)
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-black p-1 rounded-full hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-2xl text-xs font-bold flex items-center space-x-2 animate-in zoom-in-95">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Guardian Safety Features Showcase Card */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 p-4 rounded-2xl space-y-2.5 text-xs">
          <span className="font-extrabold text-purple-900 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Built-In Mandatory Guardian Protections (Locked ON):</span>
          </span>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-purple-950">
            <div className="flex items-center space-x-1.5 bg-white/80 p-2 rounded-xl">
              <Lock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>Mandatory 4-Digit PIN</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-white/80 p-2 rounded-xl">
              <Radio className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>Live Parent GPS Tracking</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-white/80 p-2 rounded-xl">
              <Mic className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>Encrypted Audio Recording</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-white/80 p-2 rounded-xl">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
              <span>Top-Rated Drivers Only</span>
            </div>
          </div>
        </div>

        {/* Teen Accounts List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-neutral-800 uppercase tracking-wider">
              Teen Profiles ({teenAccounts.length})
            </h4>

            {!showAddForm && (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 transition shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Teen Profile</span>
              </button>
            )}
          </div>

          {teenAccounts.length === 0 && !showAddForm ? (
            <div className="text-center py-6 bg-neutral-50 rounded-2xl border border-dashed border-neutral-300 space-y-2">
              <Users className="w-8 h-8 text-neutral-400 mx-auto" />
              <p className="text-xs text-neutral-500">No teen profiles registered yet.</p>
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="text-xs font-bold text-purple-600 hover:underline"
              >
                + Add your first teen (Ages 13–17)
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {teenAccounts.map((teen) => (
                <div
                  key={teen.teenId}
                  className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-sm text-neutral-900">
                        {teen.name}
                      </span>
                      <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
                        Age {teen.age}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-500">{teen.phone}</div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-auto">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Guardian Monitored</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemoveTeen(teen.teenId)}
                      className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg transition"
                      title="Remove Teen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ADD TEEN FORM */}
        {showAddForm && (
          <form onSubmit={handleAddTeen} className="bg-neutral-50 p-4 rounded-2xl border border-neutral-300 space-y-3 text-xs animate-in slide-in-from-top-2">
            <div className="font-bold text-neutral-900">Register New Teen</div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">Teen's Full Name</label>
              <input
                type="text"
                value={teenName}
                onChange={(e) => setTeenName(e.target.value)}
                placeholder="e.g. Aarav Doe"
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl font-bold focus:border-black focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Age (13–17)</label>
                <input
                  type="number"
                  min="13"
                  max="17"
                  value={teenAge}
                  onChange={(e) => setTeenAge(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl font-bold focus:border-black focus:outline-none text-right"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Teen's Mobile Phone</label>
                <input
                  type="text"
                  value={teenPhone}
                  onChange={(e) => setTeenPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl font-semibold focus:border-black focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="pt-1 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md"
              >
                Save Teen Profile
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
