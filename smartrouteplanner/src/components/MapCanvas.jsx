import React, { useRef, useEffect, useState } from 'react';

const MapCanvas = ({ graph, startNodeId, endNodeId, onNodeClick, currentSnapshot, inverted = true }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const observeTarget = containerRef.current;
    const resizeObserver = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height });
      }
    });

    if (observeTarget) resizeObserver.observe(observeTarget);
    return () => resizeObserver.disconnect();
  }, []);

  const getTrafficColor = (multiplier) => {
    if (multiplier <= 1.0) return 'rgba(0, 0, 0, 0.1)';
    if (multiplier <= 1.5) return '#FACC15'; // Moderate - Yellow
    if (multiplier <= 2.5) return '#F97316'; // Heavy - Orange
    return '#EF4444'; // Severe - Red
  };

  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0 || !graph) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Grid (Subtle)
    ctx.strokeStyle = inverted ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < dimensions.width; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, dimensions.height); ctx.stroke();
    }
    for (let y = 0; y < dimensions.height; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(dimensions.width, y); ctx.stroke();
    }

    const getTransform = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const zoomFactor = 0.9;
      const scaleX = (width / 1200) * zoomFactor;
      const scaleY = (height / 1000) * zoomFactor;
      const offsetX = (width * (1 - zoomFactor)) / 2;
      const offsetY = (height * (1 - zoomFactor)) / 2;
      return { scaleX, scaleY, offsetX, offsetY, rect };
    };

    const { scaleX, scaleY, offsetX, offsetY } = getTransform();

    const project = (x, y) => ({
      px: x * scaleX + offsetX,
      py: y * scaleY + offsetY
    });

    // 1. Draw Edges
    graph.edges.forEach(edge => {
      const fromNode = graph.nodes.get(edge.from);
      const toNode = graph.nodes.get(edge.to);
      if (!fromNode || !toNode) return;

      const p1 = project(fromNode.x, fromNode.y);
      const p2 = project(toNode.x, toNode.y);

      const isPath = currentSnapshot?.finalPath?.includes(edge.from) && 
                     currentSnapshot?.finalPath?.includes(edge.to);

      ctx.beginPath();
      ctx.moveTo(p1.px, p1.py);
      ctx.lineTo(p2.px, p2.py);

      if (edge.blocked) {
        ctx.strokeStyle = '#EF4444';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 2;
      } else if (isPath) {
        ctx.strokeStyle = '#CAFF3C'; 
        ctx.setLineDash([]);
        ctx.lineWidth = 5;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#CAFF3C';
      } else {
        ctx.strokeStyle = getTrafficColor(edge.trafficMultiplier);
        ctx.setLineDash([]);
        ctx.lineWidth = edge.trafficMultiplier > 1 ? 2.5 : 1;
        ctx.shadowBlur = 0;
      }

      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
    });

    // 2. Draw Nodes
    graph.nodes.forEach(node => {
      let fillStyle = inverted ? '#111110' : '#3A3A3A'; // Unvisited
      let radius = 5;
      let shadowBlur = 0;
      const { px, py } = project(node.x, node.y);

      if (node.id === startNodeId) {
        fillStyle = '#22C55E';
        radius = 8;
        shadowBlur = 20;
      } else if (node.id === endNodeId) {
        fillStyle = '#EF4444';
        radius = 8;
        shadowBlur = 20;
      } else if (currentSnapshot) {
        if (currentSnapshot.currentNode === node.id) {
          fillStyle = '#FB923C';
          radius = 10;
          shadowBlur = 30;
        } else if (currentSnapshot.queueNodes?.has(node.id)) {
          fillStyle = '#F59E0B';
        } else if (currentSnapshot.visitedNodes?.has(node.id)) {
          fillStyle = '#6B7280';
        } else if (currentSnapshot.finalPath?.includes(node.id)) {
          fillStyle = '#CAFF3C';
          radius = 7;
          shadowBlur = 15;
        }
      }

      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fillStyle = fillStyle;
      if (shadowBlur > 0) {
        ctx.shadowBlur = shadowBlur;
        ctx.shadowColor = fillStyle;
      }
      ctx.fill();
      ctx.shadowBlur = 0;

      if (inverted && fillStyle === '#111110') {
         ctx.strokeStyle = 'rgba(0,0,0,0.1)';
         ctx.lineWidth = 1;
         ctx.stroke();
      }

      if (hoveredNodeId === node.id || node.id === startNodeId || node.id === endNodeId) {
        ctx.fillStyle = '#111110';
        ctx.font = '900 11px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(node.name.toUpperCase(), px, py - 15);
      }
    });

  }, [graph, dimensions, startNodeId, endNodeId, hoveredNodeId, currentSnapshot, inverted]);

  const getTransform = () => {
    if (!canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const zoomFactor = 0.9;
    const scaleX = (width / 1200) * zoomFactor;
    const scaleY = (height / 1000) * zoomFactor;
    const offsetX = (width * (1 - zoomFactor)) / 2;
    const offsetY = (height * (1 - zoomFactor)) / 2;
    return { scaleX, scaleY, offsetX, offsetY, rect };
  };

  const handleMouseMove = (e) => {
    const transform = getTransform();
    if (!graph || !transform) return;
    const { scaleX, scaleY, offsetX, offsetY, rect } = transform;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let found = null;
    graph.nodes.forEach(node => {
      const px = node.x * scaleX + offsetX;
      const py = node.y * scaleY + offsetY;
      const dist = Math.sqrt((px - x)**2 + (py - y)**2);
      if (dist < 15) found = node.id;
    });
    setHoveredNodeId(found);
  };

  const handleClick = (e) => {
    const transform = getTransform();
    if (!graph || !onNodeClick || !transform) return;
    const { scaleX, scaleY, offsetX, offsetY, rect } = transform;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    graph.nodes.forEach(node => {
      const px = node.x * scaleX + offsetX;
      const py = node.y * scaleY + offsetY;
      const dist = Math.sqrt((px - x)**2 + (py - y)**2);
      if (dist < 15) onNodeClick(node.id);
    });
  };

  return (
    <div ref={containerRef} className={`relative w-full h-full overflow-hidden cursor-crosshair ${inverted ? 'bg-white' : 'bg-[#111110]'}`}>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        className="block"
        style={{ width: '100%', height: '100%' }}
      />
      
      {!startNodeId && (
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center bg-black/[0.02] backdrop-blur-[1px]">
          <div className="bg-[#111110] text-[#CAFF3C] px-6 py-2 rounded-full font-black text-[10px] tracking-[0.3em] shadow-2xl animate-bounce border border-white/10">
            SELECT ORIGIN TERMINAL
          </div>
        </div>
      )}
    </div>
  );
};

export default MapCanvas;
