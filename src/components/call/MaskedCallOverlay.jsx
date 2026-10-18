import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Radio, 
  Grid3X3,
  User,
  Car
} from 'lucide-react';

export const MaskedCallOverlay = ({
  ride,
  currentRole, // 'customer' | 'driver'
  onClose,
}) => {
  const [callStatus, setCallStatus] = useState('ringing'); // 'ringing' | 'connected'
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);

  const callState = ride?.maskedCallState;
  const isCaller = callState?.callerRole === currentRole;
  const otherPartyName = currentRole === 'customer' ? ride?.driverName || 'Driver Partner' : ride?.customerName || 'Passenger';
  const otherPartyRole = currentRole === 'customer' ? 'Driver Partner' : 'Passenger';
  const maskedNumber = callState?.maskedVirtualNumber || '+91 22-5092-4821';

  // Call connection simulation (auto connects after 2.5 seconds if caller)
  useEffect(() => {
    if (!callState?.isActive) return;

    const connectTimeout = setTimeout(() => {
      setCallStatus('connected');
    }, 2500);

    return () => clearTimeout(connectTimeout);
  }, [callState?.isActive]);

  // Duration timer when connected
  useEffect(() => {
    if (callStatus !== 'connected') return;

    const timer = setInterval(() => {
      setDurationSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [callStatus]);

  const handleEndCall = () => {
    if (ride?.rideId) {
      dbService.endMaskedCall(ride.rideId);
    }
    if (onClose) onClose();
  };

  const handleAnswerCall = () => {
    setCallStatus('connected');
    if (ride?.rideId) {
      dbService.updateMaskedCall(ride.rideId, { isActive: true });
    }
  };

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // If this role is receiving an incoming call that isn't connected yet
  const isIncomingForMe = callState?.isActive && !isCaller && callStatus === 'ringing';

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 text-white w-full max-w-sm rounded-3xl p-6 flex flex-col items-center justify-between min-h-[490px] shadow-2xl relative overflow-hidden">
        {/* Top Privacy Tag */}
        <div className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 bg-neutral-800/80 rounded-full border border-neutral-700 text-[11px] text-neutral-300">
          <ShieldCheck className="w-3.5 h-3.5 text-uber-blue" />
          <span>Uber Masked Call • Number Hidden</span>
        </div>

        {/* Central Caller Info */}
        <div className="flex flex-col items-center space-y-3 mt-4 text-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-neutral-800 to-neutral-700 border-2 border-neutral-600 flex items-center justify-center shadow-xl">
              {currentRole === 'customer' ? (
                <Car className="w-12 h-12 text-amber-400" />
              ) : (
                <User className="w-12 h-12 text-uber-blue" />
              )}
            </div>
            {callStatus === 'connected' && (
              <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-neutral-900 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </span>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">{otherPartyName}</h2>
            <div className="text-xs text-neutral-400 mt-0.5">{otherPartyRole}</div>
            <div className="text-xs font-mono text-neutral-500 mt-1">
              Virtual Bridge: {maskedNumber}
            </div>
          </div>

          <div className="pt-1">
            {callStatus === 'ringing' ? (
              <div className="flex items-center space-x-2 text-xs font-medium text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                <Radio className="w-3.5 h-3.5 animate-spin" />
                <span>{isIncomingForMe ? 'Incoming Call...' : 'Calling via secure VoIP bridge...'}</span>
              </div>
            ) : (
              <div className="text-sm font-mono font-bold text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/20">
                {formatTimer(durationSeconds)}
              </div>
            )}
          </div>
        </div>

        {/* Middle Dialpad (toggleable) */}
        {showKeypad && (
          <div className="grid grid-cols-3 gap-2 w-full max-w-[220px] my-2 text-center">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
              <button
                key={k}
                type="button"
                className="w-12 h-10 mx-auto rounded-xl bg-neutral-800 hover:bg-neutral-700 text-sm font-mono font-bold text-neutral-200 transition"
              >
                {k}
              </button>
            ))}
          </div>
        )}

        {/* Bottom Call Controls */}
        <div className="w-full mt-6 space-y-4">
          {isIncomingForMe ? (
            /* Incoming Call Actions: Accept or Decline */
            <div className="flex items-center justify-around w-full">
              <button
                type="button"
                onClick={handleEndCall}
                className="flex flex-col items-center space-y-1 group"
              >
                <div className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition shadow-lg shadow-red-600/30">
                  <PhoneOff className="w-6 h-6 text-white" />
                </div>
                <span className="text-[11px] text-neutral-400">Decline</span>
              </button>

              <button
                type="button"
                onClick={handleAnswerCall}
                className="flex flex-col items-center space-y-1 group"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center transition shadow-lg shadow-emerald-600/30 animate-bounce">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold">Answer</span>
              </button>
            </div>
          ) : (
            /* Active Call Controls */
            <>
              <div className="grid grid-cols-3 gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className={`py-3 rounded-2xl flex flex-col items-center justify-center space-y-1 text-xs transition border ${
                    isMuted
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  <span className="text-[10px]">{isMuted ? 'Muted' : 'Mute'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowKeypad(!showKeypad)}
                  className={`py-3 rounded-2xl flex flex-col items-center justify-center space-y-1 text-xs transition border ${
                    showKeypad
                      ? 'bg-neutral-700 border-neutral-500 text-white'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                  <span className="text-[10px]">Keypad</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSpeaker(!isSpeaker)}
                  className={`py-3 rounded-2xl flex flex-col items-center justify-center space-y-1 text-xs transition border ${
                    isSpeaker
                      ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  {isSpeaker ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  <span className="text-[10px]">{isSpeaker ? 'Speaker' : 'Earpiece'}</span>
                </button>
              </div>

              {/* Big Red End Call Button */}
              <button
                type="button"
                onClick={handleEndCall}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-red-600/30"
              >
                <PhoneOff className="w-5 h-5" />
                <span>End Call</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
