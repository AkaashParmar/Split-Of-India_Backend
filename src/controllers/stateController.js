const State = require("../models/stateModel");

exports.createState = async (req, res) => {
  const state = await State.create(req.body);
  res.status(201).json(state);
};

exports.getStatesByRegion = async (req, res) => {
  const states = await State.find({ region: req.params.regionId });
  res.json(states);
};
