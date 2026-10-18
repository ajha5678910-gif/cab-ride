import React, { useState } from 'react';
import { dbService } from '../../services/db';
import { 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter, 
  HelpCircle, 
  ShieldCheck, 
  CheckCircle2, 
  Wallet,
  Clock,
  Sparkles,
  Phone
} from 'lucide-react';

export const FinancialsLedger = ({ onRefresh }) => {
  const [subTab, setSubTab] = useState('ledger'); // 'ledger' | 'lost_found'
  const [searchTx, setSearchTx] = useState('');
  const [txRoleFilter, setTxRoleFilter] = useState('all'); // 'all' | 'customer' | 'driver'

  const analytics = dbService.getFinancialAnalytics();
  const allTransactions = dbService.getWalletTransactions();
  const lostTickets = dbService.getLostAndFoundTickets();

  const filteredTransactions = allTransactions.filter((tx) => {
    if (txRoleFilter !== 'all' && tx.role !== txRoleFilter) return false;
    if (!searchTx.trim()) return true;
    const q = searchTx.toLowerCase();
    return (
      tx.description?.toLowerCase().includes(q) ||
      tx.userId?.toLowerCase().includes(q) ||
      tx.type?.toLowerCase().includes(q)
    );
  });

  const handleResolveTicket = (ticketId) => {
    dbService.updateLostItemStatus(ticketId, 'returned_to_customer', 'Admin mediated handover');
    if (onRefresh) onRefresh();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 4 Big KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GMV */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-uber-subtle flex items-center justify-between">
          <div>
            <div className="text-neutral-500 text-xs font-semibold uppercase tracking-wider">
              Gross Bookings (GMV)
            </div>
            <div className="text-3xl font-black text-neutral-900 mt-1">
              ₹{analytics.gmv.toLocaleString()}
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">
              {analytics.totalTripsCompleted} rides completed
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-800">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* 20% Platform Commission */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-200 bg-emerald-50/20 shadow-uber-subtle flex items-center justify-between">
          <div>
            <div className="text-emerald-800 text-xs font-bold uppercase tracking-wider">
              20% Platform Commission
            </div>
            <div className="text-3xl font-black text-emerald-700 mt-1">
              ₹{analytics.totalCommission.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
              Platform net revenue
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-lg">
            20%
          </div>
        </div>

        {/* Driver Payouts */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-uber-subtle flex items-center justify-between">
          <div>
            <div className="text-neutral-500 text-xs font-semibold uppercase tracking-wider">
              80% Driver Payouts
            </div>
            <div className="text-3xl font-black text-neutral-900 mt-1">
              ₹{analytics.totalDriverPayouts.toLocaleString()}
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">
              Net driver partner earnings
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-800">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Tips Processed */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-uber-subtle flex items-center justify-between">
          <div>
            <div className="text-amber-800 text-xs font-bold uppercase tracking-wider">
              100% Tips Processed
            </div>
            <div className="text-3xl font-black text-amber-600 mt-1">
              ₹{analytics.totalTips.toLocaleString()}
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">
              Zero fees deducted
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Sub Tabs: Financial Ledger vs Lost & Found Desk */}
      <div className="flex bg-neutral-200/80 p-1.5 rounded-2xl text-xs font-bold space-x-1 max-w-md">
        <button
          type="button"
          onClick={() => setSubTab('ledger')}
          className={`flex-1 py-2 rounded-xl transition ${
            subTab === 'ledger' ? 'bg-white text-black shadow-sm' : 'text-neutral-600 hover:text-black'
          }`}
        >
          Transactions Ledger ({allTransactions.length})
        </button>

        <button
          type="button"
          onClick={() => setSubTab('lost_found')}
          className={`flex-1 py-2 rounded-xl transition flex items-center justify-center space-x-1.5 ${
            subTab === 'lost_found' ? 'bg-white text-black shadow-sm' : 'text-neutral-600 hover:text-black'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
          <span>Lost & Found Desk ({lostTickets.length})</span>
        </button>
      </div>

      {/* SUBTAB 1: TRANSACTIONS LEDGER */}
      {subTab === 'ledger' && (
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-uber-subtle overflow-hidden space-y-4">
          {/* Filter Bar */}
          <div className="p-5 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTx}
                onChange={(e) => setSearchTx(e.target.value)}
                placeholder="Search by user ID, description, or type..."
                className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="flex bg-neutral-100 p-1 rounded-xl text-xs font-semibold space-x-1">
              {['all', 'customer', 'driver'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setTxRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition ${
                    txRoleFilter === r ? 'bg-white text-black shadow-sm font-bold' : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-600">
              <thead className="bg-neutral-50 text-[10px] uppercase font-bold text-neutral-500 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3">Tx ID / Time</th>
                  <th className="px-6 py-3">User & Role</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 font-medium">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-neutral-400">
                      No matching financial transactions.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    const isCredit = tx.amount > 0;
                    return (
                      <tr key={tx.txId} className="hover:bg-neutral-50/80 transition">
                        <td className="px-6 py-3.5 font-mono">
                          <div className="font-bold text-neutral-900">{tx.txId}</div>
                          <div className="text-[10px] text-neutral-400">
                            {new Date(tx.timestamp).toLocaleString()}
                          </div>
                        </td>

                        <td className="px-6 py-3.5">
                          <div className="font-bold text-neutral-900">{tx.userId}</div>
                          <span className={`inline-block px-2 py-0.2 rounded-full text-[10px] font-bold uppercase ${
                            tx.role === 'driver' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {tx.role}
                          </span>
                        </td>

                        <td className="px-6 py-3.5">
                          <span className="font-mono text-[10px] font-bold bg-neutral-100 text-neutral-700 px-2 py-1 rounded">
                            {tx.type}
                          </span>
                        </td>

                        <td className="px-6 py-3.5 text-neutral-800">
                          {tx.description}
                        </td>

                        <td className={`px-6 py-3.5 text-right font-mono font-bold text-sm ${
                          isCredit ? 'text-emerald-600' : 'text-neutral-900'
                        }`}>
                          {isCredit ? '+' : ''}₹{Math.abs(tx.amount).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: LOST & FOUND SUPPORT DESK */}
      {subTab === 'lost_found' && (
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-uber-subtle p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-neutral-900">Reported Lost Items Desk</h3>
              <p className="text-xs text-neutral-500">
                Mediate driver-passenger item handovers and approve ₹100 driver return incentives.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-xl">
              {lostTickets.length} Reported Tickets
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lostTickets.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-neutral-400 text-xs">
                No lost item tickets reported.
              </div>
            ) : (
              lostTickets.map((ticket) => (
                <div
                  key={ticket.ticketId}
                  className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-neutral-900">{ticket.itemCategory}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      ticket.status === 'returned_to_customer'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ticket.status === 'driver_confirmed_found'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-neutral-200 text-neutral-700'
                    }`}>
                      {ticket.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-neutral-700 font-medium">"{ticket.description}"</p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-600 pt-2 border-t border-neutral-200">
                    <div>
                      <span className="text-neutral-400 block text-[10px]">Rider:</span>
                      <strong>{ticket.customerName}</strong> ({ticket.customerPhone})
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px]">Driver & Plate:</span>
                      <strong>{ticket.driverName}</strong> ({ticket.vehiclePlate})
                    </div>
                  </div>

                  {ticket.status !== 'returned_to_customer' && (
                    <button
                      type="button"
                      onClick={() => handleResolveTicket(ticket.ticketId)}
                      className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1 transition shadow"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Handover & Credit ₹{ticket.returnFee || 100} to Driver</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
