import React from 'react';
import { dbService } from '../../services/db';
import { HelpCircle, Check, Phone, DollarSign, XCircle } from 'lucide-react';

export const DriverLostItemBanner = ({ driverId, onRefresh }) => {
  if (!driverId) return null;

  const tickets = dbService.getLostAndFoundTickets({ driverId });
  const pendingTickets = tickets.filter(
    (t) => t.status === 'reported' || t.status === 'driver_confirmed_found'
  );

  if (pendingTickets.length === 0) return null;

  const ticket = pendingTickets[0];

  const handleFoundInCab = () => {
    dbService.updateLostItemStatus(ticket.ticketId, 'driver_confirmed_found');
    if (onRefresh) onRefresh();
  };

  const handleMarkReturned = () => {
    dbService.updateLostItemStatus(ticket.ticketId, 'returned_to_customer');
    if (onRefresh) onRefresh();
  };

  const handleNotFound = () => {
    dbService.updateLostItemStatus(ticket.ticketId, 'not_found');
    if (onRefresh) onRefresh();
  };

  return (
    <div className="bg-amber-400 text-black p-4 rounded-3xl border-2 border-black shadow-xl space-y-3 animate-in slide-in-from-top duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 font-black text-sm">
          <HelpCircle className="w-5 h-5" />
          <span>Lost Item Reported: {ticket.itemCategory}</span>
        </div>
        <span className="text-[10px] font-bold bg-black text-amber-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          ₹100 Return Reward
        </span>
      </div>

      <div className="bg-amber-300/60 p-3 rounded-2xl border border-amber-500/30 text-xs space-y-1">
        <div><strong>Passenger:</strong> {ticket.customerName} ({ticket.customerPhone})</div>
        <div><strong>Description:</strong> "{ticket.description}"</div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        {ticket.status === 'reported' ? (
          <>
            <button
              type="button"
              onClick={handleFoundInCab}
              className="px-4 py-2 bg-black hover:bg-neutral-800 text-white font-bold rounded-xl flex items-center space-x-1.5 transition shadow"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Yes, Found It in Cab</span>
            </button>

            <button
              type="button"
              onClick={handleNotFound}
              className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl transition"
            >
              Checked — Not Found
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleMarkReturned}
            className="w-full py-2.5 bg-black hover:bg-neutral-800 text-white font-black rounded-xl flex items-center justify-center space-x-2 transition shadow"
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Handed Over to Rider & Claim ₹100 Reward</span>
          </button>
        )}
      </div>
    </div>
  );
};
