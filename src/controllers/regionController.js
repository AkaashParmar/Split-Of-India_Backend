const Region = require('../models/regionModel');

exports.createRegion = async (req, res) => {
  const region = await Region.create(req.body);
  res.status(201).json(region);
};

exports.getRegions = async (req, res) => {
  const regions = await Region.find();
  res.json(regions);
};
