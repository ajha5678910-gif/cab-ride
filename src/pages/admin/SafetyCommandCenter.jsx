import React, { useState } from 'react';
import { dbService } from '../../services/db';
import { MapView } from '../../components/map/MapView';
import { createVehicleIcon } from '../../components/map/MapMarkers';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Phone, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Play, 
  Volume2, 
  UserX, 
  Sparkles, 
  MapPin, 
  Users, 
  Radio, 
  FileText,
  Check
} from 'lucide-react';

export const SafetyCommandCenter = ({
  incidents = [],
  rides = [],
  onRefresh,
}) => {
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'active_critical' | 'investigating' | 'resolved'
  const [selectedIncidentId, setSelectedIncidentId] = useState(incidents[0]?.incidentId || null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Auto-select first incident if not selected
  const activeIncident = incidents.find((i) => i.incidentId === selectedIncidentId) || incidents[0] || null;

  // Filtered list
  const filteredIncidents = incidents.filter((inc) => {
    if (filterStatus === 'all') return true;
    return inc.status === filterStatus;
  });

  const criticalCount = incidents.filter((i) => i.status === 'active_critical').length;

  const showFeedback = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  };

  const handleFreezeDriver = (driverId) => {
    if (!driverId) {
      showFeedback('No driver partner attached to this incident.');
      return;
    }
    dbService.freezeDriverAccount(driverId, 'Emergency safety protocol hold triggered by Admin Dispatcher');
    if (onRefresh) onRefresh();
    showFeedback(`Driver account ${driverId} frozen and locked from online dispatch.`);
  };

  const handleResolveIncident = () => {
    if (!activeIncident) return;
    dbService.resolveSafetyIncident(
      activeIncident.incidentId,
      resolutionNotes || 'Contacted passenger and driver; situation verified and cleared by safety supervisor.'
    );
    setShowResolveModal(false);
    setResolutionNotes('');
    if (onRefresh) onRefresh();
    showFeedback(`Incident ${activeIncident.incidentId} marked as Resolved.`);
  };

  // Find corresponding ride if audio evidence exists
  const associatedRide = rides.find((r) => r.rideId === activeIncident?.rideId);
  const audioEvidenceList = associatedRide?.audioRecordings || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Action Notification Toast */}
      {actionMessage && (
        <div className="bg-neutral-900 text-white p-3.5 rounded-2xl border border-neutral-700 flex items-center justify-between text-xs font-semibold shadow-xl animate-in slide-in-from-top-2">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{actionMessage}</span>
          </div>
          <button type="button" onClick={() => setActionMessage(null)} className="text-neutral-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Top Incident Summary Bar */}
      <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-uber-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            criticalCount > 0 ? 'bg-red-600 text-white animate-pulse' : 'bg-emerald-100 text-emerald-800'
          }`}>
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-red-600">
                24x7 Safety & SOS Response Center
              </span>
              {criticalCount > 0 && (
                <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce">
                  {criticalCount} CRITICAL ALERT{criticalCount > 1 ? 'S' : ''}
                </span>
              )}
            </div>
            <h2 className="text-xl font-black text-neutral-900 mt-0.5">
              Emergency Incident Response Console
            </h2>
            <p className="text-xs text-neutral-500">
              Live distress monitoring, vehicle GPS coordinates, audio evidence, and immediate dispatcher intervention.
            </p>
          </div>
        </div>

        {/* Live Ingestion Indicator */}
        <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3.5 py-2 rounded-2xl text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-Time Ingestion Active</span>
        </div>
      </div>

      {/* Main Console Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Incidents Queue (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-neutral-200 shadow-uber-subtle p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-neutral-900">Incident Feed ({incidents.length})</h3>
            
            {/* Filter Chips */}
            <div className="flex bg-neutral-100 p-1 rounded-xl text-[10px] font-bold space-x-1">
              {['all', 'active_critical', 'resolved'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilterStatus(st)}
                  className={`px-2 py-1 rounded-lg capitalize transition ${
                    filterStatus === st ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {filteredIncidents.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 space-y-2">
              <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
              <div className="text-xs font-bold text-neutral-700">All Safe — Zero Active Alerts</div>
              <p className="text-[11px] text-neutral-500 max-w-xs mx-auto">
                No active SOS signals or unresolved RideCheck anomalies reported.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredIncidents.map((inc) => {
                const isSelected = inc.incidentId === activeIncident?.incidentId;
                const isCritical = inc.status === 'active_critical';

                return (
                  <div
                    key={inc.incidentId}
                    onClick={() => setSelectedIncidentId(inc.incidentId)}
                    className={`p-4 rounded-2xl border text-xs cursor-pointer transition space-y-2 ${
                      isSelected
                        ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        isCritical
                          ? 'bg-red-600 text-white animate-pulse'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {inc.type.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div>
                      <div className="font-bold text-neutral-900 text-sm">
                        {inc.customerDetails?.name || 'Customer'}
                      </div>
                      <div className="text-[11px] text-neutral-500 truncate">
                        {inc.liveCoordinates?.address || 'Live Road GPS Coordinates'}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                      <span className="font-mono text-neutral-700 font-semibold">
                        {inc.vehicleDetails?.plateNumber || 'DL 01 AB 1234'}
                      </span>
                      <span className={`capitalize font-bold ${
                        isCritical ? 'text-red-600' : 'text-emerald-700'
                      }`}>
                        {inc.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Selected Incident Detailed Response Console (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-neutral-200 shadow-uber-subtle p-6 space-y-6">
          {!activeIncident ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-neutral-400 space-y-3">
              <ShieldAlert className="w-12 h-12 text-neutral-300" />
              <div className="font-bold text-sm text-neutral-700">No Incident Selected</div>
              <p className="text-xs text-neutral-500">
                Select an active incident from the feed to review telemetry, rider contacts, and intervention protocols.
              </p>
            </div>
          ) : (
            <>
              {/* Incident Header & Status Badge */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-neutral-400">{activeIncident.incidentId}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      activeIncident.status === 'active_critical'
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {activeIncident.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-neutral-900 mt-1">
                    {activeIncident.type.replace('_', ' ')} — {activeIncident.customerDetails?.name}
                  </h3>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-neutral-700">
                    Triggered by: <span className="uppercase text-red-600 font-extrabold">{activeIncident.triggeredBy}</span>
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    {new Date(activeIncident.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Distressed Vehicle Live Map */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-800 flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-600" />
                    <span>Distressed Vehicle Live GPS Telemetry:</span>
                  </span>
                  <span className="font-mono text-neutral-500 text-[10px]">
                    Lat: {activeIncident.liveCoordinates?.lat.toFixed(5)}, Lng: {activeIncident.liveCoordinates?.lng.toFixed(5)}
                  </span>
                </div>

                <div className="h-52 w-full rounded-2xl overflow-hidden border border-neutral-300 relative shadow-inner">
                  <MapView
                    center={[activeIncident.liveCoordinates?.lat || 28.6315, activeIncident.liveCoordinates?.lng || 77.2167]}
                    zoom={15}
                    className="h-full w-full"
                    interactive={false}
                  >
                    <L.Marker
                      position={[activeIncident.liveCoordinates?.lat || 28.6315, activeIncident.liveCoordinates?.lng || 77.2167]}
                      icon={createVehicleIcon('Uber Go', 0)}
                    />
                  </MapView>

                  <div className="absolute bottom-3 left-3 z-[400] bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-xl flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span>{activeIncident.liveCoordinates?.address || 'Near Connaught Place'}</span>
                  </div>
                </div>
              </div>

              {/* Two Parties Cards: Customer & Driver */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Customer Details */}
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
                  <div className="text-[10px] font-bold uppercase text-neutral-500">Passenger in Distress</div>
                  <div className="font-bold text-neutral-900 text-sm">{activeIncident.customerDetails?.name}</div>
                  <div className="text-xs text-neutral-600 font-mono flex items-center space-x-1">
                    <Phone className="w-3 h-3 text-neutral-400" />
                    <span>{activeIncident.customerDetails?.phone}</span>
                  </div>
                  <a
                    href={`tel:${activeIncident.customerDetails?.phone}`}
                    className="w-full mt-2 py-2 bg-neutral-900 hover:bg-black text-white font-bold rounded-xl text-[11px] flex items-center justify-center space-x-1.5 transition"
                  >
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span>Call Passenger (VoIP)</span>
                  </a>
                </div>

                {/* Driver Partner Details */}
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
                  <div className="text-[10px] font-bold uppercase text-neutral-500">Driver Partner & Vehicle</div>
                  <div className="font-bold text-neutral-900 text-sm">{activeIncident.driverDetails?.name || 'Driver'}</div>
                  <div className="text-xs text-neutral-600 font-mono">
                    {activeIncident.vehicleDetails?.plateNumber} • {activeIncident.vehicleDetails?.makeModel}
                  </div>
                  <a
                    href={`tel:${activeIncident.driverDetails?.phone}`}
                    className="w-full mt-2 py-2 bg-neutral-900 hover:bg-black text-white font-bold rounded-xl text-[11px] flex items-center justify-center space-x-1.5 transition"
                  >
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span>Call Driver Partner</span>
                  </a>
                </div>
              </div>

              {/* Notified Emergency Contacts Table */}
              {activeIncident.notifiedEmergencyContacts && activeIncident.notifiedEmergencyContacts.length > 0 && (
                <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-2 text-xs">
                  <div className="font-bold text-amber-900 flex items-center space-x-1.5">
                    <Users className="w-4 h-4 text-amber-600" />
                    <span>Emergency SMS Alerts Dispatched:</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    {activeIncident.notifiedEmergencyContacts.map((c, i) => (
                      <div key={i} className="flex justify-between text-neutral-700 bg-white/70 p-1.5 rounded-lg border border-amber-200/60">
                        <span className="font-semibold">{c.name} ({c.phone})</span>
                        <span className="text-amber-700 font-mono">Alerted at {c.notifiedAt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Audio Evidence Player Section */}
              <div className="p-4 bg-neutral-900 text-white rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold flex items-center space-x-1.5 text-amber-400">
                    <Volume2 className="w-4 h-4" />
                    <span>Encrypted Audio Evidence</span>
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    {audioEvidenceList.length} recording(s) available
                  </span>
                </div>

                {audioEvidenceList.length === 0 ? (
                  <p className="text-[11px] text-neutral-400">
                    No in-trip audio recordings were submitted for this ride.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {audioEvidenceList.map((audio) => (
                      <div key={audio.id} className="bg-neutral-800 p-2.5 rounded-xl border border-neutral-700 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-neutral-200">
                            Recorded by: <strong className="uppercase text-amber-300">{audio.recordedBy}</strong>
                          </span>
                          <span className="text-neutral-400 font-mono">
                            {new Date(audio.timestamp).toLocaleTimeString()} ({audio.durationSeconds}s)
                          </span>
                        </div>
                        <audio controls src={audio.audioDataUrl} className="w-full h-8" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Admin Actions Bar */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => handleFreezeDriver(activeIncident.driverDetails?.id)}
                  className="px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-2xl text-xs flex items-center space-x-1.5 transition"
                >
                  <UserX className="w-4 h-4 text-red-600" />
                  <span>Freeze Driver Account</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowResolveModal(true)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center space-x-1.5 transition shadow"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Incident Resolved</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Resolve Incident Dialog Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-neutral-900">Resolve Safety Incident</h3>
            <p className="text-xs text-neutral-500">
              Please enter dispatch resolution notes and protocol outcomes for the official safety audit trail:
            </p>

            <textarea
              rows={3}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g. Contacted passenger and driver; verified false alarm or resolved with local patrol unit."
              className="w-full p-3 text-xs bg-neutral-50 border border-neutral-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black text-neutral-900"
            />

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResolveModal(false)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-black"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResolveIncident}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
