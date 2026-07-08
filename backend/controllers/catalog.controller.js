const Catalog = require('../models/catalog.model');

exports.getCatalog = async (req, res) => {
  try {
    const { limit, priceMin } = req.query;
    
    if (limit !== undefined) {
      const parsedLimit = Number(limit);
      if (isNaN(parsedLimit) || parsedLimit < 0) {
        return res.status(400).json({ error: 'Invalid limit parameter' });
      }
    }
    
    if (priceMin !== undefined) {
      const parsedPrice = Number(priceMin);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ error: 'Invalid priceMin parameter' });
      }
    }

    const filter = {};
    if (priceMin !== undefined) {
      filter.price = { $gte: Number(priceMin) };
    }

    let query = Catalog.find(filter).sort({ id: 1 });
    if (limit !== undefined) {
      query = query.limit(Number(limit));
    }

    const items = await query;
    return res.status(200).json(items);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
