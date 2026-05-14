import { 
  AlertTriangle, 
  Search, 
  Car, 
  XCircle, 
  CheckCircle2, 
  Zap,
  RefreshCw
} from "lucide-react";
import { useState, useMemo } from "react";

const TrafficPanel = ({ graph, graphService, onConditionChange }) => {
  const [search, setSearch] = useState('');
  
  const edges = useMemo(() => {
    if (!graph || !graph.edges) return [];
    try {
      // Only show forward edges to avoid duplicates in the UI
      return Array.from(graph.edges.values())
        .filter(e => e && e.id && !e.id.endsWith('_rev'))
        .map(e => ({
          ...e,
          fromName: graph.nodes.get(e.from)?.name || 'Unknown',
          toName: graph.nodes.get(e.to)?.name || 'Unknown'
        }));
    } catch (err) {
      console.error("Error processing edges for TrafficPanel:", err);
      return [];
    }
  }, [graph]);

  const filteredEdges = useMemo(() => {
    const s = search.toLowerCase();
    return edges.filter(e => {
      const name = e.name || '';
      const from = e.fromName || '';
      const to = e.toName || '';
      return name.toLowerCase().includes(s) || 
             from.toLowerCase().includes(s) || 
             to.toLowerCase().includes(s);
    });
  }, [edges, search]);

  const handleTrafficChange = (edgeId, val) => {
    if (graphService && graphService.updateTraffic) {
      graphService.updateTraffic(edgeId, val);
      onConditionChange();
    }
  };

  const handleBlockToggle = (edgeId, isBlocked) => {
    if (graphService) {
      if (isBlocked && graphService.blockEdge) {
        graphService.blockEdge(edgeId);
      } else if (graphService.resetEdge) {
        graphService.resetEdge(edgeId);
      }
      onConditionChange();
    }
  };

  const getTrafficColor = (multiplier) => {
    if (multiplier <= 1.0) return '#22C55E';
    if (multiplier <= 1.5) return '#FACC15';
    if (multiplier <= 2.5) return '#F97316';
    return '#EF4444';
  };

  const getTrafficLabel = (multiplier) => {
    if (multiplier <= 1.0) return 'Light';
    if (multiplier <= 1.5) return 'Moderate';
    if (multiplier <= 2.5) return 'Heavy';
    return 'Severe';
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-gray-500" />
          <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Network Conditions</h3>
        </div>
        <div className="bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 text-[9px] font-bold px-2 py-0.5 rounded-full">LIVE</div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        <input 
          placeholder="Search roads or intersections..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 h-10 bg-white/5 border border-white/5 text-xs font-medium focus:outline-none focus:border-[#CAFF3C] rounded-xl text-white placeholder:text-gray-600"
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-4 -mr-4 custom-scrollbar">
        <div className="space-y-3 pb-4">
          {filteredEdges.map(edge => (
            <div key={edge.id} className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden group p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black text-white uppercase tracking-wider mb-0.5">{edge.name || 'Unnamed Segment'}</p>
                    <p className="text-[9px] text-gray-500 font-bold truncate max-w-[180px]">
                      {edge.fromName} → {edge.toName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">Block</span>
                    <input 
                      type="checkbox"
                      checked={!!edge.blocked}
                      onChange={(e) => handleBlockToggle(edge.id, e.target.checked)}
                      className="w-8 h-4 rounded-full appearance-none bg-white/10 checked:bg-[#EF4444] relative cursor-pointer transition-colors border border-white/10 before:absolute before:w-3 before:h-3 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-transform"
                    />
                  </div>
                </div>

                {!edge.blocked ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${edge.trafficMultiplier > 1 ? 'animate-pulse' : ''}`} style={{ backgroundColor: getTrafficColor(edge.trafficMultiplier) }} />
                        <span className={`text-[10px] font-black uppercase tracking-widest`} style={{ color: getTrafficColor(edge.trafficMultiplier) }}>
                          {getTrafficLabel(edge.trafficMultiplier)}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-gray-400">{edge.trafficMultiplier.toFixed(1)}x</span>
                    </div>
                    <input 
                      type="range"
                      value={edge.trafficMultiplier}
                      min={1.0}
                      max={4.0}
                      step={0.5}
                      onChange={(e) => handleTrafficChange(edge.id, parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#CAFF3C]"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 py-1 text-[#EF4444]">
                    <XCircle className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-[0.1em]">Road Closed - Emergency Response</span>
                  </div>
                )}
            </div>
          ))}
          {filteredEdges.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-xs text-gray-500 font-bold">No segments matching query</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrafficPanel;
