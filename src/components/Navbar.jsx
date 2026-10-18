import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, 
  CheckCircle2, 
  Clock, 
  XCircle,
  ShieldCheck
} from 'lucide-react';

export const Navbar = ({ onOpenProfile }) => {
  const { currentUser, currentRole, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getHomeLink = () => {
    if (!isAuthenticated) return '/login';
    if (currentRole === 'driver') return '/driver';
    if (currentRole === 'admin') return '/admin';
    return '/customer';
  };

  return (
    <nav className="bg-black text-white border-b border-neutral-800 shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Authentic Badge */}
        <div className="flex items-center space-x-3">
          <Link to={getHomeLink()} className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-400 flex items-center justify-center text-white font-black text-sm shadow-md">
              O
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-black tracking-tight font-sans text-white hover:opacity-90 transition">
                OmniRide
              </span>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider bg-emerald-950/60 border border-emerald-800/80 px-1.5 py-0.2 rounded-md">
                Connect
              </span>
            </div>
          </Link>
          {isAuthenticated && (
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-neutral-900 text-neutral-300 border border-neutral-800">
              {currentRole === 'customer'
                ? 'Rider'
                : currentRole === 'driver'
                ? 'Driver Partner'
                : 'Fleet Admin'}
            </span>
          )}
        </div>

        {/* Right User Info & Actions */}
        <div className="flex items-center space-x-3">
          {isAuthenticated && currentUser ? (
            <div className="flex items-center space-x-3">
              {/* Driver KYC indicator */}
              {currentRole === 'driver' && (
                <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold border">
                  {currentUser.verificationStatus === 'approved' && (
                    <span className="flex items-center text-emerald-400 border-emerald-900 bg-emerald-950/40 px-2 py-0.5 rounded-full text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verified Partner
                    </span>
                  )}
                  {currentUser.verificationStatus === 'pending' && (
                    <span className="flex items-center text-amber-400 border-amber-900 bg-amber-950/40 px-2 py-0.5 rounded-full text-[11px]">
                      <Clock className="w-3.5 h-3.5 mr-1" /> Pending Approval
                    </span>
                  )}
                  {currentUser.verificationStatus === 'rejected' && (
                    <span className="flex items-center text-red-400 border-red-900 bg-red-950/40 px-2 py-0.5 rounded-full text-[11px]">
                      <XCircle className="w-3.5 h-3.5 mr-1" /> KYC Rejected
                    </span>
                  )}
                </div>
              )}

              {/* Customer Profile button */}
              {currentRole === 'customer' && (
                <button
                  onClick={onOpenProfile}
                  className="flex items-center space-x-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 px-3 py-1.5 rounded-full text-sm font-medium transition cursor-pointer"
                  title="Edit Customer Profile & Emergency Contacts"
                >
                  <img
                    src={currentUser.profilePicUrl}
                    alt={currentUser.fullName}
                    className="w-6 h-6 rounded-full object-cover border border-neutral-600"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                  <span className="hidden sm:inline font-bold">{currentUser.fullName}</span>
                </button>
              )}

              {/* Driver Profile Tag */}
              {currentRole === 'driver' && (
                <div className="flex items-center space-x-2 bg-neutral-900 border border-neutral-700 px-3 py-1.5 rounded-full text-sm font-medium">
                  <img
                    src={currentUser.profilePicUrl}
                    alt={currentUser.fullName}
                    className="w-6 h-6 rounded-full object-cover border border-neutral-600"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                  <span className="hidden sm:inline font-bold">{currentUser.fullName}</span>
                </div>
              )}

              {/* Admin Profile Tag */}
              {currentRole === 'admin' && (
                <div className="flex items-center space-x-2 bg-neutral-900 border border-neutral-700 px-3 py-1.5 rounded-full text-sm font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline font-bold">{currentUser.name || 'System Admin'}</span>
                </div>
              )}

              {/* Secure Sign Out button */}
              <button
                onClick={handleLogout}
                className="text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-neutral-800 transition flex items-center space-x-1 cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-xs hidden md:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="text-xs font-bold text-neutral-300 hover:text-white px-3 py-1.5 rounded-lg transition"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="text-xs font-bold bg-white text-black hover:bg-neutral-200 px-3.5 py-1.5 rounded-full transition shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
