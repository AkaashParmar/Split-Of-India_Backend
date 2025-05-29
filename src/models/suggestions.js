const mongoose = require('mongoose');

const productSuggestionSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  categoryName: { type: String, required: true },
  productDescription: { type: String, required: true },
  images: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('ProductSuggestion', productSuggestionSchema);
