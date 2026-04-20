import test from 'node:test';
import assert from 'node:assert/strict';
import { findBestRoute, findSafestExit } from './routeAlgorithm.js';

test('findBestRoute prefers the lower crowd path', () => {
  const graph = {
    A: [{ node: 'B', distance: 2 }, { node: 'C', distance: 3 }],
    B: [{ node: 'D', distance: 2 }],
    C: [{ node: 'D', distance: 1 }],
    D: [],
  };

  const crowdMap = { B: 80, C: 0, D: 0 };
  const route = findBestRoute(graph, 'A', 'D', crowdMap);

  assert.deepEqual(route.path, ['A', 'C', 'D']);
  assert.equal(route.cost, 4);
});

test('findSafestExit chooses the cheapest exit', () => {
  const graph = {
    A: [{ node: 'E1', distance: 5 }, { node: 'E2', distance: 2 }],
    E1: [],
    E2: [],
  };

  const safest = findSafestExit(graph, 'A', ['E1', 'E2'], {});

  assert.equal(safest.exit, 'E2');
  assert.deepEqual(safest.path, ['A', 'E2']);
});