import { runDijkstra } from './algorithms/dijkstra';
import { runAStar } from './algorithms/astar';
import { runGreedy } from './algorithms/greedy';
import { runBinarySearch } from './algorithms/binarySearch';

export const ALGORITHMS = {
  dijkstra: {
    name: "Dijkstra's Algorithm",
    description: "Guaranteed to find the shortest path by exploring all possible directions uniformly.",
    run: runDijkstra
  },
  astar: {
    name: "A* Heuristic Search",
    description: "Combines distance from start with estimated distance to goal to find the optimal path efficiently.",
    run: runAStar
  },
  greedy: {
    name: "Greedy Best-First",
    description: "Always moves toward the goal based on straight-line distance. Fast but not always optimal.",
    run: runGreedy
  },
  binary: {
    name: "Binary Search",
    description: "Quickly selects the best pre-calculated route from a sorted list based on your budget.",
    run: runBinarySearch
  }
};

export class AlgorithmRunner {
  constructor(graphService) {
    this.graphService = graphService;
  }

  calculate(algorithmKey, startId, endId, preference) {
    const algo = ALGORITHMS[algorithmKey];
    if (!algo) return null;
    return algo.run(this.graphService, startId, endId, preference);
  }
}
