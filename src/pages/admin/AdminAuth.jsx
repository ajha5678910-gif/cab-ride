import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Lock, Mail, Key, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';

export const AdminAuth = () => {
  const { loginWithEmail } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityKey, setSecurityKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please provide valid admin credentials.');
      return;
    }

    if (securityKey.trim() !== 'UBER-SEC-8899' && password !== 'admin123') {
      setError('Master security key or administrative credentials rejected.');
      return;
    }

    setLoading(true);
    try {
      await loginWithEmail(email, password, 'admin');
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Authentication failed. Unauthorized system access attempt logged.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-neutral-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in duration-300">
        {/* Security Badge Header */}
        <div className="p-8 border-b border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black tracking-tight text-white">Uber</span>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 flex items-center space-x-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Restricted Access</span>
            </span>
          </div>

          <h2 className="text-xl font-bold mt-5 text-white flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Master Command Center</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Enterprise Fleet Operations & Platform Governance Console.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3.5 rounded-2xl flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
              Admin Identity / Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@uber.com"
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
              Administrative Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
              Master Security Token Key
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={securityKey}
                onChange={(e) => setSecurityKey(e.target.value)}
                placeholder="UBER-SEC-XXXX"
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white hover:bg-neutral-200 text-black font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg flex items-center justify-center space-x-2 mt-2 cursor-pointer"
          >
            {loading ? (
              <span>Verifying Credentials...</span>
            ) : (
              <>
                <span>Authenticate & Access Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="pt-4 border-t border-neutral-800 text-center">
            <p className="text-[10px] text-neutral-500 leading-relaxed">
              Protected by 256-Bit TLS Encryption & Fleet Telemetry Audit Guards. Unauthorized access attempts are monitored and recorded.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
