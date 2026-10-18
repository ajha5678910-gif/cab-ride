import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Wallet, 
  UserX, 
  UserCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Plus, 
  Minus, 
  Users, 
  Car,
  RotateCcw
} from 'lucide-react';

export const UserGovernanceModal = () => {
  const [users, setUsers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'customer' | 'driver'

  // Adjustment Modal State
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [targetEntity, setTargetEntity] = useState(null); // { id, name, role, currentBalance }
  const [adjustmentAmount, setAdjustmentAmount] = useState(200);
  const [adjustmentType, setAdjustmentType] = useState('credit'); // 'credit' | 'debit'
  const [adjustmentReason, setAdjustmentReason] = useState('Customer Goodwill / Trip Inconvenience Refund');
  const [actionSuccess, setActionSuccess] = useState('');

  const loadData = () => {
    setUsers(dbService.getUsers());
    setDrivers(dbService.getDrivers());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = dbService.subscribe(() => {
      loadData();
    });
    return unsubscribe;
  }, []);

  const handleToggleStatus = (entity, currentRole) => {
    const isSuspended = entity.status === 'suspended';
    const nextStatus = isSuspended ? 'active' : 'suspended';

    if (currentRole === 'customer') {
      dbService.updateUserStatus(entity.uid, nextStatus);
    } else {
      dbService.updateDriverStatus(entity.uid, nextStatus);
    }

    loadData();
    setActionSuccess(`${entity.fullName || entity.name} account set to ${nextStatus.toUpperCase()}`);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleOpenAdjustment = (entity, role) => {
    setTargetEntity({
      id: entity.uid,
      name: entity.fullName || entity.name,
      role,
      currentBalance: entity.walletBalance || 0,
    });
    setShowAdjustmentModal(true);
  };

  const handleConfirmAdjustment = (e) => {
    e.preventDefault();
    if (!targetEntity) return;

    const finalAmount = adjustmentType === 'credit' ? Math.abs(adjustmentAmount) : -Math.abs(adjustmentAmount);
    dbService.adjustWalletBalance(targetEntity.id, targetEntity.role, finalAmount, adjustmentReason);

    setShowAdjustmentModal(false);
    loadData();
    setActionSuccess(`Successfully adjusted ₹${finalAmount >= 0 ? '+' : ''}${finalAmount} for ${targetEntity.name}`);
    try {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    } catch {}
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const combinedEntities = [
    ...users.map((u) => ({ ...u, entityRole: 'customer' })),
    ...drivers.map((d) => ({ ...d, entityRole: 'driver' })),
  ].filter((item) => {
    if (roleFilter !== 'all' && item.entityRole !== roleFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = (item.fullName || item.name || '').toLowerCase();
    const phone = (item.phone || '').toLowerCase();
    const email = (item.email || '').toLowerCase();
    return name.includes(q) || phone.includes(q) || email.includes(q);
  });

  return (
    <div className="bg-white rounded-3xl border border-neutral-200 shadow-uber-subtle p-6 space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-uber-blue flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            <span>Uber Trust & Safety Governance</span>
          </span>
          <h2 className="text-xl font-extrabold text-neutral-900 mt-1">
            Account Governance & Goodwill Wallet Adjustments
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Suspend or reactivate customer and driver accounts. Issue goodwill wallet credits or dispute compensation.
          </p>
        </div>

        {/* Role Filter Tabs */}
        <div className="flex bg-neutral-100 p-1 rounded-2xl text-xs font-bold space-x-1 self-start sm:self-auto">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition ${
              roleFilter === 'all' ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-black'
            }`}
          >
            All Accounts ({users.length + drivers.length})
          </button>
          <button
            onClick={() => setRoleFilter('customer')}
            className={`px-3 py-1.5 rounded-xl transition ${
              roleFilter === 'customer' ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-black'
            }`}
          >
            Customers ({users.length})
          </button>
          <button
            onClick={() => setRoleFilter('driver')}
            className={`px-3 py-1.5 rounded-xl transition ${
              roleFilter === 'driver' ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-black'
            }`}
          >
            Drivers ({drivers.length})
          </button>
        </div>
      </div>

      {/* Action Success Alert */}
      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-2xl text-xs font-bold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, phone, or email..."
          className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-black"
        />
      </div>

      {/* Governance Table */}
      <div className="overflow-x-auto rounded-2xl border border-neutral-200">
        <table className="min-w-full divide-y divide-neutral-200 text-xs">
          <thead className="bg-neutral-100 text-neutral-600 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-4 py-3 text-left">User Profile</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-right">Wallet Balance</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 bg-white">
            {combinedEntities.map((item) => {
              const isSuspended = item.status === 'suspended';
              const isUberOne = item.uberOneSubscription?.isActive;

              return (
                <tr key={`${item.entityRole}-${item.uid}`} className="hover:bg-neutral-50/70 transition">
                  {/* Profile */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-neutral-200 text-neutral-800 font-bold flex items-center justify-center shrink-0">
                        {(item.fullName || item.name || 'U').charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-neutral-900 flex items-center space-x-1.5">
                          <span>{item.fullName || item.name}</span>
                          {isUberOne && (
                            <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded-full">
                              Uber One
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-500">{item.phone} • {item.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      item.entityRole === 'customer'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {item.entityRole === 'customer' ? <Users className="w-3 h-3" /> : <Car className="w-3 h-3" />}
                      <span className="capitalize">{item.entityRole}</span>
                    </span>
                  </td>

                  {/* Wallet Balance */}
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-neutral-900 text-sm">
                    ₹{item.walletBalance ? item.walletBalance.toFixed(2) : '0.00'}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5 text-center">
                    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isSuspended
                        ? 'bg-red-100 text-red-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isSuspended ? 'bg-red-600' : 'bg-emerald-600'}`} />
                      <span>{isSuspended ? 'SUSPENDED' : 'ACTIVE'}</span>
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => handleOpenAdjustment(item, item.entityRole)}
                      className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold rounded-xl text-[11px] transition inline-flex items-center space-x-1"
                      title="Adjust Wallet / Issue Credit"
                    >
                      <Wallet className="w-3 h-3 text-emerald-600" />
                      <span>Adjust ₹</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item, item.entityRole)}
                      className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition inline-flex items-center space-x-1 border ${
                        isSuspended
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                          : 'bg-white hover:bg-red-50 text-red-600 border-red-200'
                      }`}
                    >
                      {isSuspended ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                      <span>{isSuspended ? 'Reactivate' : 'Suspend'}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ISSUE GOODWILL WALLET ADJUSTMENT MODAL */}
      {showAdjustmentModal && targetEntity && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="font-extrabold text-sm text-neutral-900 flex items-center space-x-2">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>Adjust Wallet Balance</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAdjustmentModal(false)}
                className="text-neutral-400 hover:text-black text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs space-y-1">
              <div>
                <strong>Account:</strong> {targetEntity.name} ({targetEntity.role})
              </div>
              <div className="text-neutral-500">
                Current Balance: <strong>₹{targetEntity.currentBalance.toFixed(2)}</strong>
              </div>
            </div>

            <form onSubmit={handleConfirmAdjustment} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Adjustment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustmentType('credit')}
                    className={`py-2 rounded-xl font-bold text-center border transition flex items-center justify-center space-x-1 ${
                      adjustmentType === 'credit'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-neutral-700 border-neutral-300'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Credit (+₹)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustmentType('debit')}
                    className={`py-2 rounded-xl font-bold text-center border transition flex items-center justify-center space-x-1 ${
                      adjustmentType === 'debit'
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white text-neutral-700 border-neutral-300'
                    }`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>Debit (-₹)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-bold text-base focus:border-black"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Reason / Note</label>
                <select
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-semibold"
                >
                  <option value="Customer Goodwill / Trip Inconvenience Refund">
                    Customer Goodwill / Trip Inconvenience Refund
                  </option>
                  <option value="Driver Partner Incentive Bonus">
                    Driver Partner Incentive Bonus
                  </option>
                  <option value="Safety Incident Compensation Credit">
                    Safety Incident Compensation Credit
                  </option>
                  <option value="Dispute Settlement Adjustment">
                    Dispute Settlement Adjustment
                  </option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustmentModal(false)}
                  className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold shadow-lg"
                >
                  Apply ₹{adjustmentType === 'credit' ? '+' : '-'}{adjustmentAmount}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
