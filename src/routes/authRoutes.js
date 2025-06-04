const express = require('express');
const passport = require('passport');
const router = express.Router();

// Step 1: Start OAuth Flow
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  accessType: 'offline',
  prompt: 'consent',
}));

// Step 2: Callback from Google after user login
router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: 'http://localhost:5173/login?error=oauth_failed',
  session: true, // you can set to false if using JWT instead
}), (req, res) => {
  // User authenticated successfully
  const user = req.user;

  // Redirect to frontend with user info encoded in query string
  const redirectUrl = `http://localhost:5173/google-success?user=${encodeURIComponent(JSON.stringify({
    id: user._id,
    email: user.email,
    username: user.username,
  }))}`;

  res.redirect(redirectUrl);
});

module.exports = router;
