import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  XCircle, 
  Car, 
  FileText, 
  Eye, 
  AlertTriangle, 
  ExternalLink, 
  Calendar, 
  User, 
  ShieldCheck 
} from 'lucide-react';

export const KYCInspectionModal = ({ driver, onClose, onApprove, onReject }) => {
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState(
    'Driver license photo is blurry or unreadable. Please provide a clear, high-resolution document.'
  );
  const [previewImage, setPreviewImage] = useState(null);

  if (!driver) return null;

  const handleApproveClick = () => {
    // Fire confetti for celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
    onApprove(driver.uid);
  };

  const handleRejectClick = (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;
    onReject(driver.uid, rejectionReason.trim());
  };

  const reasonPresets = [
    'Driver license photo is blurry or unreadable. Please provide a clear document.',
    'Vehicle RC document has expired. Please upload valid registration.',
    'Vehicle photo does not clearly show the registration plate number.',
    'Aadhar/PAN card details do not match the driver full legal name.',
  ];

  const docs = [
    {
      title: '1. Driving License',
      url: driver.kycDocuments?.drivingLicenseUrl,
      type: 'Official License Document',
    },
    {
      title: '2. Vehicle RC Book',
      url: driver.kycDocuments?.rcBookUrl,
      type: 'Registration Certificate',
    },
    {
      title: '3. Aadhar / PAN Card',
      url: driver.kycDocuments?.aadharPanUrl,
      type: 'Identity Verification',
    },
    {
      title: '4. Vehicle Front Photo',
      url: driver.kycDocuments?.vehiclePhotoUrl,
      type: 'Exterior Inspection',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-neutral-200 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-black text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={driver.profilePicUrl}
              alt={driver.fullName}
              className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';
              }}
            />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold font-sans">{driver.fullName}</h2>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    driver.verificationStatus === 'approved'
                      ? 'bg-emerald-500 text-white'
                      : driver.verificationStatus === 'rejected'
                      ? 'bg-red-500 text-white'
                      : 'bg-amber-400 text-black'
                  }`}
                >
                  Status: {driver.verificationStatus}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                {driver.email} • {driver.phone}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1.5 rounded-full hover:bg-neutral-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Vehicle Information Banner */}
          <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Car className="w-4 h-4 text-black" />
              <span>Vehicle Fleet Details</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-neutral-500 block">Fleet Category:</span>
                <span className="font-bold text-neutral-900 mt-0.5 block">
                  {driver.vehicleDetails?.category || 'Not specified'}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">Make & Model:</span>
                <span className="font-bold text-neutral-900 mt-0.5 block">
                  {driver.vehicleDetails?.makeModel || 'Not specified'}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">Number Plate:</span>
                <span className="font-mono font-bold text-neutral-900 mt-0.5 block">
                  {driver.vehicleDetails?.plateNumber || 'Not specified'}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">Color:</span>
                <span className="font-bold text-neutral-900 mt-0.5 block">
                  {driver.vehicleDetails?.color || 'Not specified'}
                </span>
              </div>
            </div>
          </div>

          {/* 4 Compliance Documents Side-by-Side */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-black" />
                <span>Uploaded Compliance Documents (4 Required)</span>
              </h3>
              <span className="text-xs text-neutral-400">Click any document to inspect zoom</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {docs.map((doc, idx) => (
                <div
                  key={idx}
                  className="bg-neutral-50 border border-neutral-200 rounded-2xl p-3 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-neutral-900">{doc.title}</span>
                    <span className="text-[10px] text-neutral-500">{doc.type}</span>
                  </div>

                  <div className="relative rounded-xl overflow-hidden h-40 bg-neutral-900 border border-neutral-300 group">
                    {doc.url ? (
                      <>
                        <img
                          src={doc.url}
                          alt={doc.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center space-x-2 transition">
                          <button
                            onClick={() => setPreviewImage({ title: doc.title, url: doc.url })}
                            className="bg-white text-black px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 shadow-md hover:bg-neutral-100"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Zoom Document</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-neutral-400">
                        Document Not Provided
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rejection Form Box if Rejecting */}
          {rejecting && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-3 animate-in fade-in">
              <div className="flex items-center space-x-2 text-xs font-bold text-red-900">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Provide Reason for Rejection:</span>
              </div>

              {/* Quick presets */}
              <div className="space-y-1">
                <span className="text-[11px] text-neutral-500">Quick preset reasons:</span>
                <div className="flex flex-wrap gap-1.5">
                  {reasonPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRejectionReason(preset)}
                      className="text-[11px] px-2.5 py-1 bg-white border border-neutral-300 hover:border-red-400 text-neutral-700 rounded-lg text-left"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter detailed instructions for the driver to correct..."
                className="w-full text-xs p-2.5 bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
              />

              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setRejecting(false)}
                  className="px-3 py-1.5 text-xs text-neutral-600 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRejectClick}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs"
                >
                  Confirm KYC Rejection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
          <div className="text-xs text-neutral-500">
            {driver.verificationStatus === 'pending'
              ? 'Pending administrator compliance review'
              : `Current decision: ${driver.verificationStatus}`}
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setRejecting(true)}
              className="px-4 py-2 border border-red-300 text-red-700 hover:bg-red-50 font-bold rounded-xl text-xs transition flex items-center space-x-1.5"
            >
              <XCircle className="w-4 h-4 text-red-600" />
              <span>Reject Application</span>
            </button>

            <button
              type="button"
              onClick={handleApproveClick}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center space-x-1.5 shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve Driver Partner</span>
            </button>
          </div>
        </div>

        {/* Full Image Zoom Overlay */}
        {previewImage && (
          <div
            className="fixed inset-0 z-60 bg-black/90 flex flex-col items-center justify-center p-4 animate-in fade-in"
            onClick={() => setPreviewImage(null)}
          >
            <div className="max-w-3xl w-full bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="px-4 py-3 bg-black flex items-center justify-between text-white text-xs font-bold">
                <span>{previewImage.title}</span>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="p-1 hover:bg-neutral-800 rounded"
                >
                  ✕ Close
                </button>
              </div>
              <div className="p-2 max-h-[75vh] flex items-center justify-center overflow-auto">
                <img
                  src={previewImage.url}
                  alt={previewImage.title}
                  className="max-h-[70vh] object-contain rounded"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
