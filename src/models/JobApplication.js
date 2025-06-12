const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  mobile: String,
  currentCTC: String,
  expectedCTC: String,
  noticePeriod: String,
  resume: String, // path to file
  linkedinProfile: String,
  appliedAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
