import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Link, Navigate, Outlet } from 'react-router-dom';
import { TrackingProvider, useTracking } from './context/TrackingContext';
import SystemTicker from './components/common/SystemTicker';
import HomePage from './pages/HomePage';
import UnifiedTrajectoryVisionPage from './pages/UnifiedTrajectoryVisionPage';
import LiveInspectorPage from './pages/LiveInspectorPage';
import TrajectoryQueryPage from './pages/TrajectoryQueryPage';
import TrafficAnalyticsPage from './pages/TrafficAnalyticsPage';
import AlertsManagementPage from './pages/AlertsManagementPage';
import EdgeNetworkPage from './pages/EdgeNetworkPage';
import ArchitecturePage from './pages/ArchitecturePage';
import { ArrowLeft, Menu, X } from 'lucide-react';

const ROUTE_MAP = {
  home: '/',
  ai_inspector: '/sandbox',
  live_tracking: '/trajectory',
  tactical_vision: '/trajectory',
  trajectory_query: '/query',
  traffic_analytics: '/analytics',
  alerts: '/alerts',
  network_status: '/edge-network',
  architecture: '/architecture',
};

const TAB_FROM_PATH = Object.fromEntries(
  Object.entries(ROUTE_MAP).map(([tab, path]) => [path, tab])
);

const NAV_ITEMS = [
  { id: 'ai_inspector', label: '[01] Benchmark Arena', path: '/sandbox' },
  { id: 'live_tracking', label: '[02] Live Trajectory & Vision', path: '/trajectory' },
  { id: 'trajectory_query', label: '[03] Query', path: '/query' },
  { id: 'traffic_analytics', label: '[04] Analytics', path: '/analytics' },
  { id: 'alerts', label: '[05] Alerts', path: '/alerts' },
  { id: 'network_status', label: '[06] Edge Network', path: '/edge-network' },
  { id: 'architecture', label: '[07] Architecture', path: '/architecture' },
];

// Syncs route with TrackingContext when route changes
function RouteSync() {
  const { setActiveTab } = useTracking();
  const location = useLocation();

  // When URL changes, sync active tab to context safely without triggering navigation loops
  useEffect(() => {
    const tab = TAB_FROM_PATH[location.pathname];
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.pathname, setActiveTab]);

  return null;
}


// Modal component for dispatch/action confirmations
function ActionModal({ isOpen, onClose, title, message, severity = 'info' }) {
  if (!isOpen) return null;

  const severityStyles = {
    critical: 'border-red-500 bg-red-500/10',
    warning: 'border-amber-400 bg-amber-400/10',
    success: 'border-brand-acid bg-brand-acid/10',
    info: 'border-brand-purple bg-brand-purple/10',
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`relative max-w-lg w-[90%] border-2 ${severityStyles[severity] || severityStyles.info} p-6 chamfer-card shadow-editorial bg-brand-black`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-brand-gray hover:text-brand-paper transition-colors">
          <X className="w-4 h-4" />
        </button>
        <div className="text-[10px] font-bold uppercase tracking-widest text-brand-acid mb-2 font-mono">
          System Notification
        </div>
        <h3 className="text-lg font-bold text-brand-paper uppercase tracking-wider mb-3 font-mono">
          {title}
        </h3>
        <p className="text-sm text-brand-gray font-mono leading-relaxed mb-6">
          {message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-brand-acid text-brand-black font-bold text-[10px] uppercase tracking-widest border border-brand-black shadow-editorial hover:bg-brand-paper transition-all"
          >
            Acknowledged
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-brand-dark-gray text-brand-gray text-[10px] uppercase tracking-widest font-bold hover:text-brand-paper hover:border-brand-paper transition-all"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

// Export modal for use in other components
export { ActionModal };

function InternalTopNav() {
  const { backendOnline, userRole = 'TACTICAL_DISPATCH', setUserRole } = useTracking();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="px-3 py-1.5 md:px-4 md:py-2 bg-[#121214]/95 border-b border-white/10 backdrop-blur-md z-30 select-none relative flex justify-between items-center flex-nowrap gap-3 transition-all w-full flex-shrink-0">
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <Link
          to="/"
          className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 hover:bg-brand-acid hover:text-black text-brand-paper text-[10px] md:text-[11px] font-bold font-mono uppercase tracking-wider rounded border border-white/15 transition-all flex-shrink-0 whitespace-nowrap"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <div className="flex items-center gap-2 border-l border-white/15 pl-2.5 flex-shrink-0 whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-brand-acid animate-pulse"></span>
          <span className="text-xs font-black tracking-widest uppercase font-mono text-brand-paper">
            Project-MELV
          </span>
          <span className="hidden sm:inline-block bg-brand-acid/15 text-brand-acid border border-brand-acid/30 text-[9px] font-bold px-1.5 py-0.2 rounded font-mono">
            SIH 26127
          </span>
        </div>
      </div>

      {/* Desktop Nav in clean streamlined dark tabs */}
      <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 flex-nowrap flex-shrink-0">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`px-2.5 py-1 text-[10px] xl:text-[11px] font-bold font-mono tracking-tight uppercase rounded border transition-all whitespace-nowrap flex-shrink-0 ${
                isActive
                  ? 'bg-brand-acid text-black border-brand-acid font-black shadow-[0_0_12px_rgba(200,232,77,0.3)]'
                  : 'bg-white/5 text-brand-gray border-white/10 hover:bg-white/10 hover:text-brand-paper'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Right Action Badges */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Role Clearance Level Badge & Switcher */}
        <button
          onClick={() => {
            if (setUserRole) {
              const roles = ['TACTICAL_DISPATCH', 'FIELD_OFFICER', 'COMMAND_ADMIN'];
              const nextIdx = (roles.indexOf(userRole) + 1) % roles.length;
              setUserRole(roles[nextIdx]);
            }
          }}
          title="Click to cycle role clearance level"
          className="hidden md:flex items-center gap-1.5 text-[9px] xl:text-[10px] font-mono font-bold px-2 py-1 border border-white/15 bg-white/5 hover:bg-white/10 text-brand-paper rounded cursor-pointer transition-colors whitespace-nowrap"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand-purple"></span>
          <span className="text-brand-gray font-normal">ROLE:</span>
          <span className="text-brand-paper font-bold">{userRole.replace('_', ' ')}</span>
        </button>

        {/* Engine Status Badge */}
        <div className="flex items-center gap-1.5 text-[9px] xl:text-[10px] font-mono font-bold px-2 py-1 border border-brand-acid/30 bg-brand-acid/10 text-brand-acid rounded whitespace-nowrap">
          <span className={`w-1.5 h-1.5 rounded-full ${backendOnline ? 'bg-brand-acid animate-ping' : 'bg-red-500'}`}></span>
          <span>:8000 [{backendOnline ? 'ACTIVE' : 'OFFLINE'}]</span>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden p-1.5 bg-white/10 text-brand-paper rounded border border-white/15 flex-shrink-0"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-[calc(100%+4px)] left-2 right-2 bg-[#18181b] border border-white/15 shadow-2xl rounded-lg p-3 z-50 lg:hidden">
          <nav className="flex flex-col gap-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-2 px-3 text-xs uppercase font-bold tracking-wider font-mono rounded ${
                    isActive
                      ? 'bg-brand-acid text-black font-extrabold'
                      : 'bg-white/5 text-brand-paper hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}

function InternalLayout() {
  return (
    <div className="fixed inset-0 flex flex-col w-full h-full max-h-screen bg-brand-black text-brand-paper overflow-hidden select-none font-sans">
      <InternalTopNav />
      <SystemTicker />
      <main className="flex-1 p-3 md:p-4 overflow-y-auto overflow-x-hidden bg-brand-black w-full max-w-full">
        <Outlet />
      </main>
    </div>
  );
}

function AppContent() {
  return (
    <>
      <RouteSync />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route element={<InternalLayout />}>
          <Route path="/sandbox" element={<LiveInspectorPage />} />
          <Route path="/trajectory" element={<UnifiedTrajectoryVisionPage />} />
          <Route path="/vision-lab" element={<Navigate to="/trajectory" replace />} />
          <Route path="/query" element={<TrajectoryQueryPage />} />
          <Route path="/analytics" element={<TrafficAnalyticsPage />} />
          <Route path="/alerts" element={<AlertsManagementPage />} />
          <Route path="/edge-network" element={<EdgeNetworkPage />} />
          <Route path="/architecture" element={<ArchitecturePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/sandbox" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <TrackingProvider>
        <AppContent />
      </TrackingProvider>
    </BrowserRouter>
  );
}
