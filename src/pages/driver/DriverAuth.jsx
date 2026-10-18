import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Phone, ArrowRight, Car, UserCheck, Shield, Sparkles } from 'lucide-react';

export const DriverAuth = ({ onStartOnboarding, initialMode = 'login' }) => {
  const { loginWithEmail, loginWithPhoneOTP } = useAuth();
  const navigate = useNavigate();

  const [authMode, setAuthMode] = useState(initialMode); // 'login' | 'signup'
  const [loginMethod, setLoginMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!email || !email.includes('@')) {
      setError('Please enter a valid partner email address.');
      setLoading(false);
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }
    try {
      await loginWithEmail(email, password, 'driver');
      navigate('/driver');
    } catch (err) {
      setError(err.message || 'Driver sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (!otpSent) {
      const cleanDigits = phone.replace(/\D/g, '');
      if (!cleanDigits || cleanDigits.length < 10) {
        setError('Please enter a valid 10-digit driver mobile phone number.');
        return;
      }
      setOtpSent(true);
      setOtp('');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await loginWithPhoneOTP(phone, otp, 'driver');
      navigate('/driver');
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-uber-lg border border-neutral-200 overflow-hidden">
        {/* Header */}
        <div className="bg-black text-white px-8 pt-8 pb-6">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black tracking-tight">Uber</span>
            <span className="text-xs font-bold px-2.5 py-1 bg-amber-400 text-black rounded-full flex items-center space-x-1">
              <Car className="w-3.5 h-3.5 mr-1" />
              <span>Driver Partner</span>
            </span>
          </div>
          <h2 className="text-xl font-bold mt-4 font-sans">
            Drive with Uber. Be your own boss.
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Sign in to access your earnings, trips, and partner account.
          </p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          {/* Toggle Email vs Phone */}
          <div className="flex bg-neutral-100 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginMethod('email');
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                loginMethod === 'email' ? 'bg-white text-black shadow-sm' : 'text-neutral-500'
              }`}
            >
              Email & Password
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod('phone');
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                loginMethod === 'phone' ? 'bg-white text-black shadow-sm' : 'text-neutral-500'
              }`}
            >
              Phone + OTP
            </button>
          </div>

          {loginMethod === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label htmlFor="driver-auth-email" className="block text-xs font-semibold text-neutral-700 mb-1">
                  Driver Partner Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                  <input
                    id="driver-auth-email"
                    name="driverAuthEmail"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="driver@example.com"
                    autoComplete="off"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="driver-auth-password" className="block text-xs font-semibold text-neutral-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                  <input
                    id="driver-auth-password"
                    name="driverAuthPassword"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter driver password"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-black hover:bg-neutral-800 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center space-x-2"
              >
                <span>Driver Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Driver Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              {otpSent && (
                <div>
                  <div className="mb-2 p-2.5 bg-neutral-100 border border-neutral-200 rounded-xl text-[11px] text-neutral-600">
                    Enter the 4-digit verification code sent to your registered partner mobile number.
                  </div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Enter 4-Digit OTP Code
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="1234"
                    className="w-full text-center tracking-widest font-bold py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-lg focus:ring-2 focus:ring-black"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-black hover:bg-neutral-800 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center space-x-2"
              >
                <span>{otpSent ? 'Verify OTP & Sign In' : 'Send Verification OTP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* New Driver Onboarding Button */}
          <div className="mt-8 pt-5 border-t border-neutral-200">
            <div className="text-center">
              <span className="text-xs text-neutral-500">Want to join Uber's fleet?</span>
              <button
                type="button"
                onClick={onStartOnboarding}
                className="mt-2 w-full py-2.5 bg-neutral-900 hover:bg-black text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-2 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Start New Driver KYC Registration</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
