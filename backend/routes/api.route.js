const router = require('express').Router();

router.get('/', async (req, res, next) => {
  res.send({ message: 'API is live' });
});

module.exports = router;
