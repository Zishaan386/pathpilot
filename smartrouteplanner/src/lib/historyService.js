/**
 * History Service
 * Manages persistent storage of route history using localStorage.
 */

const HISTORY_KEY = 'smartroute_history';
const MAX_HISTORY_ENTRIES = 10;

export const historyService = {
  /**
   * Saves a route to history.
   * @param {Object} routeData - { startNode, endNode, algorithm, metrics, timestamp }
   */
  saveRoute(routeData) {
    try {
      const history = this.getHistory();
      
      // Prevent duplicates if the last entry is the same
      if (history.length > 0) {
        const last = history[0];
        if (last.startNode.id === routeData.startNode.id && 
            last.endNode.id === routeData.endNode.id && 
            last.algorithm === routeData.algorithm) {
          return;
        }
      }

      const newEntry = {
        ...routeData,
        id: Date.now(),
        timestamp: new Date().toISOString()
      };

      const updatedHistory = [newEntry, ...history].slice(0, MAX_HISTORY_ENTRIES);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (e) {
      console.error('Failed to save route history', e);
    }
  },

  /**
   * Retrieves history from localStorage.
   * @returns {Array}
   */
  getHistory() {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load route history', e);
      return [];
    }
  },

  /**
   * Clears all history.
   */
  clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
  }
};
