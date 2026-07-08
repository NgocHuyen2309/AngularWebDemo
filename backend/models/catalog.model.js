const mongoose = require('mongoose');

const CatalogSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  imageUrl: { type: String }
});

module.exports = mongoose.model('Catalog', CatalogSchema);
