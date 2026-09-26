import React from 'react';
import { TrackingProvider, useTracking } from './context/TrackingContext';
import SystemTicker from './components/common/SystemTicker';
import Sidebar from './components/common/Sidebar';
import LiveTrackingPage from './pages/LiveTrackingPage';
import LiveInspectorPage from './pages/LiveInspectorPage';
import TrajectoryQueryPage from './pages/TrajectoryQueryPage';
import TrafficAnalyticsPage from './pages/TrafficAnalyticsPage';
import AlertsManagementPage from './pages/AlertsManagementPage';
import EdgeNetworkPage from './pages/EdgeNetworkPage';

function AppContent() {
  const { activeTab } = useTracking();

  const renderActivePage = () => {
    switch (activeTab) {
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
        return <LiveTrackingPage />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-obsidian text-slate-100 overflow-hidden select-none">
      {/* Top Fixed Ticker */}
      <SystemTicker />

      {/* Main Layout: Sidebar + Active Tab Content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-3 overflow-y-auto bg-obsidian">
          {renderActivePage()}
        </main>
      </div>
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
