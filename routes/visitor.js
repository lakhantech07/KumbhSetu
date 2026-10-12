const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');
const ItemBST = require('../utils/BST');

// Visitor Item Search Route
router.get('/search', async (req, res) => {
  try {
    const query = req.query.item || req.query.q || '';

    // 1. Fetch only verified shops from MongoDB
    const verifiedShops = await Shop.find({ status: 'Verified' });

    // 2. Build the Binary Search Tree from verified services using item as key
    const bst = new ItemBST();
    verifiedShops.forEach(shop => bst.insert(shop));

    // 3. Search the BST and sort results
    let results = [];
    if (query) {
      results = bst.search(query);
    }

    // Check if client expects JSON (API client or frontend fetch)
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({
        success: true,
        query,
        count: results.length,
        results
      });
    }

    // Render EJS visitor view
    res.render('visitor/search', { results, query });
  } catch (err) {
    console.error('Visitor Search Error:', err);
    res.status(500).json({ error: 'Internal Server Error while searching items.' });
  }
});

module.exports = router;
