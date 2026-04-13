function calculateRoute(nodes, crowdMap) {
  if (!Array.isArray(nodes) || nodes.length === 0) {
    return [];
  }

  return nodes
    .map((node) => ({
      node,
      cost: (crowdMap[node] || 0) + Math.floor(Math.random() * 10),
    }))
    .sort((a, b) => a.cost - b.cost)
    .slice(0, 4)
    .map((entry) => entry.node);
}

module.exports = { calculateRoute };
