const State = require("../models/stateModel");

exports.createState = async (req, res) => {
  try {
    const state = await State.create(req.body);
    res.status(201).json(state);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getStatesByRegion = async (req, res) => {
  try {
    const states = await State.find({ region: req.params.regionId });
    res.json(states);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔍 Get a state by slug
exports.getStateBySlug = async (req, res) => {
  try {
    const state = await State.findOne({ slug: req.params.slug });
    if (!state) {
      return res.status(404).json({ success: false, message: "State not found" });
    }
    res.json(state);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
