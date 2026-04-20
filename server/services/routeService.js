const stadiumLayout = require('../shared/stadiumLayout.json');
const { calculateRoute } = require('../utils/algorithm');
const { buildCrowdMap } = require('../utils/helpers');

function getRouteRecommendations() {
  const crowdMap = buildCrowdMap(stadiumLayout.zones);
  const route = calculateRoute(stadiumLayout.zones.map((zone) => zone.id), crowdMap);

  return {
    start: 'C1',
    destination: 'A1',
    route,
  };
}

module.exports = { getRouteRecommendations };
