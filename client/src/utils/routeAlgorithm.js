export function findBestRoute(graph, start, end, crowdMap = {}) {
  if (!graph[start] || !graph[end]) {
    return { path: [], cost: Number.POSITIVE_INFINITY };
  }

  const distances = {};
  const previous = {};
  const unvisited = new Set(Object.keys(graph));

  for (const node of Object.keys(graph)) {
    distances[node] = Number.POSITIVE_INFINITY;
  }

  distances[start] = 0;

  while (unvisited.size > 0) {
    let currentNode = null;
    let smallestDistance = Number.POSITIVE_INFINITY;

    for (const node of unvisited) {
      if (distances[node] < smallestDistance) {
        smallestDistance = distances[node];
        currentNode = node;
      }
    }

    if (currentNode === null) {
      break;
    }

    unvisited.delete(currentNode);

    if (currentNode === end) {
      break;
    }

    for (const edge of graph[currentNode] || []) {
      // cost = distance + (crowd_density * 0.5)
      const edgeDensity = Number(crowdMap[edge.node]);
      const safeDensity = Number.isFinite(edgeDensity) ? edgeDensity : 0;
      const crowdPenalty = safeDensity * 0.5;
      const weightedCost = edge.distance + crowdPenalty;
      const candidateCost = distances[currentNode] + weightedCost;

      if (candidateCost < distances[edge.node]) {
        distances[edge.node] = candidateCost;
        previous[edge.node] = currentNode;
      }
    }
  }

  if (distances[end] === Number.POSITIVE_INFINITY) {
    return { path: [start, end], cost: Number.POSITIVE_INFINITY };
  }

  const path = [];
  let current = end;

  while (current) {
    path.unshift(current);
    if (current === start) {
      break;
    }

    current = previous[current];
  }

  return { path, cost: Number(distances[end].toFixed(2)) };
}

export function findSafestExit(graph, start, exits = [], crowdMap = {}) {
  let best = { exit: null, path: [], cost: Number.POSITIVE_INFINITY };

  for (const exitNode of exits) {
    const route = findBestRoute(graph, start, exitNode, crowdMap);
    if (route.cost < best.cost) {
      best = { exit: exitNode, path: route.path, cost: route.cost };
    }
  }

  return best;
}

