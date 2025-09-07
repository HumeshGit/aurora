const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password }); // Use hashed pass in prod
  if (!user) return res.status(401).send('Invalid login');

  req.session.userId = user._id;
  await User.findByIdAndUpdate(user._id, { online: true });
  res.redirect('/');
});

router.get('/logout', async (req, res) => {
  if (req.session.userId) {
    await User.findByIdAndUpdate(req.session.userId, { online: false });
    req.session.destroy();
  }
  res.redirect('/login');
});

module.exports = router;
