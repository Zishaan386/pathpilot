import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Clock, 
  Navigation, 
  Activity, 
  Layers,
  ChevronRight
} from "lucide-react";

const ComparisonTable = ({ results }) => {
  if (!results || Object.keys(results).length === 0) return null;

  const algos = Object.keys(results);
  
  // Helper to find the winner for a metric
  const findWinner = (metricKey, lowerIsBetter = true) => {
    let bestVal = lowerIsBetter ? Infinity : -Infinity;
    let winner = null;

    algos.forEach(algo => {
      const metrics = results[algo].metrics;
      if (!metrics || !metrics.pathFound) return;

      const val = metrics[metricKey];
      if (lowerIsBetter ? val < bestVal : val > bestVal) {
        bestVal = val;
        winner = algo;
      }
    });

    return winner;
  };

  const winners = {
    distance: findWinner('currentCost'),
    time: findWinner('currentCost'), // Time is proportional to cost for now
    nodes: findWinner('nodesExplored'),
    efficiency: findWinner('efficiency', false),
  };

  return (
    <Card className="bg-white border-none shadow-3xl rounded-[32px] overflow-hidden">
      <div className="p-8 border-b border-black/5 bg-black/[0.02] flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black text-[#111110] uppercase tracking-[0.2em] mb-1">Comparative Benchmarking</h3>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Cross-Algorithm Performance Telemetry</p>
        </div>
        <Badge className="bg-[#111110] text-[#CAFF3C] text-[9px] px-3 font-black tracking-widest border-none">ACTIVE SESSION</Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-black/[0.01]">
              <th className="p-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-black/5">Metric</th>
              {algos.map(algo => (
                <th key={algo} className="p-6 text-center text-[11px] font-black text-[#111110] uppercase tracking-widest border-b border-black/5">
                  {algo.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {[
              { label: 'Total Distance', key: 'currentCost', unit: 'km', winnerKey: 'distance' },
              { label: 'Travel Time', key: 'currentCost', unit: 'min', factor: 1.8, winnerKey: 'time' },
              { label: 'Nodes Explored', key: 'nodesExplored', winnerKey: 'nodes' },
              { label: 'Peak Queue Load', key: 'queueSize', winnerKey: 'queue' },
              { label: 'Engine Efficiency', key: 'efficiency', unit: '%', winnerKey: 'efficiency' },
            ].map((row, i) => (
              <tr key={i} className="hover:bg-black/[0.01] transition-colors">
                <td className="p-6">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{row.label}</span>
                </td>
                {algos.map(algo => {
                  const val = results[algo].metrics[row.key];
                  const displayVal = row.factor ? (val * row.factor).toFixed(0) : (typeof val === 'number' ? val.toFixed(1) : '--');
                  const isWinner = winners[row.winnerKey] === algo;

                  return (
                    <td key={algo} className="p-6 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-mono font-bold ${isWinner ? 'text-[#111110]' : 'text-gray-400'}`}>
                            {displayVal}{row.unit}
                          </span>
                          {isWinner && <Trophy className="w-3 h-3 text-[#CAFF3C] fill-[#CAFF3C]" />}
                        </div>
                        {isWinner && <span className="text-[8px] font-black text-[#CAFF3C] bg-[#111110] px-1.5 py-0.5 rounded-full tracking-tighter">WINNER</span>}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default ComparisonTable;
