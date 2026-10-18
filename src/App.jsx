import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { dbService } from './services/db';

// Auth Pages & Guards
import { AuthPortal } from './pages/auth/AuthPortal';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Customer Pages
import { CustomerProfile } from './pages/customer/CustomerProfile';
import { CustomerDashboard } from './pages/customer/CustomerDashboard';

// Driver Pages
import { DriverKYCWizard } from './pages/driver/DriverKYCWizard';
import { DriverVerificationScreen } from './pages/driver/DriverVerificationScreen';

// Admin Pages
import { AdminAuth } from './pages/admin/AdminAuth';
import { AdminDashboard } from './pages/admin/AdminDashboard';

// Modals & Mobile Components
import { FamilyTrackingModal } from './components/safety/FamilyTrackingModal';
import { MobileInstallBanner } from './components/mobile/MobileInstallBanner';

export const App = () => {
  const { currentUser, currentRole, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Modals & Sub-states
  const [showCustomerProfileModal, setShowCustomerProfileModal] = useState(false);
  const [trackingRide, setTrackingRide] = useState(null);

  // Check for public family tracking URL param (?track=UBER-LIVE-XXXX)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const trackToken = params.get('track');
      if (trackToken) {
        const found = dbService.getRideByShareToken?.(trackToken);
        if (found) {
          setTrackingRide(found);
        }
      }
    }
  }, [location.search]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-3xl font-black text-black tracking-tight font-sans">Uber</div>
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-black rounded-full animate-spin" />
          <p className="text-xs text-neutral-500 font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans selection:bg-black selection:text-white">
      {/* 1. Production Main Brand Navbar */}
      <Navbar onOpenProfile={() => setShowCustomerProfileModal(true)} />

      {/* 2. Main Declarative URL Routing */}
      <main className="flex-1 pb-16">
        <Routes>
          {/* Index Route Redirect */}
          <Route
            path="/"
            element={
              isAuthenticated && currentRole ? (
                <Navigate to={`/${currentRole}`} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Unified Auth Portal Routes */}
          <Route path="/login" element={<AuthPortal initialMode="login" />} />
          <Route path="/signup" element={<AuthPortal initialMode="signup" />} />

          {/* Customer Portal (Protected: role === 'customer') */}
          <Route
            path="/customer/*"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <>
                  <CustomerDashboard onOpenProfile={() => setShowCustomerProfileModal(true)} />
                  {showCustomerProfileModal && (
                    <CustomerProfile onClose={() => setShowCustomerProfileModal(false)} />
                  )}
                </>
              </ProtectedRoute>
            }
          />

          {/* Driver Onboarding Route (Accessible to Driver & Customer becoming driver) */}
          <Route
            path="/driver/onboarding"
            element={
              <ProtectedRoute allowedRoles={['driver', 'customer']}>
                <DriverKYCWizard
                  onComplete={() => navigate('/driver')}
                  onCancel={() => navigate(currentRole === 'driver' ? '/driver' : '/customer')}
                />
              </ProtectedRoute>
            }
          />

          {/* Driver Portal (Protected: role === 'driver') */}
          <Route
            path="/driver/*"
            element={
              <ProtectedRoute allowedRoles={['driver']}>
                <DriverVerificationScreen onEditKYC={() => navigate('/driver/onboarding')} />
              </ProtectedRoute>
            }
          />

          {/* Admin Authentication */}
          <Route
            path="/admin/login"
            element={
              isAuthenticated && currentRole === 'admin' ? (
                <Navigate to="/admin" replace />
              ) : (
                <AdminAuth />
              )
            }
          />

          {/* Admin Operations Portal (Protected: role === 'admin') */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* PUBLIC FAMILY / FRIEND LIVE TRIP TRACKER */}
      {trackingRide && (
        <FamilyTrackingModal
          ride={trackingRide}
          onClose={() => {
            setTrackingRide(null);
            if (typeof window !== 'undefined') {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          }}
        />
      )}

      {/* Production Footer */}
      <footer className="bg-black text-white border-t border-neutral-800 py-6 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm tracking-tight">Uber</span>
            <span className="text-neutral-500">•</span>
            <span className="text-neutral-400">Enterprise Mobility Cloud Platform</span>
          </div>

          <div className="flex items-center space-x-4 text-neutral-400">
            <span>Production Deployment Ready</span>
            <span className="text-emerald-400 font-semibold flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>TLS 256-Bit Encrypted</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Mobile App Install Banner */}
      <MobileInstallBanner />
    </div>
  );
};
