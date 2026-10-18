import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Car, ArrowRight, ArrowLeft, LogOut } from 'lucide-react';

export const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { currentUser, currentRole, isAuthenticated, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-3xl font-black text-black tracking-tight font-sans">Uber</div>
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-black rounded-full animate-spin" />
          <p className="text-xs text-neutral-500 font-medium">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !currentUser) {
    if (allowedRoles.includes('admin')) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Unauthorized role
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
    // 1. Non-admin attempting to access Admin Portal
    if (allowedRoles.includes('admin')) {
      return (
        <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 bg-neutral-950">
          <div className="w-full max-w-md bg-neutral-900 rounded-3xl p-8 border border-red-500/30 shadow-2xl text-center space-y-5 animate-in fade-in">
            <div className="w-16 h-16 rounded-3xl bg-red-500/10 text-red-500 mx-auto flex items-center justify-center border border-red-500/30">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30">
                403 Access Forbidden
              </span>
              <h2 className="text-xl font-black text-white mt-3">
                Administrative Clearance Required
              </h2>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Your account (<strong>{currentUser?.fullName || currentUser?.email}</strong>) is signed in with <strong>{currentRole?.toUpperCase()}</strong> authorization. Access to the Fleet Command Center is restricted to authorized platform administrators.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                to={currentRole === 'driver' ? '/driver' : '/customer'}
                className="w-full py-3 bg-white hover:bg-neutral-200 text-black font-black text-xs rounded-xl shadow transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to {currentRole === 'driver' ? 'Driver Partner Portal' : 'Rider App'}</span>
              </Link>

              <button
                onClick={logout}
                className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out & Switch Account</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 2. Customer attempting to access Driver view without driver registration
    if (allowedRoles.includes('driver')) {
      return (
        <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-neutral-200 shadow-uber-lg text-center space-y-5 animate-in fade-in">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center shadow-sm">
              <Car className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-black text-neutral-900 tracking-tight">
                Become an Uber Driver Partner
              </h2>
              <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                You are currently signed in with Rider profile <strong>{currentUser?.fullName}</strong>. To access driver dispatch, earnings, and trip requests, complete our driver registration and KYC onboarding.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                to="/driver/onboarding"
                className="w-full py-3 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Start Driver KYC Onboarding</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/customer"
                className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Rider App</span>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // Default redirect to their own portal
    return <Navigate to={`/${currentRole}`} replace />;
  }

  return children;
};
