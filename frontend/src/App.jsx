import React from 'react';
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
import { ArrowLeft } from 'lucide-react';

function InternalTopNav() {
  const { setActiveTab, activeTab, backendOnline } = useTracking();
  return (
    <header className="flex justify-between items-center w-full px-6 py-4 border-b border-brand-dark-gray/30 bg-brand-black z-20 select-none">
      <div className="flex items-center gap-6">
        <button onClick={() => setActiveTab('home')} className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-brand-acid hover:text-brand-paper transition-colors font-mono">
          <ArrowLeft className="w-3 h-3" /> Home
        </button>
        <div className="text-[11px] font-bold tracking-widest uppercase font-mono text-brand-paper border-l border-brand-dark-gray/50 pl-6">
          Project-MELV
        </div>
      </div>
      <nav className="hidden md:flex gap-6 text-[10px] uppercase font-bold tracking-widest text-brand-gray font-mono">
        <button className={`hover:text-brand-paper transition-colors ${activeTab === 'tactical_vision' ? 'text-brand-acid bg-brand-dark-gray px-2 py-1' : ''}`} onClick={() => setActiveTab('tactical_vision')}>[00] Vision Lab</button>
        <button className={`hover:text-brand-paper transition-colors ${activeTab === 'live_tracking' ? 'text-brand-acid' : ''}`} onClick={() => setActiveTab('live_tracking')}>[01] Trajectory</button>
        <button className={`hover:text-brand-paper transition-colors ${activeTab === 'ai_inspector' ? 'text-brand-acid' : ''}`} onClick={() => setActiveTab('ai_inspector')}>[02] Sandbox</button>
        <button className={`hover:text-brand-paper transition-colors ${activeTab === 'trajectory_query' ? 'text-brand-acid' : ''}`} onClick={() => setActiveTab('trajectory_query')}>[03] Query</button>
        <button className={`hover:text-brand-paper transition-colors ${activeTab === 'traffic_analytics' ? 'text-brand-acid' : ''}`} onClick={() => setActiveTab('traffic_analytics')}>[04] Analytics</button>
        <button className={`hover:text-brand-paper transition-colors ${activeTab === 'alerts' ? 'text-brand-acid' : ''}`} onClick={() => setActiveTab('alerts')}>[05] Alerts</button>
      </nav>
      <div className="flex items-center gap-2 text-[9px] font-mono font-bold px-2.5 py-1 border border-brand-dark-gray text-brand-gray rounded-sm">
        <span className={`w-1.5 h-1.5 rounded-full ${backendOnline ? 'bg-brand-acid animate-pulse' : 'bg-red-500'}`}></span>
        <span>ENGINE :8000 [{backendOnline ? 'ACTIVE' : 'OFFLINE'}]</span>
      </div>
    </header>
  );
}

function AppContent() {
  const { activeTab } = useTracking();

  if (activeTab === 'home') {
    return <HomePage />;
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'tactical_vision':
        return <TacticalVisionLabPage />;
      case 'live_tracking':
        return <LiveTrackingPage />;
      case 'ai_inspector':
        return <LiveInspectorPage />;
      case 'trajectory_query':
        return <TrajectoryQueryPage />;
      case 'traffic_analytics':
        return <TrafficAnalyticsPage />;
      case 'alerts':
        return <AlertsManagementPage />;
      case 'network_status':
        return <EdgeNetworkPage />;
      default:
        return <TacticalVisionLabPage />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-brand-black text-brand-paper overflow-hidden select-none font-sans">
      <InternalTopNav />
      {/* Top Fixed Ticker - we can keep this for internal pages to maintain the system feel, or remove it. Let's keep it under the nav. */}
      <SystemTicker />
      <main className="flex-1 p-4 overflow-y-auto bg-brand-black">
        {renderActivePage()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <TrackingProvider>
      <AppContent />
    </TrackingProvider>
  );
}
