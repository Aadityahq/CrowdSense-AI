const mongoose = require('mongoose');

const crowdZoneSchema = new mongoose.Schema(
  {
    zoneId: String,
    density: Number,
    queueMinutes: Number,
  },
  { timestamps: true },
);

module.exports = mongoose.model('CrowdZone', crowdZoneSchema);
