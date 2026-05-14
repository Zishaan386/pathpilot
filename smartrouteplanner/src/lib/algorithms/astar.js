/**
 * A* Search Algorithm Implementation
 * Returns an array of snapshots for visualization.
 */

export const runAStar = (graphService, startId, endId, preference) => {
  const nodes = graphService.graph.nodes;
  const gScore = new Map(); // Cost from start to n
  const fScore = new Map(); // Estimated total cost (g + h)
  const prev = new Map();
  const visited = new Set();
  const queue = new Set();
  const snapshots = [];
  
  nodes.forEach((node, id) => {
    gScore.set(id, Infinity);
    fScore.set(id, Infinity);
    prev.set(id, null);
  });

  gScore.set(startId, 0);
  fScore.set(startId, graphService.getHeuristic(startId, endId));
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
        currentCost: gScore.get(currentNode) || 0,
        realDistance: realDist,
        pathFound: false
      },
      explanation
    });
  };

  while (queue.size > 0) {
    // Find node with minimum fScore
    let current = null;
    let minF = Infinity;
    queue.forEach(id => {
      if (fScore.get(id) < minF) {
        minF = fScore.get(id);
        current = id;
      }
    });

    if (!current || minF === Infinity) break;

    const currentNode = nodes.get(current);
    
    if (current === endId) {
      pathFound = true;
      recordSnapshot(current, `Target reached: ${currentNode.name}! Finalizing path.`);
      break;
    }

    queue.delete(current);
    visited.add(current);

    recordSnapshot(current, `Expanding ${currentNode.name}. g(n)=${gScore.get(current).toFixed(2)}, h(n)=${graphService.getHeuristic(current, endId).toFixed(2)}.`);

    const neighbors = graphService.getNeighbors(current);
    neighbors.forEach(({ node: neighbor, edge }) => {
      if (visited.has(neighbor.id)) return;

      const weight = graphService.getEdgeWeight(edge, preference);
      const tentativeGScore = gScore.get(current) + weight;

      if (tentativeGScore < gScore.get(neighbor.id)) {
        prev.set(neighbor.id, current);
        gScore.set(neighbor.id, tentativeGScore);
        fScore.set(neighbor.id, tentativeGScore + graphService.getHeuristic(neighbor.id, endId));
        queue.add(neighbor.id);
      }
    });
  }

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

  snapshots.push({
    step: step++,
    visitedNodes: new Set(visited),
    queueNodes: new Set(queue),
    currentNode: pathFound ? endId : null,
    finalPath,
    metrics: {
      nodesExplored: visited.size,
      queueSize: queue.size,
      currentCost: pathFound ? gScore.get(endId) : 0,
      realDistance: finalRealDistance,
      pathFound,
      efficiency: pathFound ? (finalPath.length / visited.size) * 100 : 0
    },
    explanation: pathFound 
      ? `A* found the optimal path exploring ${visited.size} nodes.` 
      : "No path exists."
  });

  return snapshots;
};
