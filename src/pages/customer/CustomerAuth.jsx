import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Phone, Mail, Lock, Shield, ArrowRight, UserCheck, CheckCircle } from 'lucide-react';

export const CustomerAuth = ({ initialMode = 'login' }) => {
  const { loginWithEmail, loginWithPhoneOTP, signUpCustomer } = useAuth();
  const navigate = useNavigate();
  
  const [authMode, setAuthMode] = useState(initialMode); // 'login' | 'signup'
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' | 'phone'
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [fullName, setFullName] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      if (authMode === 'login') {
        await loginWithEmail(email, password, 'customer');
      } else {
        if (!fullName.trim()) {
          throw new Error('Please enter your full name.');
        }
        await signUpCustomer({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone || '+91 98000 00000',
        });
      }
      navigate('/customer');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    const cleanDigits = phone.replace(/\D/g, '');
    if (!cleanDigits || cleanDigits.length < 10) {
      setError('Please enter a valid 10-digit mobile phone number.');
      return;
    }
    setError('');
    setOtpSent(true);
    setOtp('');
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithPhoneOTP(phone, otp, 'customer');
      navigate('/customer');
    } catch (err) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-uber-lg border border-neutral-200 overflow-hidden">
        {/* Uber brand banner */}
        <div className="bg-black text-white px-8 pt-8 pb-6">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black tracking-tight">Uber</span>
            <span className="text-xs font-semibold px-2.5 py-1 bg-neutral-800 rounded-full text-neutral-300">
              Rider Account
            </span>
          </div>
          <h2 className="text-xl font-bold mt-4 font-sans">
            {authMode === 'login' ? 'Rider Sign In' : 'Create Rider Account'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Request rides, track drivers in real time, and travel safely.
          </p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium animate-in fade-in">
              {error}
            </div>
          )}

          {/* Login method toggle */}
          <div className="flex bg-neutral-100 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginMethod('email');
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center space-x-1.5 ${
                loginMethod === 'email'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-neutral-500 hover:text-black'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email & Password</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod('phone');
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center space-x-1.5 ${
                loginMethod === 'phone'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-neutral-500 hover:text-black'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Phone + OTP</span>
            </button>
          </div>

          {/* Email Form */}
          {loginMethod === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label htmlFor="rider-fullname" className="block text-xs font-semibold text-neutral-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="rider-fullname"
                    name="riderFullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    autoComplete="off"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
                  />
                </div>
              )}

              <div>
                <label htmlFor="rider-email" className="block text-xs font-semibold text-neutral-700 mb-1">
                  Rider Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                  <input
                    id="rider-email"
                    name="riderEmail"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rider@example.com"
                    autoComplete="off"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="rider-password" className="block text-xs font-semibold text-neutral-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                  <input
                    id="rider-password"
                    name="riderPassword"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-black hover:bg-neutral-800 text-white font-semibold rounded-xl text-sm transition flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
              >
                <span>{authMode === 'login' ? 'Sign In as Rider' : 'Create Rider Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Phone Form */}
          {loginMethod === 'phone' && (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 555-0192"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
                      />
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      A 4-digit verification code will be sent to this number.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-black hover:bg-neutral-800 text-white font-semibold rounded-xl text-sm transition flex items-center justify-center space-x-2"
                  >
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3 bg-neutral-100 border border-neutral-200 rounded-xl flex items-center space-x-2 text-xs text-neutral-700">
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>A 4-digit verification code has been sent to <strong>{phone}</strong></span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      4-Digit OTP Code
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="1234"
                      className="w-full tracking-widest text-center text-xl font-bold py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
                    />
                    <span className="text-[11px] text-neutral-500 mt-1.5 block">
                      Enter the 4-digit verification code sent to your mobile device.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-black hover:bg-neutral-800 text-white font-semibold rounded-xl text-sm transition flex items-center justify-center space-x-2"
                  >
                    <span>Verify & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="w-full text-xs text-neutral-500 hover:text-black py-1"
                  >
                    Change Phone Number
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Mode switch */}
          <div className="mt-6 pt-4 border-t border-neutral-100 text-center text-xs text-neutral-600">
            {authMode === 'login' ? (
              <span>
                Don't have an Uber account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setError('');
                  }}
                  className="font-bold text-black hover:underline ml-1"
                >
                  Sign up
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setError('');
                  }}
                  className="font-bold text-black hover:underline ml-1"
                >
                  Log in
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
