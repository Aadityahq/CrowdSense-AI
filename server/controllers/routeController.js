const routeService = require('../services/routeService');

function getRoutes(req, res) {
  res.json(routeService.getRouteRecommendations());
}

module.exports = { getRoutes };
