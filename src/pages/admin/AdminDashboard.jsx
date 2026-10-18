import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db';
import { KYCInspectionModal } from './KYCInspectionModal';
import { SafetyCommandCenter } from './SafetyCommandCenter';
import { FinancialsLedger } from './FinancialsLedger';
import { GodsEyeMap } from './GodsEyeMap';
import { DynamicPricingSurgeController } from './DynamicPricingSurgeController';
import { PromoCodesManager } from './PromoCodesManager';
import { BusinessIntelligenceDashboard } from './BusinessIntelligenceDashboard';
import { UserGovernanceModal } from './UserGovernanceModal';
import { MapView } from '../../components/map/MapView';
import { createVehicleIcon } from '../../components/map/MapMarkers';
import { 
  Users, 
  Car, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  ShieldCheck, 
  ShieldAlert,
  Eye, 
  Phone, 
  Mail, 
  Wallet, 
  Radio, 
  Sparkles, 
  Map, 
  RotateCcw, 
  Layers, 
  Compass,
  DollarSign,
  Sliders,
  Tag,
  BarChart3,
  Crown,
  Zap,
  Activity,
  LogOut
} from 'lucide-react';

export const AdminDashboard = () => {
  const { logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [rides, setRides] = useState([]);
  const [safetyIncidents, setSafetyIncidents] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);

  // Main Section Tabs: 'kyc' | 'fleet-radar' | 'rides' | 'directory' | 'safety'
  const [activeAdminTab, setActiveAdminTab] = useState('safety');

  // Filter tabs for KYC center
  const [kycTab, setKycTab] = useState('pending'); // 'pending' | 'approved' | 'rejected' | 'all'

  // Directory search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [directoryRoleFilter, setDirectoryRoleFilter] = useState('all'); // 'all' | 'customer' | 'driver'
  const [rideModeFilter, setRideModeFilter] = useState('all'); // 'all' | 'daily' | 'reserve' | 'rentals' | 'intercity' | 'courier'

  const loadData = () => {
    setUsers(dbService.getUsers());
    setDrivers(dbService.getDrivers());
    setRides(dbService.getRides());
    setSafetyIncidents(dbService.getSafetyIncidents());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = dbService.subscribe(() => {
      loadData();
    });
    return unsubscribe;
  }, []);

  // Actions
  const handleApprove = (uid) => {
    dbService.approveDriver(uid);
    loadData();
    setSelectedDriver(null);
  };

  const handleReject = (uid, reason) => {
    dbService.rejectDriver(uid, reason);
    loadData();
    setSelectedDriver(null);
  };

  // KPIs
  const totalCustomers = users.length;
  const totalDrivers = drivers.length;
  const pendingKYC = drivers.filter((d) => d.verificationStatus === 'pending').length;
  const onlineDrivers = drivers.filter((d) => d.isOnline && d.currentLocation);
  const activeOnline = onlineDrivers.length;
  const criticalIncidentsCount = safetyIncidents.filter((i) => i.status === 'active_critical').length;

  // Filtered drivers for KYC center
  const filteredDriversForKYC = drivers.filter((d) => {
    if (kycTab === 'all') return true;
    return d.verificationStatus === kycTab;
  });

  // Directory combined list
  const combinedDirectory = [
    ...users.map((u) => ({ ...u, type: 'Customer' })),
    ...drivers.map((d) => ({ ...d, type: 'Driver' })),
  ].filter((item) => {
    if (directoryRoleFilter !== 'all') {
      if (directoryRoleFilter === 'customer' && item.type !== 'Customer') return false;
      if (directoryRoleFilter === 'driver' && item.type !== 'Driver') return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.fullName?.toLowerCase().includes(q) ||
      item.email?.toLowerCase().includes(q) ||
      item.phone?.toLowerCase().includes(q)
    );
  });

  // Fleet Radar Markers
  const fleetMarkers = onlineDrivers.map((driver) => ({
    id: `admin-radar-${driver.uid}`,
    position: [driver.currentLocation.lat, driver.currentLocation.lng],
    icon: createVehicleIcon(
      driver.vehicleDetails?.category || 'Uber Go',
      driver.currentLocation.heading || 0,
      true
    ),
    popupContent: (
      <div className="space-y-1.5 p-0.5">
        <div className="flex items-center justify-between gap-3">
          <strong className="text-neutral-900">{driver.fullName}</strong>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
            Online
          </span>
        </div>
        <div className="text-[11px] text-neutral-600 font-medium">
          {driver.vehicleDetails?.category} • {driver.vehicleDetails?.makeModel}
        </div>
        <div className="font-mono text-[10px] text-neutral-800 font-bold bg-neutral-100 p-1 rounded">
          Plate: {driver.vehicleDetails?.plateNumber}
        </div>
        <div className="text-[10px] text-neutral-500 font-mono">
          Coords: {driver.currentLocation.lat.toFixed(4)}, {driver.currentLocation.lng.toFixed(4)}
        </div>
      </div>
    ),
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Admin Header */}
      <div className="bg-black text-white rounded-3xl p-6 sm:p-8 shadow-uber-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-uber-blue text-white">
                Fleet Administration Panel
              </span>
              <span className="text-xs text-neutral-400">Live GIS & Fleet Operations Radar</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 font-sans">
              Driver KYC Verification & City Fleet Radar
            </h1>
            <p className="text-sm text-neutral-300 mt-1 max-w-2xl">
              Inspect submitted driver compliance documents and monitor active vehicles moving across the city in real time.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-2xl flex items-center space-x-3 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <div className="font-bold text-white">Live Telemetry Synchronized</div>
                <div className="text-neutral-400 text-[11px]">{activeOnline} Cars Patrolling City</div>
              </div>
            </div>

            <button
              onClick={logout}
              className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 px-4 py-3 rounded-2xl text-xs font-bold text-neutral-200 hover:text-white transition flex items-center space-x-2 cursor-pointer shadow-sm"
              title="Sign Out of Admin Portal"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* High-Priority SOS Alarm Banner */}
      {criticalIncidentsCount > 0 && (
        <div 
          onClick={() => setActiveAdminTab('safety')}
          className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-3xl shadow-xl flex items-center justify-between cursor-pointer transition animate-pulse border-2 border-white"
        >
          <div className="flex items-center space-x-3">
            <ShieldAlert className="w-6 h-6 text-white animate-bounce" />
            <div>
              <div className="font-black text-sm">
                CRITICAL SOS EMERGENCY SIGNAL ACTIVE ({criticalIncidentsCount})
              </div>
              <div className="text-xs text-red-100">
                A distressed passenger or driver has pressed the SOS emergency button. Click to open Command Console ↗
              </div>
            </div>
          </div>
          <span className="bg-white text-red-600 font-extrabold text-xs px-3 py-1.5 rounded-xl shadow">
            Inspect SOS Incident ↗
          </span>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Customers */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-uber-subtle flex items-center justify-between">
          <div>
            <div className="text-neutral-500 text-xs font-semibold uppercase tracking-wider">
              Total Customers
            </div>
            <div className="text-3xl font-black text-neutral-900 mt-1">{totalCustomers}</div>
            <div className="text-[11px] text-neutral-500 mt-0.5">Registered riders</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-800">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Total Drivers */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-uber-subtle flex items-center justify-between">
          <div>
            <div className="text-neutral-500 text-xs font-semibold uppercase tracking-wider">
              Total Drivers
            </div>
            <div className="text-3xl font-black text-neutral-900 mt-1">{totalDrivers}</div>
            <div className="text-[11px] text-neutral-500 mt-0.5">Registered partners</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-800">
            <Car className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Pending KYC Approvals */}
        <div 
          onClick={() => setActiveAdminTab('kyc')}
          className={`rounded-2xl p-5 border shadow-uber-subtle flex items-center justify-between cursor-pointer transition ${
            pendingKYC > 0 ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20 hover:bg-amber-100/60' : 'bg-white border-neutral-200'
          }`}
        >
          <div>
            <div className="text-neutral-600 text-xs font-bold uppercase tracking-wider flex items-center space-x-1">
              <span>Pending KYC Review</span>
              {pendingKYC > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </div>
            <div className="text-3xl font-black text-amber-700 mt-1">{pendingKYC}</div>
            <div className="text-[11px] text-amber-800 font-medium mt-0.5">
              Requires admin approval
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-200/60 flex items-center justify-center text-amber-800">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: Active Online Drivers */}
        <div 
          onClick={() => setActiveAdminTab('fleet-radar')}
          className="bg-white hover:bg-neutral-50 rounded-2xl p-5 border border-neutral-200 shadow-uber-subtle flex items-center justify-between cursor-pointer transition"
          title="Click to view Live Fleet Radar map"
        >
          <div>
            <div className="text-neutral-500 text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5">
              <span>Active Online Fleet</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-3xl font-black text-emerald-600 mt-1">{activeOnline}</div>
            <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
              Click to view live radar map ↗
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Radio className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Feature Navigation Tabs - Grouped Command Center */}
      <div className="space-y-2">
        {/* Tier 1: Master Operations & Fleet Command */}
        <div className="bg-neutral-900 text-white p-1.5 rounded-2xl text-xs font-bold flex flex-wrap gap-1 shadow-lg">
          <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-amber-400 font-black flex items-center space-x-1.5 border-r border-neutral-700 mr-1">
            <Crown className="w-3.5 h-3.5" />
            <span>Master Command</span>
          </div>

          <button
            onClick={() => setActiveAdminTab('fleet-radar')}
            className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center space-x-2 ${
              activeAdminTab === 'fleet-radar'
                ? 'bg-emerald-500 text-neutral-950 shadow-md font-black'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Radio className={`w-4 h-4 ${activeAdminTab === 'fleet-radar' ? 'text-black animate-spin' : 'text-emerald-400 animate-pulse'}`} />
            <span>"God's Eye" Live Radar</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeAdminTab === 'fleet-radar' ? 'bg-black text-white' : 'bg-emerald-500/30 text-emerald-300'}`}>
              {activeOnline} Live
            </span>
          </button>

          <button
            onClick={() => setActiveAdminTab('pricing-surge')}
            className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center space-x-2 ${
              activeAdminTab === 'pricing-surge'
                ? 'bg-amber-400 text-neutral-950 shadow-md font-black'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Zap className={`w-4 h-4 ${activeAdminTab === 'pricing-surge' ? 'text-black' : 'text-amber-400'}`} />
            <span>Dynamic Pricing & Surge</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('promos')}
            className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center space-x-2 ${
              activeAdminTab === 'promos'
                ? 'bg-purple-500 text-white shadow-md font-black'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Tag className={`w-4 h-4 ${activeAdminTab === 'promos' ? 'text-white' : 'text-purple-400'}`} />
            <span>Promo Codes Manager</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('analytics')}
            className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center space-x-2 ${
              activeAdminTab === 'analytics'
                ? 'bg-blue-500 text-white shadow-md font-black'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <BarChart3 className={`w-4 h-4 ${activeAdminTab === 'analytics' ? 'text-white' : 'text-blue-400'}`} />
            <span>BI & Analytics</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('governance')}
            className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center space-x-2 ${
              activeAdminTab === 'governance'
                ? 'bg-rose-500 text-white shadow-md font-black'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Sliders className={`w-4 h-4 ${activeAdminTab === 'governance' ? 'text-white' : 'text-rose-400'}`} />
            <span>User Governance & Ledger</span>
          </button>
        </div>

        {/* Tier 2: Fleet Operations & Safety (Modules 1 to 6) */}
        <div className="flex bg-neutral-200/90 p-1.5 rounded-2xl text-xs font-bold space-x-1 shadow-sm">
          <button
            onClick={() => setActiveAdminTab('safety')}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center space-x-1.5 ${
              activeAdminTab === 'safety'
                ? 'bg-red-600 text-white shadow-sm font-bold'
                : 'text-neutral-600 hover:text-black font-semibold'
            }`}
          >
            <ShieldAlert className={`w-3.5 h-3.5 ${criticalIncidentsCount > 0 ? 'text-white animate-pulse' : 'text-red-600'}`} />
            <span>Safety & SOS</span>
            {criticalIncidentsCount > 0 ? (
              <span className="bg-white text-red-600 px-1.5 py-0.2 rounded-full text-[9px] font-black animate-bounce">
                {criticalIncidentsCount} ACTIVE
              </span>
            ) : (
              <span className="bg-neutral-300 text-neutral-700 px-1.5 py-0.2 rounded-full text-[9px]">
                {safetyIncidents.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveAdminTab('financials')}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center space-x-1.5 ${
              activeAdminTab === 'financials'
                ? 'bg-emerald-600 text-white shadow-sm font-bold'
                : 'text-neutral-600 hover:text-black font-semibold'
            }`}
          >
            <DollarSign className={`w-3.5 h-3.5 ${activeAdminTab === 'financials' ? 'text-white' : 'text-emerald-600'}`} />
            <span>Financials & Revenue</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('kyc')}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center space-x-1.5 ${
              activeAdminTab === 'kyc'
                ? 'bg-white text-black shadow-sm font-bold'
                : 'text-neutral-600 hover:text-black font-semibold'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-uber-blue" />
            <span>Driver KYC</span>
            {pendingKYC > 0 && (
              <span className="bg-amber-400 text-black px-1.5 py-0.2 rounded-full text-[9px]">
                {pendingKYC}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveAdminTab('rides')}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center space-x-1.5 ${
              activeAdminTab === 'rides'
                ? 'bg-white text-black shadow-sm font-bold'
                : 'text-neutral-600 hover:text-black font-semibold'
            }`}
          >
            <Car className="w-3.5 h-3.5 text-uber-blue" />
            <span>Active Rides</span>
            <span className="bg-neutral-300 text-black px-1.5 py-0.2 rounded-full text-[9px]">
              {rides.length}
            </span>
          </button>

          <button
            onClick={() => setActiveAdminTab('directory')}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center space-x-1.5 ${
              activeAdminTab === 'directory'
                ? 'bg-white text-black shadow-sm font-bold'
                : 'text-neutral-600 hover:text-black font-semibold'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-black" />
            <span>Directory</span>
            <span className="bg-neutral-300 text-neutral-800 px-1.5 py-0.2 rounded-full text-[9px]">
              {totalCustomers + totalDrivers}
            </span>
          </button>
        </div>
      </div>

      {/* TAB: FINANCIAL ENGINE & REVENUE LEDGER */}
      {activeAdminTab === 'financials' && (
        <FinancialsLedger onRefresh={loadData} />
      )}

      {/* TAB: SAFETY & SOS COMMAND CENTER */}
      {activeAdminTab === 'safety' && (
        <SafetyCommandCenter
          incidents={safetyIncidents}
          rides={rides}
          onRefresh={loadData}
        />
      )}

      {/* TAB 0: ACTIVE & RECENT RIDES MONITOR */}
      {activeAdminTab === 'rides' && (
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-uber-subtle overflow-hidden space-y-4 animate-in fade-in duration-200">
          <div className="p-6 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-uber-blue text-white">
                  Multi-Mode Fleet Operations
                </span>
                <span className="text-xs text-neutral-400">Daily • Reserve • Rentals • Intercity • Courier</span>
              </div>
              <h2 className="text-lg font-bold text-neutral-900 mt-1 flex items-center space-x-2">
                <Car className="w-5 h-5 text-black" />
                <span>Active & Recent Customer Trips Monitor</span>
              </h2>
            </div>

            {/* Mode Filter Pills */}
            <div className="flex bg-neutral-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
              {[
                { id: 'all', label: 'All Modes' },
                { id: 'daily', label: 'Daily' },
                { id: 'reserve', label: 'Reserve' },
                { id: 'rentals', label: 'Rentals' },
                { id: 'intercity', label: 'Intercity' },
                { id: 'courier', label: 'Courier' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setRideModeFilter(m.id)}
                  className={`px-3 py-1 rounded-lg transition text-xs whitespace-nowrap ${
                    rideModeFilter === m.id
                      ? 'bg-black text-white shadow-sm font-bold'
                      : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="px-6 py-3">Ride & Mode</th>
                  <th className="px-6 py-3">Customer / Guest</th>
                  <th className="px-6 py-3">Driver Assigned</th>
                  <th className="px-6 py-3">PIN & Security</th>
                  <th className="px-6 py-3">Trip / Package Metadata</th>
                  <th className="px-6 py-3">Upfront Fare</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {rides.filter((r) => rideModeFilter === 'all' || r.bookingMode === rideModeFilter).length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-neutral-400">
                      No rides found matching mode filter "{rideModeFilter}". Book one in the <strong>Customer App</strong>!
                    </td>
                  </tr>
                ) : (
                  rides
                    .filter((r) => rideModeFilter === 'all' || r.bookingMode === rideModeFilter)
                    .map((ride) => (
                    <tr key={ride.rideId} className="hover:bg-neutral-50/70 transition">
                      <td className="px-6 py-3.5">
                        <div className="font-mono font-bold text-neutral-900">{ride.rideId}</div>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          ride.bookingMode === 'reserve'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : ride.bookingMode === 'rentals'
                            ? 'bg-purple-100 text-purple-900 border border-purple-300'
                            : ride.bookingMode === 'intercity'
                            ? 'bg-blue-100 text-blue-900 border border-blue-300'
                            : ride.bookingMode === 'courier'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-neutral-100 text-neutral-800'
                        }`}>
                          {ride.bookingMode?.toUpperCase() || 'DAILY'}
                        </span>
                      </td>

                      <td className="px-6 py-3.5">
                        <div className="font-bold text-neutral-900">
                          {ride.riderInfo?.riderName || ride.customerName}
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          {ride.riderInfo?.riderPhone || ride.customerPhone}
                        </div>
                        {ride.riderInfo && !ride.riderInfo.isForSelf && (
                          <span className="text-[9px] font-bold bg-amber-400 text-black px-1.5 py-0.2 rounded mt-0.5 inline-block">
                            Guest Passenger
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-3.5">
                        {ride.driverName ? (
                          <div>
                            <div className="font-bold text-neutral-900">{ride.driverName}</div>
                            <div className="text-[11px] text-neutral-500 font-mono">
                              {ride.vehicleDetails?.plateNumber}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-amber-600 font-bold animate-pulse flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                            <span>{ride.status === 'scheduled' ? 'Awaiting Scheduled Time' : 'Searching Drivers...'}</span>
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-3.5">
                        <div className="font-bold text-neutral-900">{ride.category}</div>
                        <div className="mt-0.5 space-y-0.5">
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 font-mono font-bold text-[10px] px-1.5 py-0.2 rounded block w-fit">
                            PIN: {ride.verificationPin}
                          </span>
                          {ride.courierDetails?.deliveryConfirmationPin && (
                            <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono font-bold text-[10px] px-1.5 py-0.2 rounded block w-fit">
                              Drop PIN: {ride.courierDetails.deliveryConfirmationPin}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-3.5 max-w-[220px]">
                        {ride.bookingMode === 'reserve' && (
                          <div className="text-[11px] text-amber-700 font-semibold mb-1">
                            📅 Pickup: {new Date(ride.reserveDetails?.scheduledPickupTime || Date.now()).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </div>
                        )}

                        {ride.bookingMode === 'rentals' && (
                          <div className="text-[11px] text-purple-800 font-semibold mb-1">
                            ⏱️ Package: {ride.rentalDetails?.packageHours} Hrs ({ride.rentalDetails?.includedKm} km included)
                          </div>
                        )}

                        {ride.bookingMode === 'intercity' && (
                          <div className="text-[11px] text-blue-800 font-semibold mb-1">
                            🛣️ Outstation: {ride.intercityDetails?.tripType === 'round_trip' ? 'Round-Trip' : 'One-Way'} (+₹{ride.intercityDetails?.driverAllowance} allowance)
                          </div>
                        )}

                        {ride.bookingMode === 'courier' && (
                          <div className="text-[11px] text-emerald-800 font-semibold mb-1">
                            📦 Parcel: {ride.courierDetails?.packageWeightKg}kg ({ride.courierDetails?.packageCategory}) → To: {ride.courierDetails?.receiverName}
                          </div>
                        )}

                        <div className="truncate text-neutral-800 text-[11px]">
                          <span className="font-bold text-emerald-600">From:</span> {ride.pickup.address}
                        </div>
                        <div className="truncate text-neutral-800 text-[11px]">
                          <span className="font-bold text-black">To:</span> {ride.dropoff.address}
                        </div>
                      </td>

                      <td className="px-6 py-3.5 font-bold text-neutral-900">
                        ₹{ride.upfrontFare}
                        <span className="text-[10px] text-neutral-500 font-normal block">
                          {ride.paymentMethod}
                        </span>
                      </td>

                      <td className="px-6 py-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          ride.status === 'in_progress'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ride.status === 'arrived'
                            ? 'bg-amber-100 text-amber-800'
                            : ride.status === 'accepted'
                            ? 'bg-blue-100 text-blue-800'
                            : ride.status === 'scheduled'
                            ? 'bg-purple-100 text-purple-800'
                            : ride.status === 'completed'
                            ? 'bg-neutral-100 text-neutral-700'
                            : ride.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-400 text-black animate-pulse'
                        }`}>
                          {ride.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="px-6 py-3.5 text-right">
                        {!['completed', 'cancelled'].includes(ride.status) && (
                          <button
                            type="button"
                            onClick={() => dbService.cancelRide(ride.rideId, 'Cancelled by Admin', 'admin')}
                            className="text-xs text-red-600 hover:text-red-800 font-semibold hover:underline"
                          >
                            Cancel Ride
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODULE 7: "GOD'S EYE VIEW" LIVE CITY COMMAND RADAR */}
      {activeAdminTab === 'fleet-radar' && (
        <div className="animate-in fade-in duration-200">
          <GodsEyeMap />
        </div>
      )}

      {/* MODULE 7: DYNAMIC FARE & SURGE PRICING CONTROLLER */}
      {activeAdminTab === 'pricing-surge' && (
        <div className="animate-in fade-in duration-200">
          <DynamicPricingSurgeController onRatesUpdated={loadData} />
        </div>
      )}

      {/* MODULE 7: PROMO CODES & DISCOUNT CAMPAIGN MANAGER */}
      {activeAdminTab === 'promos' && (
        <div className="animate-in fade-in duration-200">
          <PromoCodesManager />
        </div>
      )}

      {/* MODULE 7: EXECUTIVE BI & ANALYTICS DASHBOARD */}
      {activeAdminTab === 'analytics' && (
        <div className="animate-in fade-in duration-200">
          <BusinessIntelligenceDashboard />
        </div>
      )}

      {/* MODULE 7: USER, DRIVER & DISPUTE GOVERNANCE */}
      {activeAdminTab === 'governance' && (
        <div className="animate-in fade-in duration-200">
          <UserGovernanceModal />
        </div>
      )}

      {/* TAB 2: DRIVER KYC VERIFICATION CENTER */}
      {activeAdminTab === 'kyc' && (
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-uber-subtle overflow-hidden animate-in fade-in duration-200">
          <div className="p-6 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-black" />
                <span>Driver KYC Verification Center</span>
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Review partner vehicle details and compliance documents for fleet approval.
              </p>
            </div>

            {/* Verification Tabs */}
            <div className="flex bg-neutral-100 p-1 rounded-xl text-xs font-semibold">
              {[
                { id: 'pending', label: 'Pending Review', count: pendingKYC, badgeClass: 'bg-amber-400 text-black' },
                { id: 'approved', label: 'Approved', count: drivers.filter((d) => d.verificationStatus === 'approved').length, badgeClass: 'bg-emerald-500 text-white' },
                { id: 'rejected', label: 'Rejected', count: drivers.filter((d) => d.verificationStatus === 'rejected').length, badgeClass: 'bg-red-500 text-white' },
                { id: 'all', label: 'All Drivers', count: totalDrivers, badgeClass: 'bg-neutral-800 text-white' },
              ].map((tab) => {
                const isActive = kycTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setKycTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
                      isActive ? 'bg-white text-black shadow-sm font-bold' : 'text-neutral-500 hover:text-black'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${tab.badgeClass}`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drivers List */}
          <div className="divide-y divide-neutral-100">
            {filteredDriversForKYC.length === 0 ? (
              <div className="p-12 text-center text-neutral-400 text-xs">
                No drivers found in this verification status tab.
              </div>
            ) : (
              filteredDriversForKYC.map((drv) => {
                const isPending = drv.verificationStatus === 'pending';
                const isApproved = drv.verificationStatus === 'approved';
                const isRejected = drv.verificationStatus === 'rejected';

                return (
                  <div
                    key={drv.uid}
                    className="p-5 hover:bg-neutral-50/80 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start space-x-4">
                      <img
                        src={drv.profilePicUrl}
                        alt={drv.fullName}
                        className="w-12 h-12 rounded-full object-cover border border-neutral-300 shadow-sm"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-neutral-900">{drv.fullName}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              isApproved
                                ? 'bg-emerald-100 text-emerald-800'
                                : isRejected
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800 animate-pulse'
                            }`}
                          >
                            {drv.verificationStatus}
                          </span>
                          {drv.isOnline && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold flex items-center space-x-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                              <span>Online</span>
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 mt-1">
                          <span className="flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {drv.phone}
                          </span>
                          <span>•</span>
                          <span className="flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {drv.email}
                          </span>
                          <span>•</span>
                          <span className="font-medium text-neutral-700">
                            {drv.vehicleDetails?.category} ({drv.vehicleDetails?.makeModel})
                          </span>
                          <span>•</span>
                          <span className="font-mono bg-neutral-100 px-1.5 py-0.2 rounded font-semibold text-neutral-800">
                            {drv.vehicleDetails?.plateNumber}
                          </span>
                        </div>

                        {isRejected && drv.rejectionReason && (
                          <div className="mt-2 text-[11px] text-red-700 bg-red-50 p-2 rounded-lg border border-red-200">
                            <strong>Rejection Note:</strong> "{drv.rejectionReason}"
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-start md:self-center">
                      <button
                        onClick={() => setSelectedDriver(drv)}
                        className="px-3.5 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect KYC (4 Docs)</span>
                      </button>

                      {isPending && (
                        <>
                          <button
                            onClick={() => handleApprove(drv.uid)}
                            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1 shadow-sm"
                            title="Quick Approve"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => setSelectedDriver(drv)}
                            className="px-3 py-2 border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition flex items-center space-x-1"
                            title="Quick Reject"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: UNIFIED DIRECTORY */}
      {activeAdminTab === 'directory' && (
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-uber-subtle overflow-hidden animate-in fade-in duration-200">
          <div className="p-6 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 flex items-center space-x-2">
                <Users className="w-5 h-5 text-black" />
                <span>Unified User & Driver Directory</span>
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Search and oversee all registered customer riders and fleet driver partners.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, phone..."
                  className="pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs w-full sm:w-60 focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="flex bg-neutral-100 p-1 rounded-xl text-xs font-medium">
                {['all', 'customer', 'driver'].map((filterKey) => (
                  <button
                    key={filterKey}
                    onClick={() => setDirectoryRoleFilter(filterKey)}
                    className={`px-2.5 py-1 rounded-lg capitalize ${
                      directoryRoleFilter === filterKey ? 'bg-white text-black shadow-sm font-bold' : 'text-neutral-500 hover:text-black'
                    }`}
                  >
                    {filterKey === 'all' ? 'All Roles' : filterKey + 's'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="px-6 py-3">User / Partner</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Contact</th>
                  <th className="px-6 py-3">Status / Fleet</th>
                  <th className="px-6 py-3">Wallet Balance</th>
                  <th className="px-6 py-3 text-right">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {combinedDirectory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-neutral-400">
                      No matching users or drivers found.
                    </td>
                  </tr>
                ) : (
                  combinedDirectory.map((item) => (
                    <tr key={item.uid} className="hover:bg-neutral-50/60 transition">
                      <td className="px-6 py-3.5 flex items-center space-x-3">
                        <img
                          src={item.profilePicUrl}
                          alt={item.fullName}
                          className="w-8 h-8 rounded-full object-cover border border-neutral-200"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                        <div>
                          <div className="font-bold text-neutral-900">{item.fullName}</div>
                          <div className="text-[11px] text-neutral-500 font-mono">{item.uid}</div>
                        </div>
                      </td>

                      <td className="px-6 py-3.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            item.type === 'Customer'
                              ? 'bg-neutral-900 text-white'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>

                      <td className="px-6 py-3.5">
                        <div className="text-neutral-800 font-medium">{item.phone}</div>
                        <div className="text-[11px] text-neutral-500">{item.email}</div>
                      </td>

                      <td className="px-6 py-3.5">
                        {item.type === 'Driver' ? (
                          <div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.verificationStatus === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : item.verificationStatus === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {item.verificationStatus}
                            </span>
                            <span className="text-[11px] text-neutral-500 block mt-0.5">
                              {item.vehicleDetails?.category}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active Rider
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-3.5 font-bold text-neutral-900">
                        ${(item.walletBalance || 0).toFixed(2)}
                      </td>

                      <td className="px-6 py-3.5 text-right text-neutral-500">
                        {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KYC Inspection Modal */}
      {selectedDriver && (
        <KYCInspectionModal
          driver={selectedDriver}
          onClose={() => setSelectedDriver(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
};
