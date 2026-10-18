import React, { useState, useEffect, useRef } from 'react';
import { dbService } from '../../services/db';
import { 
  X, 
  Send, 
  Check, 
  CheckCheck, 
  MessageSquare, 
  Phone, 
  ShieldCheck, 
  Sparkles,
  Car,
  User
} from 'lucide-react';

export const InAppChatDrawer = ({
  ride,
  currentRole, // 'customer' | 'driver'
  currentUserName,
  onClose,
  onTriggerCall,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  // Mark unread messages as read when drawer is open
  useEffect(() => {
    if (ride?.rideId) {
      dbService.markChatRead(ride.rideId, currentRole);
    }
  }, [ride?.rideId, ride?.chatMessages?.length, currentRole]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ride?.chatMessages?.length]);

  if (!ride) return null;

  const messages = ride.chatMessages || [];
  const otherPartyName = currentRole === 'customer' ? ride.driverName || 'Driver Partner' : ride.customerName || 'Passenger';
  const otherPartyRole = currentRole === 'customer' ? 'Driver' : 'Passenger';

  const customerQuickReplies = [
    'I am at the pickup pin',
    'Wearing a black shirt',
    'Coming in 2 mins',
    'Please call me',
    'Please wait 2 mins near the gate',
  ];

  const driverQuickReplies = [
    "I've arrived at pickup",
    'Stuck in traffic, 2 mins away',
    'Where are you standing?',
    'OK, got it!',
    'Hazard lights are ON',
  ];

  const quickReplies = currentRole === 'customer' ? customerQuickReplies : driverQuickReplies;

  const handleSend = (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || !ride.rideId) return;

    dbService.sendChatMessage(ride.rideId, {
      senderRole: currentRole,
      senderName: currentUserName || (currentRole === 'customer' ? 'Customer' : 'Driver'),
      text,
    });

    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-white border border-neutral-700">
              {currentRole === 'customer' ? <Car className="w-5 h-5 text-amber-400" /> : <User className="w-5 h-5 text-uber-blue" />}
            </div>
            <div>
              <div className="font-bold text-sm flex items-center space-x-1.5">
                <span>{otherPartyName}</span>
                <span className="text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-300 font-normal">
                  {otherPartyRole}
                </span>
              </div>
              <div className="text-[11px] text-neutral-400 flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                <span>Masked & Encrypted In-App Chat</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {onTriggerCall && (
              <button
                type="button"
                onClick={onTriggerCall}
                title="Masked Privacy Call"
                className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-xl transition"
              >
                <Phone className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Masked Privacy Note */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-[11px] text-amber-900 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span>Phone numbers are masked to protect personal privacy.</span>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 shadow-sm">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="font-bold text-xs text-neutral-700">No messages yet</div>
              <p className="text-[11px] max-w-xs text-neutral-500">
                Coordinate pickup location, landmarks, or special arrival instructions directly with {otherPartyName}.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderRole === currentRole;
              const isSystem = msg.senderRole === 'system';

              if (isSystem) {
                return (
                  <div key={msg.id} className="text-center my-2">
                    <span className="text-[10px] bg-neutral-200/80 text-neutral-700 px-3 py-1 rounded-full font-medium">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                      isMe
                        ? 'bg-black text-white rounded-br-none'
                        : 'bg-white text-neutral-900 border border-neutral-200 rounded-bl-none'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <div
                      className={`text-[9px] mt-1 flex items-center justify-end space-x-1 ${
                        isMe ? 'text-neutral-400' : 'text-neutral-500'
                      }`}
                    >
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {isMe && (
                        <span>
                          {msg.isRead ? (
                            <CheckCheck className="w-3 h-3 text-cyan-400" />
                          ) : (
                            <Check className="w-3 h-3 text-neutral-400" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Reply Chips */}
        <div className="p-2.5 bg-white border-t border-neutral-200 overflow-x-auto flex space-x-2 no-scrollbar">
          {quickReplies.map((reply, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(reply)}
              className="text-[11px] whitespace-nowrap bg-neutral-100 hover:bg-neutral-200 active:scale-95 text-neutral-800 font-medium px-3 py-1.5 rounded-full border border-neutral-200 transition"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-neutral-200 flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${otherPartyName}...`}
            className="flex-1 bg-neutral-100 border border-neutral-200 rounded-2xl px-4 py-2.5 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            type="button"
            disabled={!inputText.trim()}
            onClick={() => handleSend()}
            className="w-10 h-10 rounded-2xl bg-black hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-black text-white flex items-center justify-center transition shadow"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
