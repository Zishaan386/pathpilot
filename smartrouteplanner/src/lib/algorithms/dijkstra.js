/**
 * Dijkstra's Algorithm Implementation
 * Returns an array of snapshots for visualization.
 */

export const runDijkstra = (graphService, startId, endId, preference) => {
  const nodes = graphService.graph.nodes;
  const dist = new Map();
  const prev = new Map();
  const visited = new Set();
  const queue = new Set();
  const snapshots = [];
  
  // Initialize
  nodes.forEach((node, id) => {
    dist.set(id, Infinity);
    prev.set(id, null);
  });
  dist.set(startId, 0);
  queue.add(startId);

  let step = 0;
  let pathFound = false;

  const recordSnapshot = (currentNode, explanation) => {
    // Calculate physical distance from prev chain
    let realDist = 0;
    let curr = currentNode;
    while (curr && prev.get(curr)) {
      const p = prev.get(curr);
      const neighbors = graphService.getNeighbors(p);
      const edge = neighbors.find(n => n.node.id === curr)?.edge;
      if (edge) realDist += edge.distance;
      curr = p;
    }

    snapshots.push({
      step: step++,
      visitedNodes: new Set(visited),
      queueNodes: new Set(queue),
      currentNode,
      finalPath: null,
      metrics: {
        nodesExplored: visited.size,
        queueSize: queue.size,
        currentCost: dist.get(currentNode) || 0,
        realDistance: realDist,
        pathFound: false
      },
      explanation
    });
  };

  while (queue.size > 0) {
    // 1. Find node with minimum distance in queue
    let minNodeId = null;
    let minDistance = Infinity;
    queue.forEach(id => {
      if (dist.get(id) < minDistance) {
        minDistance = dist.get(id);
        minNodeId = id;
      }
    });

    if (!minNodeId || minDistance === Infinity) break;

    const current = minNodeId;
    const currentNode = nodes.get(current);
    
    queue.delete(current);
    visited.add(current);

    recordSnapshot(current, `Visiting ${currentNode.name}. Current known shortest distance: ${minDistance.toFixed(2)}km.`);

    if (current === endId) {
      pathFound = true;
      break;
    }

    // 2. Explore neighbors
    const neighbors = graphService.getNeighbors(current);
    neighbors.forEach(({ node: neighbor, edge }) => {
      if (visited.has(neighbor.id)) return;

      const weight = graphService.getEdgeWeight(edge, preference);
      const alt = dist.get(current) + weight;

      if (alt < dist.get(neighbor.id)) {
        dist.set(neighbor.id, alt);
        prev.set(neighbor.id, current);
        queue.add(neighbor.id);
      }
    });
  }

  // Final Path Reconstruction
  let finalPath = null;
  if (pathFound) {
    finalPath = [];
    let curr = endId;
    while (curr) {
      finalPath.unshift(curr);
      curr = prev.get(curr);
    }
  }

  // Calculate final real distance
  let finalRealDistance = 0;
  if (pathFound) {
    for (let i = 0; i < finalPath.length - 1; i++) {
      const u = finalPath[i];
      const v = finalPath[i+1];
      const neighbors = graphService.getNeighbors(u);
      const edge = neighbors.find(n => n.node.id === v)?.edge;
      if (edge) finalRealDistance += edge.distance;
    }
  }

  // Record final snapshot
  snapshots.push({
    step: step++,
    visitedNodes: new Set(visited),
    queueNodes: new Set(queue),
    currentNode: pathFound ? endId : null,
    finalPath,
    metrics: {
      nodesExplored: visited.size,
      queueSize: queue.size,
      currentCost: pathFound ? dist.get(endId) : 0,
      realDistance: finalRealDistance,
      pathFound,
      efficiency: pathFound ? (finalPath.length / visited.size) * 100 : 0
    },
    explanation: pathFound 
      ? `Path found! Total distance: ${finalRealDistance.toFixed(2)}km.` 
      : "No path exists between the selected locations."
  });

  return snapshots;
};
