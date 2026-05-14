import React from 'react';

const DevTokens = () => {
  return (
    <div className="min-h-screen bg-app p-12">
      <header className="mb-12">
        <h1 className="text-display-sm font-display text-primary-light mb-2">Design Tokens Verification</h1>
        <p className="text-body text-secondary-light">Confirming colors and components match the design system.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Node States */}
        <section className="bg-white p-8 rounded-xl shadow-card">
          <h2 className="text-label text-secondary-light uppercase mb-6 tracking-widest">Node States</h2>
          <div className="flex flex-wrap gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-node-unvisited mx-auto mb-2 border-2 border-white/10 shadow-sm"></div>
              <p className="text-micro text-secondary-light">UNVISITED</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-node-queue mx-auto mb-2 border-2 border-white/10 shadow-sm"></div>
              <p className="text-micro text-secondary-light">QUEUE</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-node-processing mx-auto mb-2 border-2 border-accent/50 animate-pulse shadow-accent"></div>
              <p className="text-micro text-secondary-light">PROCESSING</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-node-finalized mx-auto mb-2 border-2 border-white/10 shadow-sm"></div>
              <p className="text-micro text-secondary-light">FINALIZED</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-node-path mx-auto mb-2 border-2 border-accent shadow-accent"></div>
              <p className="text-micro text-secondary-light">PATH</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-node-start mx-auto mb-2 border-2 border-white/10 shadow-sm"></div>
              <p className="text-micro text-secondary-light">START</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-node-end mx-auto mb-2 border-2 border-white/10 shadow-sm"></div>
              <p className="text-micro text-secondary-light">END</p>
            </div>
          </div>
        </section>

        {/* Edge States */}
        <section className="bg-card-dark p-8 rounded-xl shadow-card">
          <h2 className="text-label text-secondary-dark uppercase mb-6 tracking-widest">Edge States</h2>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 h-[2px] bg-edge-default"></div>
              <p className="text-micro text-secondary-dark w-24">DEFAULT</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-[4px] bg-edge-path shadow-accent"></div>
              <p className="text-micro text-accent w-24">OPTIMAL PATH</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-[3px] bg-edge-traffic-heavy"></div>
              <p className="text-micro text-warning w-24">HEAVY TRAFFIC</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-[2px] border-b-2 border-dashed border-edge-blocked"></div>
              <p className="text-micro text-danger w-24">BLOCKED</p>
            </div>
          </div>
        </section>

        {/* Metric Card */}
        <section>
          <h2 className="text-label text-secondary-light uppercase mb-6 tracking-widest">Metric Card</h2>
          <div className="bg-card-dark p-8 rounded-xl border border-white/10 shadow-card w-full max-w-sm">
            <p className="text-label text-secondary-dark uppercase mb-4">Total Distance</p>
            <div className="flex items-baseline gap-2">
              <span className="text-display-hero font-display text-primary-dark tabular-nums tracking-tighter">14.2</span>
              <span className="text-display-sm font-display text-secondary-dark">km</span>
            </div>
            <p className="text-caption text-secondary-dark mt-2">+2.4km FROM OPTIMAL</p>
          </div>
        </section>

        {/* Status Pills */}
        <section className="flex flex-col gap-8">
          <div>
            <h2 className="text-label text-secondary-light uppercase mb-6 tracking-widest">Status Pills</h2>
            <div className="flex flex-wrap gap-4">
              <span className="bg-success/10 text-success px-3 py-1 rounded-full text-micro font-bold border border-success/20">LIGHT TRAFFIC</span>
              <span className="bg-warning/10 text-warning px-3 py-1 rounded-full text-micro font-bold border border-warning/20">MODERATE</span>
              <span className="bg-danger/10 text-danger px-3 py-1 rounded-full text-micro font-bold border border-danger/20">SEVERE</span>
              <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-micro font-bold border border-accent/20">DIJKSTRA · RUNNING</span>
            </div>
          </div>
          
          <div>
            <h2 className="text-label text-secondary-light uppercase mb-6 tracking-widest">Typography</h2>
            <div className="space-y-4">
              <p className="text-display-sm font-display">Space Grotesk Display</p>
              <p className="text-body">Inter Body Text: The quick brown fox jumps over the lazy dog.</p>
              <p className="text-body-sm font-mono">JetBrains Mono: 12.9716, 77.5946</p>
            </div>
          </div>
        </section>
      </div>

      <footer className="mt-16 pt-8 border-t border-black/5 text-center">
        <a href="/" className="text-accent-text bg-accent px-6 py-3 rounded-md font-bold hover:brightness-105 transition-all shadow-accent">
          Back to Dashboard
        </a>
      </footer>
    </div>
  );
};

export default DevTokens;
