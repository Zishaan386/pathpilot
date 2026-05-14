import { Graph } from './graph';

/**
 * Projects latitude/longitude to canvas pixel coordinates.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {Object} bounds - {minLat, maxLat, minLng, maxLng}
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} padding - Padding from canvas edges
 * @returns {Object} {x, y}
 */
export const projectCoordinates = (lat, lng, bounds, width, height, padding = 40) => {
  const { minLat, maxLat, minLng, maxLng } = bounds;
  
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  
  // Latitude increases upward, but screen Y increases downward
  const x = padding + ((lng - minLng) / (maxLng - minLng)) * innerWidth;
  const y = padding + ((maxLat - lat) / (maxLat - minLat)) * innerHeight;
  
  return { x, y };
};

/**
 * Loads the city graph from a JSON object and projects coordinates.
 * @param {Object} data - Raw JSON data
 * @param {number} width - Target canvas width
 * @param {number} height - Target canvas height
 * @returns {Graph}
 */
export const loadGraph = (data, width, height) => {
  const graph = new Graph();
  
  // 1. Find bounds
  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
  data.nodes.forEach(n => {
    minLat = Math.min(minLat, n.coordinates.lat);
    maxLat = Math.max(maxLat, n.coordinates.lat);
    minLng = Math.min(minLng, n.coordinates.lng);
    maxLng = Math.max(maxLng, n.coordinates.lng);
  });
  
  const bounds = { minLat, maxLat, minLng, maxLng };
  
  // 2. Add nodes with projection
  data.nodes.forEach(n => {
    const { x, y } = projectCoordinates(n.coordinates.lat, n.coordinates.lng, bounds, width, height);
    graph.addNode({
      ...n,
      x,
      y
    });
  });
  
  // 3. Add edges (making them bidirectional for the demo unless specified otherwise)
  data.edges.forEach(e => {
    const edge = {
      ...e,
      currentTime: e.baseTime,
      trafficMultiplier: 1.0,
      blocked: false
    };
    
    graph.addEdge(edge);
    
    // Add reverse edge for bidirectionality
    const reverseEdge = {
      ...edge,
      id: `${edge.id}_rev`,
      from: edge.to,
      to: edge.from
    };
    graph.addEdge(reverseEdge);
  });
  
  return graph;
};
