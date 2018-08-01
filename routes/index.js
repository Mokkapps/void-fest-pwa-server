const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
  res.send('Void Fest PWA backend is alive!');
});

module.exports = router;
