const express = require('express');
const router = express.Router();
const { verifyClerkWebhook } = require('../middleware/auth.middleware');
const authService = require('../services/auth.service');

// Webhook endpoint for Clerk events
router.post('/webhook', verifyClerkWebhook, async (req, res) => {
  try {
    const { type, data } = req.body;
    
    // Process webhook event
    const result = await authService.processWebhook({ type, data });
    
    if (result.success) {
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process webhook',
      error: error.message
    });
  }
});

module.exports = router;