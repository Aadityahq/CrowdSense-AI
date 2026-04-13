function buildCrowdMap(zones = []) {
  return zones.reduce((accumulator, zone) => {
    accumulator[zone.id] = Math.floor(Math.random() * 100);
    return accumulator;
  }, {});
}

module.exports = { buildCrowdMap };
