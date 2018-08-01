const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Void Fest PWA backend is alive!' });
});

module.exports = router;
