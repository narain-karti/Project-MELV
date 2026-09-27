import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { TrackingProvider, useTracking } from './context/TrackingContext';
import SystemTicker from './components/common/SystemTicker';
import HomePage from './pages/HomePage';
import LiveTrackingPage from './pages/LiveTrackingPage';
import LiveInspectorPage from './pages/LiveInspectorPage';
import TrajectoryQueryPage from './pages/TrajectoryQueryPage';
import TrafficAnalyticsPage from './pages/TrafficAnalyticsPage';
import AlertsManagementPage from './pages/AlertsManagementPage';
import EdgeNetworkPage from './pages/EdgeNetworkPage';
import TacticalVisionLabPage from './pages/TacticalVisionLabPage';
import ArchitecturePage from './pages/ArchitecturePage';
import { ArrowLeft, Menu, X } from 'lucide-react';

const ROUTE_MAP = {
  home: '/',
  tactical_vision: '/vision-lab',
  live_tracking: '/trajectory',
  ai_inspector: '/sandbox',
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
  { id: 'tactical_vision', label: '[00] Vision Lab', path: '/vision-lab' },
  { id: 'live_tracking', label: '[01] Trajectory', path: '/trajectory' },
  { id: 'ai_inspector', label: '[02] Sandbox', path: '/sandbox' },
  { id: 'trajectory_query', label: '[03] Query', path: '/query' },
  { id: 'traffic_analytics', label: '[04] Analytics', path: '/analytics' },
  { id: 'alerts', label: '[05] Alerts', path: '/alerts' },
  { id: 'network_status', label: '[06] Edge Network', path: '/edge-network' },
  { id: 'architecture', label: '[07] Architecture', path: '/architecture' },
];

// Syncs route with TrackingContext so old setActiveTab calls still work
function RouteSync() {
  const { activeTab, setActiveTab } = useTracking();
  const navigate = useNavigate();
  const location = useLocation();

  // When URL changes, sync to context
  useEffect(() => {
    const tab = TAB_FROM_PATH[location.pathname];
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [location.pathname, setActiveTab]);

  // When context tab changes (via old setActiveTab calls), sync to URL
  useEffect(() => {
    const expectedPath = ROUTE_MAP[activeTab];
    if (expectedPath && expectedPath !== location.pathname) {
      navigate(expectedPath, { replace: true });
    }
  }, [activeTab, navigate, location.pathname]);

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
  const { activeTab, backendOnline } = useTracking();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="flex justify-between items-center w-full px-6 py-4 border-b border-brand-dark-gray/30 bg-brand-black z-20 select-none relative">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-brand-acid hover:text-brand-paper transition-colors font-mono">
          <ArrowLeft className="w-3 h-3" /> Home
        </Link>
        <div className="text-[11px] font-bold tracking-widest uppercase font-mono text-brand-paper border-l border-brand-dark-gray/50 pl-6">
          Project-MELV
        </div>
      </div>

      {/* Desktop Nav */}
      <nav className="hidden lg:flex gap-5 text-[10px] uppercase font-bold tracking-widest text-brand-gray font-mono">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={`hover:text-brand-paper transition-colors ${
              location.pathname === item.path ? 'text-brand-acid bg-brand-dark-gray px-2 py-1' : ''
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Mobile Menu Toggle */}
      <button
        className="lg:hidden p-1 text-brand-gray hover:text-brand-paper"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <div className="hidden sm:flex items-center gap-2 text-[9px] font-mono font-bold px-2.5 py-1 border border-brand-dark-gray text-brand-gray rounded-sm">
        <span className={`w-1.5 h-1.5 rounded-full ${backendOnline ? 'bg-brand-acid animate-pulse' : 'bg-red-500'}`}></span>
        <span>ENGINE :8000 [{backendOnline ? 'ACTIVE' : 'OFFLINE'}]</span>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-brand-black border-b border-brand-dark-gray/30 p-4 z-50 lg:hidden">
          <nav className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-[11px] uppercase font-bold tracking-widest font-mono py-2 px-3 transition-all ${
                  location.pathname === item.path
                    ? 'text-brand-acid bg-brand-dark-gray'
                    : 'text-brand-gray hover:text-brand-paper hover:bg-brand-dark-gray/50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

function InternalLayout() {
  return (
    <div className="flex flex-col h-screen w-screen bg-brand-black text-brand-paper overflow-hidden select-none font-sans">
      <InternalTopNav />
      <SystemTicker />
      <main className="flex-1 p-4 overflow-y-auto bg-brand-black">
        <Routes>
          <Route path="/vision-lab" element={<TacticalVisionLabPage />} />
          <Route path="/trajectory" element={<LiveTrackingPage />} />
          <Route path="/sandbox" element={<LiveInspectorPage />} />
          <Route path="/query" element={<TrajectoryQueryPage />} />
          <Route path="/analytics" element={<TrafficAnalyticsPage />} />
          <Route path="/alerts" element={<AlertsManagementPage />} />
          <Route path="/edge-network" element={<EdgeNetworkPage />} />
          <Route path="/architecture" element={<ArchitecturePage />} />
          <Route path="*" element={<Navigate to="/vision-lab" replace />} />
        </Routes>
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
        <Route path="/*" element={<InternalLayout />} />
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
