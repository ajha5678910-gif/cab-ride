import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CustomerAuth } from '../customer/CustomerAuth';
import { DriverAuth } from '../driver/DriverAuth';
import { Users, Car, Shield, ArrowRight } from 'lucide-react';

export const AuthPortal = ({ initialMode = 'login' }) => {
  const { isAuthenticated, currentRole, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Tab: 'customer' | 'driver'
  const [selectedRole, setSelectedRole] = useState('customer');

  // If already logged in, redirect to authorized portal
  if (!loading && isAuthenticated && currentRole) {
    return <Navigate to={`/${currentRole}`} replace />;
  }

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center py-8 px-4 sm:px-6">
      {/* Role Selection Tabs */}
      <div className="w-full max-w-md mb-4">
        <div className="bg-neutral-200/80 p-1.5 rounded-2xl flex items-center space-x-1.5 shadow-inner">
          <button
            type="button"
            onClick={() => setSelectedRole('customer')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition cursor-pointer ${
              selectedRole === 'customer'
                ? 'bg-black text-white shadow-md'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Rider Account</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole('driver')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition cursor-pointer ${
              selectedRole === 'driver'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Driver Partner</span>
          </button>
        </div>
      </div>

      {/* Auth Form Container */}
      <div className="w-full max-w-md animate-in fade-in duration-300">
        {selectedRole === 'customer' ? (
          <CustomerAuth initialMode={initialMode} key={`cust-${initialMode}`} />
        ) : (
          <DriverAuth
            onStartOnboarding={() => navigate('/driver/onboarding')}
            initialMode={initialMode}
            key={`drv-${initialMode}`}
          />
        )}
      </div>

      {/* Discreet Link to Restricted Admin Portal */}
      <div className="mt-6 text-center text-xs text-neutral-400">
        <Link
          to="/admin/login"
          className="hover:text-neutral-600 transition inline-flex items-center space-x-1 font-medium"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Fleet Administration Portal</span>
        </Link>
      </div>
    </div>
  );
};
