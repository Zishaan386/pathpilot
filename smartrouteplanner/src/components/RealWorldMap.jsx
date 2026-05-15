import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Helper to fix Leaflet default icon issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

const RealWorldMap = ({ graph, startNodeId, endNodeId, onNodeClick, currentSnapshot, inverted = true }) => {
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]); // Bangalore center
  const [zoom, setZoom] = useState(12);

  // Determine bounds and center from graph
  useEffect(() => {
    if (graph && graph.nodes.size > 0) {
      const lats = Array.from(graph.nodes.values()).map(n => n.coordinates.lat);
      const lngs = Array.from(graph.nodes.values()).map(n => n.coordinates.lng);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      setMapCenter([(minLat + maxLat) / 2, (minLng + maxLng) / 2]);
    }
  }, [graph]);

  const getTrafficColor = (multiplier) => {
    if (multiplier <= 1.0) return inverted ? '#3B82F6' : '#60A5FA'; // Clear - Blue
    if (multiplier <= 1.5) return '#FACC15'; // Moderate - Yellow
    if (multiplier <= 2.5) return '#F97316'; // Heavy - Orange
    return '#EF4444'; // Severe - Red
  };

  const tileLayerUrl = inverted 
    ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  const nodes = useMemo(() => {
    if (!graph) return [];
    return Array.from(graph.nodes.values());
  }, [graph]);

  const edges = useMemo(() => {
    if (!graph) return [];
    return Array.from(graph.edges.values());
  }, [graph]);

  return (
    <div className="w-full h-full relative">
      <MapContainer 
        center={mapCenter} 
        zoom={zoom} 
        style={{ width: '100%', height: '100%', background: inverted ? '#f8f9fa' : '#111110' }}
        zoomControl={false}
      >
        <ChangeView center={mapCenter} zoom={zoom} />
        <TileLayer url={tileLayerUrl} attribution={attribution} />

        {/* Edges */}
        {edges.map(edge => {
          const fromNode = graph.nodes.get(edge.from);
          const toNode = graph.nodes.get(edge.to);
          if (!fromNode || !toNode) return null;

          const isPath = currentSnapshot?.finalPath?.includes(edge.from) && 
                         currentSnapshot?.finalPath?.includes(edge.to);

          const positions = edge.waypoints && edge.waypoints.length > 0
            ? edge.waypoints.map(w => [w.lat, w.lng])
            : [
                [fromNode.coordinates.lat, fromNode.coordinates.lng],
                [toNode.coordinates.lat, toNode.coordinates.lng]
              ];

          let color = getTrafficColor(edge.trafficMultiplier);
          let weight = edge.trafficMultiplier > 1 ? 4 : 2;
          let dashArray = null;
          let opacity = 0.6;

          if (edge.blocked) {
            color = '#EF4444';
            dashArray = '5, 10';
            weight = 3;
          } else if (isPath) {
            color = '#84cc16'; // Lime-500
            weight = 8;
            opacity = 1;
          }

          return (
            <Polyline 
              key={edge.id}
              positions={positions}
              pathOptions={{
                color: color,
                weight: weight,
                dashArray: dashArray,
                opacity: opacity,
                lineJoin: 'round'
              }}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map(node => {
          let color = inverted ? '#111110' : '#3A3A3A';
          let radius = 6;
          let fillOpacity = 0.8;
          let stroke = true;
          let weight = 2;

          if (node.id === startNodeId) {
            color = '#22C55E';
            radius = 10;
            fillOpacity = 1;
          } else if (node.id === endNodeId) {
            color = '#EF4444';
            radius = 10;
            fillOpacity = 1;
          } else if (currentSnapshot) {
            if (currentSnapshot.currentNode === node.id) {
              color = '#FB923C';
              radius = 12;
              fillOpacity = 1;
            } else if (currentSnapshot.queueNodes?.has(node.id)) {
              color = '#F59E0B';
              radius = 8;
            } else if (currentSnapshot.visitedNodes?.has(node.id)) {
              color = '#6B7280';
              radius = 5;
            } else if (currentSnapshot.finalPath?.includes(node.id)) {
              color = '#84cc16';
              radius = 8;
              fillOpacity = 1;
            }
          }

          return (
            <CircleMarker
              key={node.id}
              center={[node.coordinates.lat, node.coordinates.lng]}
              pathOptions={{
                fillColor: color,
                color: inverted ? '#fff' : '#000',
                weight: weight,
                opacity: 1,
                fillOpacity: fillOpacity
              }}
              radius={radius}
              eventHandlers={{
                click: () => onNodeClick(node.id)
              }}
            >
              <Popup>
                <div className="font-bold">{node.name}</div>
                <div className="text-xs text-gray-500 uppercase tracking-tighter">{node.type}</div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {!startNodeId && (
        <div className="absolute inset-0 z-[1000] pointer-events-none flex flex-col items-center justify-center bg-black/[0.05] backdrop-blur-[1px]">
          <div className="bg-[#111110] text-[#CAFF3C] px-6 py-2 rounded-full font-black text-[10px] tracking-[0.3em] shadow-2xl animate-bounce border border-white/10">
            SELECT ORIGIN TERMINAL
          </div>
        </div>
      )}
    </div>
  );
};

export default RealWorldMap;
