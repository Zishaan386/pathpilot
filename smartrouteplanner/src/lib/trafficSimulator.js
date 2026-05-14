/**
 * Traffic Simulator Utility
 * Randomizes edge weights and blockages across the graph.
 */

export class TrafficSimulator {
  constructor(graphService) {
    this.graphService = graphService;
  }

  /**
   * Randomly assigns traffic multipliers to a percentage of edges.
   * @param {number} density - 0.0 to 1.0 (percentage of edges to affect)
   */
  simulate(density = 0.4) {
    const edges = Array.from(this.graphService.graph.edges.values());
    
    // First, reset all to 1.0
    edges.forEach(e => {
      if (!e.id.endsWith('_rev')) {
        this.graphService.updateTraffic(e.id, 1.0);
      }
    });

    // Pick random edges to affect
    const count = Math.floor(edges.length * density);
    const shuffled = edges
      .filter(e => !e.id.endsWith('_rev'))
      .sort(() => 0.5 - Math.random());

    const affected = shuffled.slice(0, count);

    affected.forEach(edge => {
      // Choose a multiplier: 1.5, 2.0, 2.5, 3.5
      const levels = [1.5, 2.0, 2.5, 3.5];
      const mult = levels[Math.floor(Math.random() * levels.length)];
      this.graphService.updateTraffic(edge.id, mult);
    });

    // Randomly block a few edges (incident)
    const blockCount = Math.floor(edges.length * 0.05); // 5% chance of closure
    const potentialBlocks = shuffled.slice(count, count + blockCount);
    potentialBlocks.forEach(edge => {
      this.graphService.blockEdge(edge.id);
    });

    return { affected: affected.length, blocked: blockCount };
  }

  reset() {
    const edges = Array.from(this.graphService.graph.edges.values());
    edges.forEach(e => {
      if (!e.id.endsWith('_rev')) {
        this.graphService.resetEdge(e.id);
      }
    });
  }
}
