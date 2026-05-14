import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  History, 
  MapPin, 
  ChevronRight, 
  Clock, 
  Trash2,
  Calendar
} from "lucide-react";

const RouteHistory = ({ history, onSelect, onClear }) => {
  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-white/5 rounded-2xl border border-white/5 border-dashed">
        <History className="w-8 h-8 text-white/10 mb-4" />
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
          Operational History Empty<br/>Generate telemetry to log routes
        </p>
      </div>
    );
  }

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-gray-500" />
          <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Route Ledger</h3>
        </div>
        <button 
          onClick={onClear}
          className="text-[9px] font-bold text-gray-500 hover:text-[#EF4444] transition-colors flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" />
          CLEAR ALL
        </button>
      </div>

      <div className="space-y-2">
        {history.map((entry) => (
          <Card 
            key={entry.id} 
            className="bg-white/5 border-white/5 hover:bg-white/10 transition-all cursor-pointer group"
            onClick={() => onSelect(entry)}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex flex-col items-center gap-1">
                 <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
                 <div className="w-px h-4 bg-white/10" />
                 <div className="w-2 h-2 rounded-full bg-[#EF4444]" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                   <Badge className="bg-[#CAFF3C] text-[#111110] text-[8px] font-black h-4 px-1.5 rounded-sm">
                     {entry.algorithm.toUpperCase()}
                   </Badge>
                   <span className="text-[9px] font-mono text-gray-500 flex items-center gap-1">
                     <Clock className="w-2.5 h-2.5" />
                     {formatDate(entry.timestamp)}
                   </span>
                </div>
                <p className="text-[11px] font-bold text-white truncate mb-0.5">
                  {entry.startNode.name} → {entry.endNode.name}
                </p>
                <div className="flex gap-3 text-[9px] font-bold text-gray-500 uppercase tracking-tighter">
                  <span>{entry.metrics.currentCost.toFixed(1)} km</span>
                  <span>•</span>
                  <span>{Math.round(entry.metrics.currentCost * 1.8)} min</span>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-[#CAFF3C] transition-colors" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RouteHistory;
