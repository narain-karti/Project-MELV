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
import DualAiVisionDemoPage from './pages/DualAiVisionDemoPage';
import TrafficSimulationPage from './app/simulation/page';
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
  dual_ai_vision: '/dual-ai-vision',
  traffic_ai_sim_3d: '/simulation',
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
  { id: 'dual_ai_vision', label: '[08] Dual-AI Vision', path: '/dual-ai-vision' },
  { id: 'traffic_ai_sim_3d', label: '[09] Traffic AI Sim 3D', path: '/simulation' },
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
    <header className="mx-2 mt-2 mb-1.5 md:mx-3 md:mt-2.5 md:mb-2 px-2 py-1.5 md:px-3 md:py-2 rounded-xl bg-white border-2 border-brand-black shadow-[3px_3px_0px_#141414] z-30 select-none relative flex justify-between items-center flex-nowrap gap-1 md:gap-2 transition-all w-[calc(100%-1rem)] md:w-[calc(100%-1.5rem)] max-w-full overflow-hidden">
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        <Link
          to="/"
          className="punch-btn flex items-center gap-1 px-2 py-1 bg-brand-black text-white hover:bg-brand-acid hover:text-brand-black text-[10px] md:text-[11px] font-bold font-mono uppercase tracking-wider rounded-md flex-shrink-0 whitespace-nowrap"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Home</span>
        </Link>
        <div className="text-[11px] md:text-xs font-black tracking-widest uppercase font-mono text-brand-black border-l-2 border-brand-black/20 pl-2 md:pl-2.5 flex-shrink-0 whitespace-nowrap">
          Project-MELV
        </div>
      </div>

      {/* Desktop Nav with tactile Punch In-Out Buttons in 1 clean line */}
      <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 flex-nowrap min-w-0">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`punch-btn px-1.5 py-1 xl:px-2 xl:py-1 text-[9px] xl:text-[10px] font-bold font-mono tracking-tighter uppercase rounded-md whitespace-nowrap truncate ${
                isActive
                  ? 'punch-btn-active bg-brand-acid text-brand-black font-extrabold ring-1 ring-brand-black'
                  : 'bg-white text-brand-black hover:bg-brand-paper'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Mobile Menu Toggle */}
      <button
        className="lg:hidden punch-btn p-1.5 bg-white text-brand-black rounded-md flex-shrink-0"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {/* Role Clearance Level Badge & Switcher */}
      <button
        onClick={() => {
          if (setUserRole) {
            const roles = ['TACTICAL_DISPATCH', 'FIELD_OFFICER', 'COMMAND_ADMIN'];
            const nextIdx = (roles.indexOf(userRole) + 1) % roles.length;
            setUserRole(roles[nextIdx]);
          }
        }}
        title="Click to cycle role clearance level (Tactical Dispatch / Field Officer / Command Admin)"
        className="hidden md:flex items-center gap-1.5 text-[9px] xl:text-[10px] font-mono font-bold px-2 py-1 border-2 border-brand-black bg-white hover:bg-brand-paper text-brand-black rounded-md shadow-[2px_2px_0px_#181818] whitespace-nowrap flex-shrink-0 cursor-pointer transition-colors"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-brand-purple"></span>
        <span className="text-brand-gray font-normal">ROLE:</span>
        <span className="text-brand-black font-extrabold">{userRole.replace('_', ' ')}</span>
      </button>

      {/* Engine Status Badge */}
      <div className="hidden xl:flex items-center gap-1.5 text-[9px] xl:text-[10px] font-mono font-bold px-2 py-1 border-2 border-brand-black bg-brand-black text-brand-acid rounded-md shadow-[2px_2px_0px_#181818] whitespace-nowrap flex-shrink-0">
        <span className={`w-1.5 h-1.5 rounded-full ${backendOnline ? 'bg-brand-acid animate-ping' : 'bg-red-500'}`}></span>
        <span>ENGINE :8000 [{backendOnline ? 'ACTIVE' : 'OFFLINE'}]</span>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border-2 border-brand-black shadow-[4px_4px_0px_#141414] rounded-xl p-3 z-50 lg:hidden">
          <nav className="flex flex-col gap-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`punch-btn py-2 px-3 text-xs uppercase font-bold tracking-wider font-mono rounded-md ${
                    isActive
                      ? 'punch-btn-active bg-brand-acid text-brand-black font-extrabold'
                      : 'bg-white text-brand-black hover:bg-brand-paper'
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
        <Routes>
          <Route path="/vision-lab" element={<TacticalVisionLabPage />} />
          <Route path="/trajectory" element={<LiveTrackingPage />} />
          <Route path="/sandbox" element={<LiveInspectorPage />} />
          <Route path="/query" element={<TrajectoryQueryPage />} />
          <Route path="/analytics" element={<TrafficAnalyticsPage />} />
          <Route path="/alerts" element={<AlertsManagementPage />} />
          <Route path="/edge-network" element={<EdgeNetworkPage />} />
          <Route path="/architecture" element={<ArchitecturePage />} />
          <Route path="/dual-ai-vision" element={<DualAiVisionDemoPage />} />
          <Route path="/demo" element={<DualAiVisionDemoPage />} />
          <Route path="/simulation" element={<TrafficSimulationPage />} />
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
