function buildCrowdMap(zones = []) {
  return zones.reduce((accumulator, zone) => {
    const baseline = Math.max(5, Math.min(95, Math.round(zone.capacity / 12)));
    accumulator[zone.id] = baseline;
    return accumulator;
  }, {});
}

module.exports = { buildCrowdMap };
