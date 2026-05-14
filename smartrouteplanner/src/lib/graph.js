/**
 * SmartRoutePlanner Graph Data Structures
 */

/**
 * @typedef {Object} Coordinates
 * @property {number} lat - Latitude
 * @property {number} lng - Longitude
 */

/**
 * @typedef {Object} Node
 * @property {string} id - Unique identifier
 * @property {string} name - Human-readable name
 * @property {Coordinates} coordinates - Geo-coordinates
 * @property {string} type - 'residential' | 'commercial' | 'landmark' | 'transit'
 * @property {number} x - Projected X coordinate (pixels)
 * @property {number} y - Projected Y coordinate (pixels)
 */

/**
 * @typedef {Object} Edge
 * @property {string} id - Unique identifier
 * @property {string} from - Source node ID
 * @property {string} to - Destination node ID
 * @property {number} distance - Distance in km
 * @property {number} baseTime - Base travel time in minutes
 * @property {string} roadType - 'highway' | 'main_road' | 'local_street'
 * @property {boolean} tollRoad - Is it a toll road?
 * @property {number} currentTime - Current travel time with traffic (minutes)
 * @property {number} trafficMultiplier - Current congestion factor (1.0 to 3.5)
 * @property {boolean} blocked - Is the road currently closed?
 */

export class Graph {
  constructor() {
    this.nodes = new Map(); // id -> Node
    this.edges = new Map(); // id -> Edge
    this.adjacency = new Map(); // id -> Set<edgeId>
  }

  addNode(node) {
    this.nodes.set(node.id, node);
    if (!this.adjacency.has(node.id)) {
      this.adjacency.set(node.id, new Set());
    }
  }

  addEdge(edge) {
    this.edges.set(edge.id, edge);
    this.adjacency.get(edge.from).add(edge.id);
    
    // For undirected graph representation, we'd add the reverse edge too,
    // but the spec suggests edges are stored as they are. 
    // The loader will handle adding reverse edges for two-way roads.
  }
}
