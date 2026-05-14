/**
 * Binary Search on Route Options
 * This demonstrates binary search by picking the best route from a sorted list of candidates.
 */

export const runBinarySearch = (graphService, startId, endId, preference, budget = 500) => {
  const nodes = graphService.graph.nodes;
  
  // 1. Generate candidate routes (Simple DFS for demo purposes)
  const candidates = [];
  const findPaths = (current, target, path, visited, depth) => {
    if (candidates.length >= 16 || depth > 10) return;
    if (current === target) {
      const fullPath = [...path, current];
      let dist = 0;
      let time = 0;
      for (let i = 0; i < fullPath.length - 1; i++) {
        const neighbors = graphService.getNeighbors(fullPath[i]);
        const edge = neighbors.find(n => n.node.id === fullPath[i+1])?.edge;
        if (edge) {
          dist += edge.distance;
          time += edge.currentTime;
        }
      }
      candidates.push({ 
        path: fullPath, 
        distance: dist, 
        time: time, 
        cost: (dist * (preference.distancePriority/100)) + (time * (preference.timePriority/100)) 
      });
      return;
    }

    visited.add(current);
    const neighbors = graphService.getNeighbors(current);
    for (const { node: next } of neighbors) {
      if (!visited.has(next.id)) {
        findPaths(next.id, target, [...path, current], new Set(visited), depth + 1);
      }
    }
  };

  findPaths(startId, endId, [], new Set(), 0);
  
  // Sort candidates by cost
  candidates.sort((a, b) => a.cost - b.cost);

  const snapshots = [];
  let lo = 0, hi = candidates.length - 1;
  let step = 0;
  let best = null;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const checking = candidates[mid];
    
    snapshots.push({
      step: step++,
      visitedNodes: new Set(),
      queueNodes: new Set(),
      currentNode: null,
      finalPath: null,
      binarySearchData: {
        candidates,
        lo,
        hi,
        mid,
        checking
      },
      metrics: {
        nodesExplored: step,
        queueSize: hi - lo + 1,
        currentCost: checking.cost,
        realDistance: checking.distance,
        pathFound: false
      },
      explanation: `Checking candidate ${mid + 1} of ${candidates.length}. Cost: ${checking.cost.toFixed(2)}. Budget: ${budget}.`
    });

    if (checking.cost <= budget) {
      best = checking;
      hi = mid - 1; // Try to find even better
    } else {
      lo = mid + 1;
    }
  }

  // Record final snapshot
  snapshots.push({
    step: step++,
    visitedNodes: new Set(),
    queueNodes: new Set(),
    currentNode: null,
    finalPath: best ? best.path : null,
    binarySearchData: { candidates, lo, hi, best },
    metrics: {
      nodesExplored: step,
      queueSize: 0,
      currentCost: best ? best.cost : 0,
      realDistance: best ? best.distance : 0,
      pathFound: !!best
    },
    explanation: best 
      ? `Found optimal route within budget through binary search!` 
      : "No candidate routes match your budget preferences."
  });

  return snapshots;
};
