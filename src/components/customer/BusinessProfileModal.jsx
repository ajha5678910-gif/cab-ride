import React, { useState } from 'react';
import { dbService } from '../../services/db';
import { 
  Building2, 
  Mail, 
  FileText, 
  Check, 
  X, 
  Briefcase, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';

export const BusinessProfileModal = ({ currentUser, onClose, onUpdated }) => {
  const existing = currentUser?.businessProfile || {};
  const [companyName, setCompanyName] = useState(existing.companyName || '');
  const [workEmail, setWorkEmail] = useState(existing.workEmail || '');
  const [gstNumber, setGstNumber] = useState(existing.gstNumber || '');
  const [autoEmailReceipts, setAutoEmailReceipts] = useState(existing.autoEmailReceipts !== false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updated = dbService.updateUserProfileMode(currentUser.uid, 'business', {
      companyName,
      workEmail,
      gstNumber,
      autoEmailReceipts,
    });

    setIsSaved(true);
    if (onUpdated) onUpdated(updated);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-neutral-200 animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center">
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                Corporate Commute
              </span>
              <h3 className="text-base font-extrabold text-neutral-900">
                Setup Business Profile
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

        {isSaved && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3.5 rounded-2xl text-xs font-bold flex items-center space-x-2 animate-in zoom-in-95">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Business Profile updated! Business travel mode is now active.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-neutral-700 block mb-1">Company / Organization Name</label>
            <div className="relative">
              <Building2 className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Tech Solutions Pvt Ltd"
                className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl font-bold focus:border-black focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-neutral-700 block mb-1">Official Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
              <input
                type="email"
                value={workEmail}
                onChange={(e) => setWorkEmail(e.target.value)}
                placeholder="e.g. yourname@company.com"
                className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl font-semibold focus:border-black focus:outline-none"
                required
              />
            </div>
            <p className="text-[10px] text-neutral-400 mt-1">
              Monthly travel statements and GST invoices will be delivered here.
            </p>
          </div>

          <div>
            <label className="font-bold text-neutral-700 block mb-1">Corporate GSTIN (Optional for Tax Credit)</label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
              <input
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                placeholder="e.g. 07AAAAA0000A1Z5"
                className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl font-mono uppercase focus:border-black focus:outline-none"
              />
            </div>
          </div>

          <label className="flex items-center space-x-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={autoEmailReceipts}
              onChange={(e) => setAutoEmailReceipts(e.target.checked)}
              className="w-4 h-4 accent-black rounded cursor-pointer"
            />
            <span className="text-neutral-700 font-semibold">
              Automatically forward GST ride invoices to my work email upon trip completion.
            </span>
          </label>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold shadow-lg"
            >
              Save & Activate Business Mode
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
