const express = require('express');
const router = express.Router();

// Placeholder for services route
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Services route' });
});

module.exports = router;
