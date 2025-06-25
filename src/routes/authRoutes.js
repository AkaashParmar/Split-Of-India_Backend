const express = require('express');
const passport = require('passport');
const router = express.Router();

// Step 1: Start OAuth Flow
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  accessType: 'offline',
  prompt: 'consent',
}));

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

// Step 2: Callback from Google after user login
router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: `${frontendUrl}/login?error=oauth_failed`,
  session: true,
}), (req, res) => {
  // User authenticated successfully
  const user = req.user;

  // Redirect to frontend with user info encoded in query string
  const redirectUrl = `${frontendUrl}/google-success?user=${encodeURIComponent(JSON.stringify({
    id: user._id,
    email: user.email,
    username: user.username,
  }))}`;

  res.redirect(redirectUrl);
});

module.exports = router;
