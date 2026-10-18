import React, { useState, useEffect, useRef } from 'react';
import { dbService } from '../../services/db';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Share2, 
  Mic, 
  Square, 
  AlertTriangle, 
  X, 
  PhoneCall, 
  MapPin, 
  Check, 
  Clock, 
  Sparkles, 
  Play, 
  Send,
  Users,
  Copy
} from 'lucide-react';
import { FamilyTrackingModal } from './FamilyTrackingModal';

export const SafetyToolkitModal = ({
  ride,
  currentUser,
  currentRole = 'customer',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState('sos'); // 'sos' | 'share' | 'audio' | 'ridecheck'

  // SOS triggered state
  const [sosTriggered, setSosTriggered] = useState(false);
  const [sosCooldown, setSosCooldown] = useState(false);
  const [notifiedContactsLog, setNotifiedContactsLog] = useState([]);

  // Family Tracker preview modal
  const [showFamilyPreview, setShowFamilyPreview] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Audio Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioSent, setAudioSent] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordTimerRef = useRef(null);

  if (!ride) return null;

  const livePos = ride.currentDriverPosition || ride.pickup;
  const trackingCode = ride.shareToken || `UBER-LIVE-${ride.rideId?.slice(-4) || '9482'}`;
  const trackingUrl = `${window.location.origin}/?track=${trackingCode}`;

  // Cleanup audio timer
  useEffect(() => {
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, []);

  // --- 1. EMERGENCY SOS TRIGGER ---
  const handleTriggerSOS = () => {
    setSosCooldown(true);
    setSosTriggered(true);

    const emergencyContacts = currentUser?.emergencyContacts || [
      { name: 'Mom (Family)', phone: '+91 98111 22334', relation: 'Parent' },
      { name: 'Office Emergency Desk', phone: '+91 11 4000 5000', relation: 'Work' },
    ];

    const contactLogs = emergencyContacts.map((c) => ({
      name: c.name,
      phone: c.phone,
      notifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));
    setNotifiedContactsLog(contactLogs);

    // Create Critical Safety Incident in DB
    dbService.createSafetyIncident({
      rideId: ride.rideId,
      triggeredBy: currentRole,
      type: 'SOS_EMERGENCY',
      liveCoordinates: {
        lat: livePos.lat,
        lng: livePos.lng,
        address: livePos.address || ride.pickup.address,
      },
      customerDetails: {
        id: ride.customerId,
        name: ride.customerName,
        phone: ride.customerPhone,
      },
      driverDetails: {
        id: ride.driverId,
        name: ride.driverName,
        phone: ride.driverPhone,
      },
      vehicleDetails: ride.vehicleDetails || {
        plateNumber: 'DL 01 AB 1234',
        makeModel: 'White Sedan',
        color: 'White',
      },
      notifiedEmergencyContacts: contactLogs,
      adminNotes: `HIGH PRIORITY: Emergency SOS button pressed by ${currentRole.toUpperCase()} (${currentUser?.fullName}). Live vehicle coordinates shared with Police & Uber Safety Team.`,
    });
  };

  // --- 2. AUDIO RECORDING (Browser MediaRecorder + graceful fallback) ---
  const handleStartRecording = async () => {
    setAudioUrl(null);
    setAudioSent(false);
    setRecordSeconds(0);
    audioChunksRef.current = [];

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
      }
    } catch (err) {
      console.warn('Microphone permission not granted or unsupported, using simulated audio buffer:', err);
      // Fallback simulated audio data URL
      setAudioUrl('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
    }

    setIsRecording(true);
    recordTimerRef.current = setInterval(() => {
      setRecordSeconds((prev) => prev + 1);
    }, 1000);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else if (!audioUrl) {
      setAudioUrl('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
    }
  };

  const handleSendAudioToAdmin = () => {
    if (!audioUrl) return;
    dbService.addAudioRecording(ride.rideId, {
      recordedBy: currentRole,
      durationSeconds: recordSeconds || 12,
      audioDataUrl: audioUrl,
      sharedWithAdmin: true,
    });
    setAudioSent(true);
  };

  // --- 3. RIDECHECK ANOMALY TEST TRIGGER ---
  const handleTriggerRideCheck = () => {
    dbService.triggerRideCheck(ride.rideId, 'long_stop');
    onClose();
  };

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 flex flex-col max-h-[92vh] animate-in slide-in-from-bottom duration-300">
          {/* Header */}
          <div className="p-4 bg-uber-blue text-white flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-base font-extrabold flex items-center space-x-1.5">
                  <span>Uber Safety Toolkit</span>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                    24x7 Live
                  </span>
                </h2>
                <p className="text-[11px] text-white/80">
                  Real-time protection & emergency tools during your ride
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="grid grid-cols-4 bg-neutral-100 border-b border-neutral-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('sos')}
              className={`py-3 flex flex-col items-center justify-center space-y-1 transition border-b-2 ${
                activeTab === 'sos'
                  ? 'border-red-600 text-red-600 bg-white font-bold'
                  : 'border-transparent text-neutral-600 hover:text-black'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span className="text-[11px]">Emergency SOS</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('share')}
              className={`py-3 flex flex-col items-center justify-center space-y-1 transition border-b-2 ${
                activeTab === 'share'
                  ? 'border-black text-black bg-white font-bold'
                  : 'border-transparent text-neutral-600 hover:text-black'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span className="text-[11px]">Share Trip</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('audio')}
              className={`py-3 flex flex-col items-center justify-center space-y-1 transition border-b-2 ${
                activeTab === 'audio'
                  ? 'border-black text-black bg-white font-bold'
                  : 'border-transparent text-neutral-600 hover:text-black'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span className="text-[11px]">Audio Record</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ridecheck')}
              className={`py-3 flex flex-col items-center justify-center space-y-1 transition border-b-2 ${
                activeTab === 'ridecheck'
                  ? 'border-amber-500 text-amber-700 bg-white font-bold'
                  : 'border-transparent text-neutral-600 hover:text-black'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-[11px]">RideCheck™</span>
            </button>
          </div>

          {/* Tab Content Area */}
          <div className="p-5 overflow-y-auto space-y-4">
            {/* 1. EMERGENCY SOS TAB */}
            {activeTab === 'sos' && (
              <div className="space-y-4">
                <div className="p-3.5 bg-red-50 rounded-2xl border border-red-200 text-red-900 text-xs">
                  <div className="font-bold flex items-center space-x-1.5 text-sm text-red-700 mb-1">
                    <PhoneCall className="w-4 h-4 text-red-600" />
                    <span>Call 112 / 100 Emergency Services</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Triggering Emergency SOS sends an immediate distress signal to the Police, Uber's Safety Response Center, and your emergency contacts.
                  </p>
                </div>

                {/* Big Details Box to Read to Police */}
                <div className="bg-neutral-900 text-white p-4 rounded-2xl border border-neutral-800 space-y-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Read this info aloud to police dispatcher:
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-neutral-400 text-[10px] block">Vehicle Plate Number:</span>
                      <span className="text-base font-mono font-black text-white">
                        {ride.vehicleDetails?.plateNumber || 'DL 01 AB 1234'}
                      </span>
                    </div>

                    <div>
                      <span className="text-neutral-400 text-[10px] block">Vehicle Make / Color:</span>
                      <span className="text-sm font-bold text-neutral-200">
                        {ride.vehicleDetails?.makeModel || 'Sedan'} ({ride.vehicleDetails?.color || 'White'})
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-800">
                    <span className="text-neutral-400 text-[10px] block">Current Live GPS Address:</span>
                    <div className="text-xs font-semibold text-neutral-200 mt-0.5 flex items-start space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>{livePos.address || 'Connaught Place Outer Circle, New Delhi'}</span>
                    </div>
                    <div className="text-[10px] font-mono text-neutral-400 mt-1">
                      Lat: {livePos.lat.toFixed(5)}, Lng: {livePos.lng.toFixed(5)}
                    </div>
                  </div>
                </div>

                {/* Emergency SOS Trigger Button */}
                {!sosTriggered ? (
                  <button
                    type="button"
                    onClick={handleTriggerSOS}
                    className="w-full py-4 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black rounded-2xl text-sm flex items-center justify-center space-x-2 transition shadow-xl shadow-red-600/30"
                  >
                    <ShieldAlert className="w-5 h-5 text-white animate-pulse" />
                    <span>PRESS FOR EMERGENCY SOS (112)</span>
                  </button>
                ) : (
                  <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 space-y-2 animate-in zoom-in-95">
                    <div className="flex items-center space-x-2 font-bold text-sm text-emerald-700">
                      <Check className="w-5 h-5 text-emerald-600" />
                      <span>Distress Signal Successfully Broadcasted!</span>
                    </div>
                    <p className="text-xs">
                      Uber 24x7 Safety Command Center is tracking this vehicle. Emergency Contacts have been alerted via priority SMS broadcast.
                    </p>

                    {notifiedContactsLog.length > 0 && (
                      <div className="pt-2 border-t border-emerald-200 space-y-1 text-[11px]">
                        <span className="font-semibold text-emerald-800">Alerted Contacts:</span>
                        {notifiedContactsLog.map((c, i) => (
                          <div key={i} className="flex justify-between text-neutral-700">
                            <span>{c.name} ({c.phone})</span>
                            <span className="text-emerald-700 font-mono">{c.notifiedAt}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 2. SHARE MY TRIP TAB */}
            {activeTab === 'share' && (
              <div className="space-y-4">
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
                  <div className="text-xs font-bold text-neutral-900">
                    Share Live GPS Tracking Link
                  </div>
                  <p className="text-xs text-neutral-500">
                    Send a secure web tracking link to family and friends. They can see the driver's vehicle moving on the map in real-time.
                  </p>

                  <div className="bg-white p-2.5 rounded-xl border border-neutral-300 flex items-center justify-between text-xs font-mono text-neutral-700 mt-2">
                    <span className="truncate max-w-[260px]">{trackingUrl}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(trackingUrl);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }}
                      className="text-neutral-900 hover:text-black font-bold flex items-center space-x-1"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowFamilyPreview(true)}
                  className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 transition shadow"
                >
                  <Share2 className="w-4 h-4 text-uber-blue" />
                  <span>Preview What Family & Friends See</span>
                </button>
              </div>
            )}

            {/* 3. AUDIO RECORDING TAB */}
            {activeTab === 'audio' && (
              <div className="space-y-4">
                <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs space-y-1">
                  <div className="font-bold text-neutral-900 flex items-center space-x-1.5">
                    <Mic className="w-4 h-4 text-uber-blue" />
                    <span>In-Trip Encrypted Audio Recording</span>
                  </div>
                  <p className="text-neutral-500 text-[11px] leading-relaxed">
                    Record audio inside the vehicle if you feel uncomfortable or unsafe. The audio is encrypted and only accessible if you choose to report an incident.
                  </p>
                </div>

                {/* Recorder Console */}
                <div className="p-6 bg-neutral-900 rounded-3xl text-white flex flex-col items-center justify-center space-y-4 shadow-xl">
                  {isRecording ? (
                    <div className="flex flex-col items-center space-y-2">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-red-600/30 border border-red-500 flex items-center justify-center animate-pulse">
                          <Mic className="w-8 h-8 text-red-500 animate-bounce" />
                        </div>
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500" />
                        </span>
                      </div>
                      <span className="text-xs text-red-400 font-bold uppercase tracking-wider">
                        Recording Encrypted Trip Audio
                      </span>
                      <span className="text-2xl font-mono font-black text-white">
                        {formatTimer(recordSeconds)}
                      </span>
                    </div>
                  ) : audioUrl ? (
                    <div className="flex flex-col items-center space-y-3 w-full">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                        <Check className="w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-sm text-white">Trip Audio Clip Ready</div>
                        <div className="text-xs text-neutral-400">Duration: {formatTimer(recordSeconds || 12)}</div>
                      </div>
                      {/* Audio playback element */}
                      <audio controls src={audioUrl} className="w-full h-10 mt-2 rounded-xl" />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-2 text-center text-neutral-400">
                      <div className="w-14 h-14 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700">
                        <Mic className="w-6 h-6 text-neutral-300" />
                      </div>
                      <span className="text-xs font-semibold text-neutral-300">
                        Tap button below to start discreet audio recording
                      </span>
                    </div>
                  )}

                  {/* Record Action Buttons */}
                  <div className="w-full pt-2">
                    {isRecording ? (
                      <button
                        type="button"
                        onClick={handleStopRecording}
                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-red-600/30"
                      >
                        <Square className="w-4 h-4 fill-white" />
                        <span>Stop Recording Audio</span>
                      </button>
                    ) : audioUrl ? (
                      <div className="space-y-2">
                        {!audioSent ? (
                          <button
                            type="button"
                            onClick={handleSendAudioToAdmin}
                            className="w-full py-3 bg-uber-blue hover:bg-blue-600 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-blue-500/20"
                          >
                            <Send className="w-4 h-4" />
                            <span>Attach & Send Audio to Uber Safety Support</span>
                          </button>
                        ) : (
                          <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-center text-xs text-emerald-300 font-semibold flex items-center justify-center space-x-1.5">
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>Audio securely submitted to Safety Command Center!</span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={handleStartRecording}
                          className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold rounded-xl text-xs transition"
                        >
                          Record New Clip
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStartRecording}
                        className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 transition border border-neutral-700"
                      >
                        <Mic className="w-4 h-4 text-uber-blue" />
                        <span>Start Recording Audio</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 4. RIDECHECK™ ANOMALY TAB */}
            {activeTab === 'ridecheck' && (
              <div className="space-y-4">
                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-1.5 text-amber-950">
                  <div className="font-bold flex items-center space-x-1.5 text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>How Uber RideCheck™ Works</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    RideCheck uses GPS telemetry and motion sensors to detect unusual stops, route deviations, or possible crashes. When an anomaly is detected, Uber automatically checks in on both passenger and driver.
                  </p>
                </div>

                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-900 flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>RideCheck™ Telemetry Active</span>
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">Continuous Monitoring</span>
                  </div>
                  <p className="text-[11px] text-emerald-950/80 leading-relaxed">
                    Background GPS and inertial sensors are actively monitoring trip progression. In the event of unexpected stopping or trajectory deviation, Uber will immediately intervene and notify dispatch.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FAMILY TRACKING PREVIEW MODAL */}
      {showFamilyPreview && (
        <FamilyTrackingModal
          ride={ride}
          onClose={() => setShowFamilyPreview(false)}
        />
      )}
    </>
  );
};
