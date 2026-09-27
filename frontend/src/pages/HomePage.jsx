import React from 'react';
import { useTracking } from '../context/TrackingContext';

export default function HomePage() {
  const { setActiveTab } = useTracking();

  return (
    <div className="w-full min-h-screen text-brand-paper relative font-sans overflow-x-hidden">
      <div className="atmospheric-bg"></div>

      {/* Hero Panel */}
      <div className="bg-brand-paper text-brand-black w-full min-h-[85vh] relative chamfer-bottom flex flex-col p-6 md:p-12 z-10">
        
        {/* Top Navigation */}
        <header className="flex justify-between items-center w-full mb-16 md:mb-24 relative z-20">
          <div className="text-[11px] font-bold tracking-widest uppercase font-mono">
            Project-MELV <br /> SIH 26127
          </div>
          <nav className="hidden md:flex gap-8 text-[10.5px] uppercase font-bold tracking-widest text-brand-gray">
            <button className="text-brand-acid hover:text-brand-black transition-colors font-bold" onClick={() => setActiveTab('tactical_vision')}>★ Vision Lab Demo</button>
            <button className="hover:text-brand-black transition-colors" onClick={() => setActiveTab('live_tracking')}>Live Trajectory</button>
            <button className="hover:text-brand-black transition-colors" onClick={() => setActiveTab('ai_inspector')}>AI Sandbox</button>
            <button className="hover:text-brand-black transition-colors" onClick={() => setActiveTab('traffic_analytics')}>Analytics</button>
          </nav>
          <div className="text-[10px] font-mono font-bold px-3 py-1 border border-brand-black/20 rounded-sm">
            v2.0 // CHENNAI
          </div>
        </header>

        {/* Floating Labels */}
        <div className="absolute top-[20%] right-[10%] rotate-3 border border-brand-black px-2 py-1 text-[9px] font-bold uppercase tracking-wider bg-brand-paper z-20 hover:rotate-0 transition-transform duration-300">
          Urban Mobility
        </div>
        <div className="absolute top-[45%] left-[5%] -rotate-6 border border-brand-black px-2 py-1 text-[9px] font-bold uppercase tracking-wider bg-brand-paper z-20 hover:rotate-0 transition-transform duration-300">
          ANPR Node Mesh
        </div>
        <div className="absolute bottom-[20%] left-[25%] rotate-2 border border-brand-black px-2 py-1 text-[9px] font-bold uppercase tracking-wider bg-brand-paper z-20 hover:rotate-0 transition-transform duration-300">
          Spatial Analytics
        </div>

        {/* Hero Content */}
        <div className="relative flex-1 flex flex-col justify-center items-center text-center z-10 w-full max-w-6xl mx-auto">
          
          <h1 className="editorial-headline text-[12vw] md:text-[8rem] lg:text-[10rem] text-brand-black w-full translate-y-4 animate-fade-up">
            CITY-WIDE
            <br />
            <span className="relative">
              AI ENGINE
              {/* Purple Badge */}
              <div className="absolute -top-10 -right-8 md:-top-16 md:-right-20 w-24 h-24 md:w-32 md:h-32 bg-brand-purple starburst-badge flex items-center justify-center rotate-12 hover:rotate-[24deg] transition-transform duration-500 z-30">
                <span className="text-white font-mono font-bold text-[10px] md:text-xs tracking-widest text-center leading-tight transform -rotate-12">
                  100%<br/>EDGE
                </span>
              </div>
            </span>
          </h1>
          
          <p className="mt-8 text-sm md:text-base font-medium max-w-md text-brand-dark-gray leading-relaxed">
            Multi-camera trajectory tracking and urban traffic analytics. 
            Bridging isolated CCTV silos into a cohesive, spatial-temporal intelligence grid.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => setActiveTab('tactical_vision')}
              className="bg-brand-acid text-brand-black font-bold text-xs uppercase tracking-widest px-8 py-4 -rotate-1 hover:rotate-0 hover:translate-y-[-4px] transition-all duration-300 shadow-editorial border-2 border-brand-black flex items-center justify-center gap-2"
            >
              <span>★ Launch Vision Lab Demo</span>
            </button>
            <button 
              onClick={() => setActiveTab('live_tracking')}
              className="bg-brand-black text-brand-paper font-bold text-xs uppercase tracking-widest px-8 py-4 rotate-1 hover:rotate-0 hover:translate-y-[-4px] transition-all duration-300 shadow-editorial border-2 border-brand-black"
            >
              Enter Command Center
            </button>
          </div>
        </div>
        
        {/* Bottom utility */}
        <div className="absolute bottom-6 right-6 text-[10px] font-mono text-brand-gray">
          LAT: 12.8529 / LNG: 80.2415
        </div>
      </div>

      {/* Main Editorial Statement */}
      <section className="py-24 md:py-32 px-6 flex flex-col items-center text-center max-w-5xl mx-auto">
        <h2 className="editorial-headline text-4xl md:text-6xl lg:text-7xl text-brand-paper">
          FROM SILOS TO <br/> <span className="text-brand-acid">COHESIVE TACTICAL GRID.</span>
        </h2>
        <div className="mt-16 w-12 h-12 bg-brand-purple starburst-badge flex-shrink-0"></div>
      </section>

      {/* Asymmetric Card Grid */}
      <section className="pb-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          
          {/* Card 01 - Large Feature */}
          <div 
            onClick={() => setActiveTab('live_tracking')}
            className="md:col-span-12 lg:col-span-8 bg-brand-acid text-brand-black p-8 md:p-12 chamfer-card cursor-pointer group hover:-translate-y-2 transition-transform duration-300"
          >
            <div className="editorial-number text-7xl md:text-9xl opacity-20 mb-8 -ml-2 leading-none">01</div>
            <div className="text-[11px] font-bold uppercase tracking-widest mb-4">Tactical Operations</div>
            <h3 className="editorial-headline text-4xl md:text-5xl mb-4">Live Trajectory</h3>
            <p className="text-sm font-medium mb-8 max-w-md">Real-time geospatial tracking across the Kanathur mesh. Watch AI stitch disparate camera feeds into continuous vehicle trajectories.</p>
            <span className="inline-block border border-brand-black px-4 py-2 text-[10px] font-bold uppercase tracking-wider group-hover:bg-brand-black group-hover:text-brand-acid transition-colors">Launch Module →</span>
          </div>

          {/* Card 02 */}
          <div 
            onClick={() => setActiveTab('ai_inspector')}
            className="md:col-span-6 lg:col-span-4 bg-brand-paper text-brand-black p-8 chamfer-card cursor-pointer group hover:-translate-y-2 transition-transform duration-300 mt-0 lg:mt-24"
          >
            <div className="editorial-number text-6xl md:text-7xl opacity-20 mb-6 -ml-1 leading-none">02</div>
            <div className="text-[10px] font-bold uppercase tracking-widest mb-3">Model Verification</div>
            <h3 className="editorial-headline text-2xl md:text-3xl mb-3">AI Sandbox Lab</h3>
            <p className="text-xs mb-6 text-brand-dark-gray leading-relaxed">Inspect VehicleNet-Y26n model confidence, bounding boxes, and OCR accuracy on raw feed data.</p>
            <span className="inline-block border border-brand-black px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider group-hover:bg-brand-black group-hover:text-brand-paper transition-colors">Inspect →</span>
          </div>

          {/* Card 03 */}
          <div 
            onClick={() => setActiveTab('trajectory_query')}
            className="md:col-span-6 lg:col-span-4 bg-brand-paper text-brand-black p-8 chamfer-card cursor-pointer group hover:-translate-y-2 transition-transform duration-300"
          >
            <div className="editorial-number text-6xl md:text-7xl opacity-20 mb-6 -ml-1 leading-none">03</div>
            <div className="text-[10px] font-bold uppercase tracking-widest mb-3">Forensics</div>
            <h3 className="editorial-headline text-2xl md:text-3xl mb-3">Trajectory Query</h3>
            <p className="text-xs mb-6 text-brand-dark-gray leading-relaxed">Search historical plate data. Uncover spatial anomalies and cloned plates across the network.</p>
            <span className="inline-block border border-brand-black px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider group-hover:bg-brand-black group-hover:text-brand-paper transition-colors">Query →</span>
          </div>

          {/* Card 04 */}
          <div 
            onClick={() => setActiveTab('traffic_analytics')}
            className="md:col-span-6 lg:col-span-4 bg-brand-paper text-brand-black p-8 chamfer-card cursor-pointer group hover:-translate-y-2 transition-transform duration-300 lg:-mt-12"
          >
            <div className="editorial-number text-6xl md:text-7xl opacity-20 mb-6 -ml-1 leading-none">04</div>
            <div className="text-[10px] font-bold uppercase tracking-widest mb-3">Macro Insights</div>
            <h3 className="editorial-headline text-2xl md:text-3xl mb-3">Urban Analytics</h3>
            <p className="text-xs mb-6 text-brand-dark-gray leading-relaxed">Visualize traffic volume, speed variations, and vehicle modal splits to inform city planning.</p>
            <span className="inline-block border border-brand-black px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider group-hover:bg-brand-black group-hover:text-brand-paper transition-colors">Analyze →</span>
          </div>

          {/* Card 05 */}
          <div 
            onClick={() => setActiveTab('alerts')}
            className="md:col-span-6 lg:col-span-4 bg-brand-paper text-brand-black p-8 chamfer-card cursor-pointer group hover:-translate-y-2 transition-transform duration-300"
          >
            <div className="editorial-number text-6xl md:text-7xl opacity-20 mb-6 -ml-1 leading-none">05</div>
            <div className="text-[10px] font-bold uppercase tracking-widest mb-3 text-brand-purple">Security</div>
            <h3 className="editorial-headline text-2xl md:text-3xl mb-3">Alerts & Dispatch</h3>
            <p className="text-xs mb-6 text-brand-dark-gray leading-relaxed">Real-time hotlist matching and automated intercept predictions for law enforcement dispatch.</p>
            <span className="inline-block border border-brand-black px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider group-hover:bg-brand-black group-hover:text-brand-paper transition-colors">View Alerts →</span>
          </div>

        </div>
      </section>
      
      {/* Footer */}
      <footer className="w-full border-t border-brand-dark-gray/30 p-6 flex justify-between items-center text-[10px] font-mono text-brand-gray">
        <div>© 2026 PROJECT-MELV</div>
        <div className="uppercase">Developed for SIH PS26127</div>
      </footer>
    </div>
  );
}
