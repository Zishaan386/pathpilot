/**
 * Greedy Best-First Search Algorithm Implementation
 * Returns an array of snapshots for visualization.
 */

export const runGreedy = (graphService, startId, endId, preference) => {
  const nodes = graphService.graph.nodes;
  const prev = new Map();
  const visited = new Set();
  const queue = new Set();
  const snapshots = [];
  
  queue.add(startId);

  let step = 0;
  let pathFound = false;

  const recordSnapshot = (currentNode, explanation) => {
    // Calculate current metrics from prev chain
    let realDist = 0;
    let cost = 0;
    let curr = currentNode;
    while (curr && prev.get(curr)) {
      const p = prev.get(curr);
      const neighbors = graphService.getNeighbors(p);
      const edge = neighbors.find(n => n.node.id === curr)?.edge;
      if (edge) {
        realDist += edge.distance;
        cost += graphService.getEdgeWeight(edge, preference);
      }
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
        currentCost: cost,
        realDistance: realDist,
        pathFound: false
      },
      explanation
    });
  };

  while (queue.size > 0) {
    // Find node with minimum heuristic (hScore)
    let current = null;
    let minH = Infinity;
    queue.forEach(id => {
      const h = graphService.getHeuristic(id, endId);
      if (h < minH) {
        minH = h;
        current = id;
      }
    });

    if (!current || minH === Infinity) break;

    const currentNode = nodes.get(current);
    
    if (current === endId) {
      pathFound = true;
      recordSnapshot(current, `Greedily reached destination: ${currentNode.name}!`);
      break;
    }

    queue.delete(current);
    visited.add(current);

    recordSnapshot(current, `Greedily moving to ${currentNode.name} (closest to goal by straight line).`);

    const neighbors = graphService.getNeighbors(current);
    neighbors.forEach(({ node: neighbor, edge }) => {
      if (!visited.has(neighbor.id) && !queue.has(neighbor.id)) {
        prev.set(neighbor.id, current);
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

  // Calculate final metrics
  let finalRealDist = 0;
  let finalCost = 0;
  if (pathFound) {
    for (let i = 0; i < finalPath.length - 1; i++) {
      const u = finalPath[i];
      const v = finalPath[i+1];
      const neighbors = graphService.getNeighbors(u);
      const edge = neighbors.find(n => n.node.id === v)?.edge;
      if (edge) {
        finalRealDist += edge.distance;
        finalCost += graphService.getEdgeWeight(edge, preference);
      }
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
      currentCost: finalCost,
      realDistance: finalRealDist,
      pathFound,
      efficiency: pathFound ? (finalPath.length / visited.size) * 100 : 0
    },
    explanation: pathFound 
      ? `Greedy search completed quickly, but path might not be optimal.` 
      : "No path exists."
  });

  return snapshots;
};
