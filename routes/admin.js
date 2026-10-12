const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');

// Admin Verification / Rejection
router.post('/verify/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Verified', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be Verified or Rejected.' });
    }

    // Admin can ONLY modify the status field.
    // Price and system-calculated max_price cannot be altered by Admin.
    const updatedShop = await Shop.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedShop) {
      return res.status(404).json({ error: 'Shop not found.' });
    }

    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({ success: true, shop: updatedShop });
    }

    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error('Admin Verify Error:', err);
    res.status(500).json({ error: 'Failed to update verification status.' });
  }
});

module.exports = router;
