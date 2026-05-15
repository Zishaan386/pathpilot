import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { loadGraph } from './lib/graphLoader';
import { GraphService } from './lib/graphService';
import { AlgorithmRunner, ALGORITHMS } from './lib/algorithmRunner';
import { TrafficSimulator } from './lib/trafficSimulator';
import { historyService } from './lib/historyService';

import RealWorldMap from './components/RealWorldMap';
import TrafficPanel from './components/TrafficPanel';
import ComparisonTable from './components/ComparisonTable';
import RouteHistory from './components/RouteHistory';
import bangaloreData from './data/bangalore.json';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft,
  Settings2,
  Navigation,
  Activity,
  Layers,
  MapPin,
  Clock,
  Compass,
  Car,
  AlertCircle,
  Zap,
  LayoutGrid,
  Download,
  Share2,
  History
} from "lucide-react";

const App = () => {
  const [graph, setGraph] = useState(null);
  const [startNodeId, setStartNodeId] = useState(null);
  const [endNodeId, setEndNodeId] = useState(null);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [selectedAlgorithms, setSelectedAlgorithms] = useState(['dijkstra']);
  const [preference, setPreference] = useState({ distancePriority: 50, timePriority: 50 });
  const [activeTab, setActiveTab] = useState('navigation');
  
  const [snapshotsMap, setSnapshotsMap] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [needsRecalculation, setNeedsRecalculation] = useState(false);
  const [routeHistory, setRouteHistory] = useState([]);
  const [lastSimResult, setLastSimResult] = useState(null);

  useEffect(() => {
    const g = loadGraph(bangaloreData, 1200, 1000);
    setGraph(g);
    setRouteHistory(historyService.getHistory());
  }, []);

  const graphService = useMemo(() => graph ? new GraphService(graph) : null, [graph]);
  const runner = useMemo(() => graphService ? new AlgorithmRunner(graphService) : null, [graphService]);
  const simulator = useMemo(() => graphService ? new TrafficSimulator(graphService) : null, [graphService]);

  const handleNodeClick = (nodeId) => {
    // If we have a completed route or both nodes are selected, 
    // a new click starts a fresh selection.
    if ((snapshotsMap && Object.keys(snapshotsMap).length > 0) || (startNodeId && endNodeId)) {
      setSnapshotsMap({});
      setCurrentStep(0);
      setIsPlaying(false);
      setStartNodeId(nodeId);
      setEndNodeId(null);
    } else if (!startNodeId) {
      setStartNodeId(nodeId);
    } else if (nodeId !== startNodeId) {
      setEndNodeId(nodeId);
    }
  };

  const calculateRoute = () => {
    if (!runner || !startNodeId || !endNodeId) return;
    
    const results = {};
    selectedAlgorithms.forEach(algo => {
      results[algo] = runner.calculate(algo, startNodeId, endNodeId, preference);
    });

    setSnapshotsMap(results);
    setCurrentStep(0);
    setIsPlaying(true);
    setNeedsRecalculation(false);

    // Save first algo result to history for simplicity in the list
    const primaryAlgo = selectedAlgorithms[0];
    const primarySnapshot = results[primaryAlgo][results[primaryAlgo].length - 1];
    historyService.saveRoute({
      startNode: graph.nodes.get(startNodeId),
      endNode: graph.nodes.get(endNodeId),
      algorithm: primaryAlgo,
      metrics: primarySnapshot.metrics
    });
    setRouteHistory(historyService.getHistory());
  };

  const handleConditionChange = () => {
    if (Object.keys(snapshotsMap).length > 0) setNeedsRecalculation(true);
    setGraph({ ...graph }); 
  };

  const resetPlayback = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const resetSelection = () => {
    setStartNodeId(null);
    setEndNodeId(null);
    if (graphService) graphService.resetAll();
    resetPlayback();
    setGraph({ ...graph }); // Force re-render
  };

  const handleHistorySelect = (entry) => {
    setStartNodeId(entry.startNode.id);
    setEndNodeId(entry.endNode.id);
    setSelectedAlgorithms([entry.algorithm]);
    setIsCompareMode(false);
    resetPlayback();
  };

  const clearHistory = () => {
    historyService.clearHistory();
    setRouteHistory([]);
  };

  const toggleAlgorithm = (algoKey) => {
    if (isCompareMode) {
      if (selectedAlgorithms.includes(algoKey)) {
        if (selectedAlgorithms.length > 1) {
          setSelectedAlgorithms(selectedAlgorithms.filter(a => a !== algoKey));
        }
      } else if (selectedAlgorithms.length < 3) {
        setSelectedAlgorithms([...selectedAlgorithms, algoKey]);
      }
    } else {
      setSelectedAlgorithms([algoKey]);
    }
    resetPlayback();
  };

  const runSimulation = () => {
    if (!simulator) return;
    const result = simulator.simulate();
    setLastSimResult(result);
    handleConditionChange();
  };

  const exportTelemetry = () => {
    if (Object.keys(snapshotsMap).length === 0) return;
    const data = JSON.stringify(snapshotsMap, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `route_telemetry_${Date.now()}.json`;
    a.click();
  };

  useEffect(() => {
    let interval;
    const maxSteps = Math.max(...Object.values(snapshotsMap).map(s => s.length), 0);
    
    if (isPlaying && maxSteps > 0 && currentStep < maxSteps - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => prev + 1);
      }, 400 / playbackSpeed);
    } else if (isPlaying && maxSteps > 0 && currentStep >= maxSteps - 1) {
      setIsPlaying(false);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, snapshotsMap, currentStep, playbackSpeed]);

  const currentSnapshots = useMemo(() => {
    const map = {};
    Object.keys(snapshotsMap).forEach(algo => {
      const snaps = snapshotsMap[algo];
      map[algo] = snaps[Math.min(currentStep, snaps.length - 1)];
    });
    return map;
  }, [snapshotsMap, currentStep]);

  const startNode = useMemo(() => graph?.nodes.get(startNodeId), [graph, startNodeId]);
  const endNode = useMemo(() => graph?.nodes.get(endNodeId), [graph, endNodeId]);

  return (
    <div className="flex h-screen w-full bg-[#111110] font-body text-[#F5F5F0] overflow-hidden">
      {/* Sidebar - Left side, Dark & Scrollable */}
      <aside className="w-[360px] h-full bg-[#1A1A1A] border-r border-white/5 flex flex-col z-20 shadow-2xl overflow-hidden shrink-0">
        {/* Header - Fixed */}
        <header className="p-8 pb-4 shrink-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#CAFF3C] rounded-xl flex items-center justify-center shadow-lg">
               <Navigation className="w-6 h-6 text-[#1A1A1A]" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold tracking-tight text-white">PathPilot</h1>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] -mt-1">AI Routing Engine</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 bg-white/5 rounded-xl p-1 h-12">
              <TabsTrigger value="navigation" className="rounded-lg data-[state=active]:bg-[#CAFF3C] data-[state=active]:text-[#111110] text-[9px] font-black uppercase">Nav</TabsTrigger>
              <TabsTrigger value="traffic" className="rounded-lg data-[state=active]:bg-[#CAFF3C] data-[state=active]:text-[#111110] text-[9px] font-black uppercase">Traffic</TabsTrigger>
              <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-[#CAFF3C] data-[state=active]:text-[#111110] text-[9px] font-black uppercase">Log</TabsTrigger>
            </TabsList>
          </Tabs>
        </header>

        {/* Scrollable Content Section */}
        <div className="flex-1 min-h-0 px-8 py-6 custom-scrollbar overflow-y-auto bg-black/20">
          {activeTab === 'navigation' && (
            <div className="space-y-10 pb-8">
              {/* Compare Mode Toggle */}
              <div className={`p-4 rounded-xl border transition-all flex items-center justify-between ${isCompareMode ? 'bg-[#CAFF3C]/10 border-[#CAFF3C]/30' : 'bg-white/5 border-white/5'}`}>
                 <div className="flex items-center gap-2">
                    <LayoutGrid className={`w-4 h-4 ${isCompareMode ? 'text-[#CAFF3C]' : 'text-gray-500'}`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isCompareMode ? 'text-[#CAFF3C]' : 'text-white'}`}>Comparison Mode</span>
                 </div>
                 <Switch 
                   checked={isCompareMode}
                   onCheckedChange={(val) => { 
                     setIsCompareMode(val); 
                     if (!val && selectedAlgorithms.length > 1) {
                       setSelectedAlgorithms([selectedAlgorithms[0]]);
                     }
                     resetPlayback(); 
                   }}
                 />
              </div>

              {/* Algorithm Selection */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-4 h-4 text-gray-500" />
                  <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Routing Logic</h3>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(ALGORITHMS).map(([key, algo]) => (
                    <button 
                      key={key}
                      onClick={() => toggleAlgorithm(key)}
                      className={`group relative p-4 rounded-xl border transition-all text-left overflow-hidden ${
                        selectedAlgorithms.includes(key)
                        ? 'bg-white border-[#CAFF3C] shadow-lg scale-[1.02]' 
                        : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-xs font-bold uppercase tracking-wider ${selectedAlgorithms.includes(key) ? 'text-[#111110]' : 'text-white'}`}>
                          {algo.name}
                        </span>
                        {selectedAlgorithms.includes(key) && <Badge className="bg-[#CAFF3C] text-[#111110] text-[9px] h-4 border-none font-bold">SELECTED</Badge>}
                      </div>
                      <p className={`text-[11px] leading-relaxed ${selectedAlgorithms.includes(key) ? 'text-gray-600' : 'text-gray-400'}`}>
                        {algo.description}
                      </p>
                    </button>
                  ))}
                </div>
              </section>

              {/* Constraints */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-gray-500" />
                    <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Navigation Weights</h3>
                  </div>
                  <Badge className="bg-white/5 text-gray-400 text-[8px] font-black tracking-widest border-none">LINKED PAIR</Badge>
                </div>
                <div className="space-y-6 bg-white/5 p-6 rounded-2xl border border-white/5 shadow-sm">
                  <div className="space-y-4">
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                      <span className="text-gray-400">Distance Preference</span>
                      <span className="font-mono text-[#CAFF3C]">{preference.distancePriority}%</span>
                    </div>
                    <input 
                      type="range"
                      value={preference.distancePriority}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setPreference({ distancePriority: val, timePriority: 100 - val });
                        handleConditionChange();
                      }}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#CAFF3C]"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                      <span className="text-gray-400">Time/Traffic Priority</span>
                      <span className="font-mono text-[#CAFF3C]">{preference.timePriority}%</span>
                    </div>
                    <input 
                      type="range"
                      value={preference.timePriority}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setPreference({ timePriority: val, distancePriority: 100 - val });
                        handleConditionChange();
                      }}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#CAFF3C]"
                    />
                  </div>
                </div>
                <p className="text-[9px] text-gray-500 font-bold mt-3 text-center uppercase tracking-widest">Weights are linked to sum to 100%</p>
              </section>

              {/* Waypoints */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Waypoints</h3>
                </div>
                <div className="space-y-3">
                  <div className={`p-4 bg-white/5 border rounded-xl transition-all ${startNodeId ? 'border-[#22C55E] border-l-[6px]' : 'border-white/5 opacity-40'}`}>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Source Terminal</p>
                    <p className="text-sm font-bold truncate text-white">
                      {startNode ? startNode.name : 'Waiting for input...'}
                    </p>
                  </div>
                  <div className={`p-4 bg-white/5 border rounded-xl transition-all ${endNodeId ? 'border-[#EF4444] border-l-[6px]' : 'border-white/5 opacity-40'}`}>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Target Destination</p>
                    <p className="text-sm font-bold truncate text-white">
                      {endNode ? endNode.name : 'Waiting for input...'}
                    </p>
                  </div>
                  {(startNodeId || endNodeId) && (
                    <button onClick={resetSelection} className="w-full text-[10px] font-black uppercase tracking-widest text-[#EF4444] hover:bg-red-500/10 p-4 rounded-xl border border-red-500/10 transition-all mt-4">
                      MASTER RESET
                    </button>
                  )}
                </div>
              </section>

              {/* Legend / Map Key */}
              <section className="pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <Compass className="w-4 h-4 text-gray-500" />
                  <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Map Legend</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 bg-white/5 p-5 rounded-2xl border border-white/5">
                  <div className="space-y-3">
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Node Status</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Source</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#EF4444]" />
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Target</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#FB923C]" />
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#6B7280]" />
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Visited</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Road Traffic</p>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-0.5 bg-[#22C55E]" />
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Clear</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-0.5 bg-[#FACC15]" />
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Moderate</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-0.5 bg-[#EF4444]" />
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Heavy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-0.5 border-b border-dashed border-[#EF4444]" />
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Closed</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 mt-4">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#CAFF3C] animate-pulse shadow-[0_0_8px_#CAFF3C]" />
                   <span className="text-[9px] font-black text-[#CAFF3C] uppercase tracking-widest">Optimized Path Solution</span>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'traffic' && (
            <TrafficPanel 
              graph={graph} 
              graphService={graphService} 
              onConditionChange={handleConditionChange} 
            />
          )}

          {activeTab === 'history' && (
            <RouteHistory history={routeHistory} onSelect={handleHistorySelect} onClear={clearHistory} />
          )}
        </div>

        <footer className="p-8 pt-4 shrink-0 space-y-3">
          {activeTab === 'traffic' && (
            <Button 
              onClick={runSimulation}
              className="w-full h-12 bg-white/5 text-white hover:bg-white/10 text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/10 flex gap-2 items-center justify-center"
            >
              <Zap className="w-3.5 h-3.5 text-[#CAFF3C]" />
              {lastSimResult ? `AFFECTED ${lastSimResult.affected} SEGMENTS` : 'Simulate City Traffic'}
            </Button>
          )}
          <Button 
            onClick={calculateRoute}
            disabled={!startNodeId || !endNodeId || isPlaying}
            className="w-full h-16 bg-[#CAFF3C] text-[#111110] font-black text-xs tracking-[0.2em] shadow-xl hover:bg-[#CAFF3C]/90 disabled:opacity-20 disabled:bg-gray-800 disabled:text-gray-500 rounded-2xl border-t border-white/20"
          >
            {isPlaying ? 'EXECUTING SEARCH...' : 'INITIALIZE ROUTE'}
          </Button>
        </footer>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full flex flex-col bg-[#111110] overflow-hidden">
        {/* Scrollable Map & Metrics Area */}
        <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
          {/* Metric Strip (Single Mode) or Comparison Table (Compare Mode) */}
          {!isCompareMode ? (
            <div className="grid grid-cols-4 gap-6">
              {[
                { label: 'Network Distance', value: currentSnapshots[selectedAlgorithms[0]]?.metrics.realDistance ? currentSnapshots[selectedAlgorithms[0]].metrics.realDistance.toFixed(2) : '--', unit: 'km', icon: Compass, gradient: 'from-blue-500/10 to-transparent' },
                { label: 'Projected Time', value: currentSnapshots[selectedAlgorithms[0]]?.metrics.currentCost ? Math.round(currentSnapshots[selectedAlgorithms[0]].metrics.currentCost * 1.8) : '--', unit: 'min', icon: Clock, gradient: 'from-pink-500/10 to-transparent' },
                { label: 'Computed Nodes', value: currentSnapshots[selectedAlgorithms[0]]?.metrics.nodesExplored || '0', sub: 'EXPLORATION', icon: Activity, gradient: 'from-green-500/10 to-transparent' },
                { label: 'Efficiency Score', value: currentSnapshots[selectedAlgorithms[0]]?.metrics.efficiency ? currentSnapshots[selectedAlgorithms[0]].metrics.efficiency.toFixed(1) : '--', unit: '%', icon: Zap, gradient: 'from-yellow-500/10 to-transparent' },
              ].map((metric, i) => (
                <Card key={i} className="relative overflow-hidden border-none bg-white shadow-2xl rounded-[24px] p-6 group transition-all hover:scale-[1.02]">
                  <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient}`} />
                  <div className="relative z-10">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-4">{metric.label}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-display font-bold text-[#111110] tabular-nums tracking-tighter">
                        {metric.value}
                      </span>
                      {metric.unit && <span className="text-xs font-bold text-gray-500">{metric.unit}</span>}
                    </div>
                    {metric.sub && <p className="text-[9px] font-bold text-gray-400 mt-1 tracking-widest">{metric.sub}</p>}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <ComparisonTable results={currentSnapshots} />
          )}

          {/* Map Canvas Area - Multi-view Support */}
          <div className={`grid gap-8 ${isCompareMode ? 'grid-cols-1' : 'grid-cols-1'} min-h-0`}>
            {selectedAlgorithms.map(algo => (
              <div key={algo} className={`relative ${isCompareMode ? 'h-[500px]' : 'h-[400px]'} rounded-[32px] overflow-hidden border border-white/5 shadow-3xl bg-white group flex flex-col`}>
                <div className="absolute top-6 left-6 z-10">
                  <Badge className="bg-[#111110] text-[#CAFF3C] text-[9px] font-black px-3 py-1 border-none shadow-xl">
                    {algo.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex-1">
                  <RealWorldMap 
                    graph={graph}
                    startNodeId={startNodeId}
                    endNodeId={endNodeId}
                    onNodeClick={handleNodeClick}
                    currentSnapshot={currentSnapshots[algo]}
                    inverted={true}
                  />
                </div>
                {isCompareMode && (
                  <div className="absolute bottom-6 right-6 z-10 transition-opacity">
                    <div className="bg-[#111110] border border-[#CAFF3C]/30 px-4 py-2 rounded-xl shadow-2xl">
                      <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Nodes Visited</p>
                      <p className="text-sm font-mono font-bold text-[#CAFF3C]">
                        {currentSnapshots[algo]?.metrics.nodesExplored || 0}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Overlay Status */}
             <div className="absolute top-8 right-8 flex flex-col items-end gap-3 z-30">
                {needsRecalculation && (
                  <div className="bg-[#EF4444] text-white font-black px-6 py-3 rounded-2xl shadow-2xl text-[10px] tracking-widest animate-bounce flex items-center gap-3 border border-white/20">
                    <AlertCircle className="w-4 h-4" />
                    CONDITIONS CHANGED · RECALCULATION REQUIRED
                  </div>
                )}
             </div>
          </div>

          {/* Playback & Tools - Full Width */}
          <div className="pb-10">
            <Card className="bg-white border-none shadow-2xl rounded-[28px] overflow-hidden">
              <div className="flex items-center justify-between p-5 px-8 bg-black/[0.02] border-b border-black/5">
                <div className="flex items-center gap-6">
                  <button onClick={resetPlayback} className="text-black/30 hover:text-[#111110] transition-colors">
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-3">
                    <button disabled={currentStep === 0} onClick={() => { setIsPlaying(false); setCurrentStep(prev => prev - 1); }} className="p-2 rounded-full hover:bg-black/5 text-black disabled:opacity-20">
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button onClick={() => setIsPlaying(!isPlaying)} className="w-14 h-14 rounded-2xl bg-[#111110] text-[#CAFF3C] hover:scale-105 transition-all flex items-center justify-center shadow-xl">
                      {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
                    </button>
                    <button onClick={() => { setIsPlaying(false); setCurrentStep(prev => prev + 1); }} className="p-2 rounded-full hover:bg-black/5 text-black">
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 mx-16">
                  <div className="h-1 bg-black/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#111110] transition-all duration-300"
                      style={{ 
                        width: `${Object.keys(snapshotsMap).length > 0 ? (currentStep / (Math.max(...Object.values(snapshotsMap).map(s => s.length)) - 1)) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>

                <div className="flex gap-1.5">
                  {[0.5, 1, 2, 4].map((speed) => (
                    <button 
                      key={speed} 
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                        playbackSpeed === speed ? 'bg-[#111110] text-[#CAFF3C]' : 'text-black/30 hover:text-black hover:bg-black/5'
                      }`}
                    >
                      {speed}X
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
