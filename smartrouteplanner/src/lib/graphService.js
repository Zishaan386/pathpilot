/**
 * SmartRoutePlanner Graph Service
 * Handles graph operations, edge weights, and heuristics.
 */

export class GraphService {
  constructor(graph) {
    this.graph = graph;
  }

  /**
   * Returns all reachable neighbors for a given node.
   * @param {string} nodeId 
   * @returns {Array<{node: Node, edge: Edge}>}
   */
  getNeighbors(nodeId) {
    const edgeIds = this.graph.adjacency.get(nodeId);
    if (!edgeIds) return [];

    const neighbors = [];
    edgeIds.forEach(edgeId => {
      const edge = this.graph.edges.get(edgeId);
      if (edge && !edge.blocked) {
        const neighborNode = this.graph.nodes.get(edge.to);
        if (neighborNode) {
          neighbors.push({ node: neighborNode, edge });
        }
      }
    });

    return neighbors;
  }

  /**
   * Computes edge weight based on user preferences.
   * @param {Edge} edge 
   * @param {Object} preference - { distancePriority, timePriority } (0-100)
   * @returns {number}
   */
  getEdgeWeight(edge, preference = { distancePriority: 50, timePriority: 50 }) {
    // Normalize priorities to sum to 1.0
    const dWeight = preference.distancePriority / 100;
    const tWeight = preference.timePriority / 100;

    // Use a heuristic scaling factor if units are wildly different
    // Here we use km and minutes, which are somewhat comparable
    return (edge.distance * dWeight) + (edge.currentTime * tWeight);
  }

  /**
   * Geographic distance heuristic (Haversine) for A* and Greedy search.
   * @param {string} nodeId 
   * @param {string} goalId 
   * @returns {number}
   */
  getHeuristic(nodeId, goalId) {
    const node = this.graph.nodes.get(nodeId);
    const goal = this.graph.nodes.get(goalId);
    if (!node || !goal) return 0;

    const lat1 = node.coordinates.lat;
    const lon1 = node.coordinates.lng;
    const lat2 = goal.coordinates.lat;
    const lon2 = goal.coordinates.lng;

    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    return distance; // Return km
  }

  updateTraffic(edgeId, multiplier) {
    const edge = this.graph.edges.get(edgeId);
    if (edge) {
      edge.trafficMultiplier = multiplier;
      edge.currentTime = edge.baseTime * multiplier;
      
      // Also update the reverse edge if it exists
      const revEdge = this.graph.edges.get(`${edgeId}_rev`);
      if (revEdge) {
        revEdge.trafficMultiplier = multiplier;
        revEdge.currentTime = revEdge.baseTime * multiplier;
      }
    }
  }

  blockEdge(edgeId) {
    const edge = this.graph.edges.get(edgeId);
    if (edge) {
      edge.blocked = true;
      const revEdge = this.graph.edges.get(`${edgeId}_rev`);
      if (revEdge) revEdge.blocked = true;
    }
  }

  resetEdge(edgeId) {
    const edge = this.graph.edges.get(edgeId);
    if (edge) {
      edge.blocked = false;
      edge.trafficMultiplier = 1.0;
      edge.currentTime = edge.baseTime;
      
      const revEdge = this.graph.edges.get(`${edgeId}_rev`);
      if (revEdge) {
        revEdge.blocked = false;
        revEdge.trafficMultiplier = 1.0;
        revEdge.currentTime = revEdge.baseTime;
      }
    }
  }

  resetAll() {
    this.graph.edges.forEach(edge => {
      edge.blocked = false;
      edge.trafficMultiplier = 1.0;
      edge.currentTime = edge.baseTime;
    });
  }
}
