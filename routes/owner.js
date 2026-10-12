const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');

// Owner Registration / Service Submission
router.post('/add', async (req, res) => {
  try {
    const { shopName, ownerName, item, area, address, price, unit } = req.body;

    if (!shopName || !item || price === undefined) {
      return res.status(400).json({ error: 'Shop Name, Item, and Price are required.' });
    }

    // Owner provides genuine price.
    // The pre-save hook on the Shop model will automatically calculate:
    // max_price = Math.ceil(price * 1.5)
    // Any manually supplied max_price or status from req.body is ignored.
    const newShop = new Shop({
      shopName,
      ownerName: ownerName || 'Shop Owner',
      item,
      area: area || 'Kumbh Mela',
      address: address || 'Mela Ground',
      price: Number(price),
      unit: unit || 'per piece',
      status: 'Pending' // Always remains Pending until Admin verification
    });

    await newShop.save();

    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(201).json({ success: true, shop: newShop });
    }

    res.redirect('/owner/dashboard');
  } catch (err) {
    console.error('Owner Add Shop Error:', err);
    res.status(500).json({ error: 'Failed to submit service.' });
  }
});

module.exports = router;
