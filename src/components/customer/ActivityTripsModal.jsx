import React, { useState } from 'react';
import { dbService } from '../../services/db';
import { 
  Clock, 
  MapPin, 
  Car, 
  FileText, 
  HelpCircle, 
  X, 
  Download, 
  Check, 
  ChevronRight,
  ShieldCheck,
  Star
} from 'lucide-react';
import { LostAndFoundWizard } from './LostAndFoundWizard';

export const ActivityTripsModal = ({ currentUser, onClose }) => {
  const [selectedRideForInvoice, setSelectedRideForInvoice] = useState(null);
  const [selectedRideForLost, setSelectedRideForLost] = useState(null);

  if (!currentUser) return null;

  const allRides = dbService.getRides();
  const customerRides = allRides.filter((r) => r.customerId === currentUser.uid);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-neutral-200 flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="p-4 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-white text-black flex items-center justify-center shadow font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold flex items-center space-x-2">
                  <span>Activity & Past Trips</span>
                </h2>
                <div className="text-[11px] text-neutral-400">
                  {customerRides.length} total ride(s) on record
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

          {/* List of past trips */}
          <div className="p-5 overflow-y-auto space-y-3">
            {customerRides.length === 0 ? (
              <div className="p-12 text-center text-neutral-400 text-xs space-y-2">
                <Car className="w-10 h-10 mx-auto text-neutral-300" />
                <div className="font-bold text-neutral-700">No Past Trips Found</div>
                <p className="text-[11px] text-neutral-500">
                  When you take your first Uber ride, your digital trip receipt, GST tax invoice, and lost & found tools will show up here.
                </p>
              </div>
            ) : (
              customerRides.map((ride) => (
                <div
                  key={ride.rideId}
                  className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3 transition hover:border-neutral-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="bg-black text-white px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">
                        {ride.category || 'Uber Go'}
                      </span>
                      <span className="text-xs font-semibold text-neutral-500 font-mono">
                        {new Date(ride.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-neutral-900 text-sm">₹{ride.upfrontFare}</span>
                      <span className="text-[10px] block text-neutral-500 capitalize">
                        {ride.paymentStatus || 'paid'} ({ride.paymentMethod || 'Cash'})
                      </span>
                    </div>
                  </div>

                  {/* Route points */}
                  <div className="space-y-1 text-xs">
                    <div className="flex items-start space-x-1.5 text-neutral-700">
                      <span className="w-2 h-2 rounded-full bg-neutral-900 mt-1 flex-shrink-0" />
                      <span className="truncate">{ride.pickup?.address}</span>
                    </div>
                    <div className="flex items-start space-x-1.5 text-neutral-700">
                      <span className="w-2 h-2 rounded-none bg-black mt-1 flex-shrink-0" />
                      <span className="truncate">{ride.dropoff?.address}</span>
                    </div>
                  </div>

                  {/* Driver info & action buttons */}
                  <div className="pt-2 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="text-[11px] text-neutral-500">
                      Driver: <strong>{ride.driverName || 'Partner'}</strong> ({ride.vehicleDetails?.plateNumber || 'DL 01 AB 1234'})
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRideForLost(ride)}
                        className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold rounded-xl text-[11px] flex items-center space-x-1 transition"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>I Lost an Item</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedRideForInvoice(ride)}
                        className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white font-bold rounded-xl text-[11px] flex items-center space-x-1 transition shadow"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Tax Invoice</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* TAX INVOICE PREVIEW MODAL */}
      {selectedRideForInvoice && (
        <div className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-neutral-300 p-6 space-y-4">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h3 className="text-xl font-black text-neutral-900 tracking-tight">Uber</h3>
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
                  Official Tax Invoice Receipt
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRideForInvoice(null)}
                className="text-neutral-400 hover:text-black"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-1.5 text-neutral-600 font-mono">
              <div className="flex justify-between">
                <span>Invoice ID:</span>
                <span className="font-bold text-neutral-900">UBR-INV-{selectedRideForInvoice.rideId.slice(-6)}</span>
              </div>
              <div className="flex justify-between">
                <span>GSTIN:</span>
                <span>07AAAAU1234F1Z5</span>
              </div>
              <div className="flex justify-between">
                <span>SAC Code:</span>
                <span>996412 (Passenger Transport)</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{currentUser.fullName}</span>
              </div>
            </div>

            {/* Breakdown table */}
            <div className="p-3 bg-neutral-50 rounded-2xl border text-xs space-y-1.5">
              <div className="flex justify-between text-neutral-600">
                <span>Base Fare</span>
                <span>₹{Math.round(selectedRideForInvoice.upfrontFare * 0.25)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Distance Charges</span>
                <span>₹{Math.round(selectedRideForInvoice.upfrontFare * 0.55)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Time Charges</span>
                <span>₹{Math.round(selectedRideForInvoice.upfrontFare * 0.20)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>5% GST (Integrated)</span>
                <span>₹{Math.round(selectedRideForInvoice.upfrontFare * 0.05)}</span>
              </div>
              <div className="pt-2 border-t flex justify-between font-bold text-sm text-neutral-900">
                <span>Total Paid:</span>
                <span>₹{selectedRideForInvoice.upfrontFare}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                alert('Tax invoice PDF downloaded to your device.');
                setSelectedRideForInvoice(null);
              }}
              className="w-full py-3 bg-black hover:bg-neutral-800 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 transition shadow"
            >
              <Download className="w-4 h-4" />
              <span>Download Tax Invoice (PDF)</span>
            </button>
          </div>
        </div>
      )}

      {/* LOST AND FOUND WIZARD */}
      {selectedRideForLost && (
        <LostAndFoundWizard
          ride={selectedRideForLost}
          currentUser={currentUser}
          onClose={() => setSelectedRideForLost(null)}
          onSubmitted={() => setSelectedRideForLost(null)}
        />
      )}
    </>
  );
};
