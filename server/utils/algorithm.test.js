const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateRoute } = require('./algorithm');

test('calculateRoute sorts by crowd cost and caps to four nodes', () => {
  const nodes = ['A1', 'A2', 'B1', 'B2', 'C1'];
  const crowdMap = {
    A1: 40,
    A2: 10,
    B1: 90,
    B2: 20,
    C1: 5,
  };

  const result = calculateRoute(nodes, crowdMap);

  assert.deepEqual(result, ['C1', 'A2', 'B2', 'A1']);
});

test('calculateRoute handles empty input', () => {
  assert.deepEqual(calculateRoute([], {}), []);
});