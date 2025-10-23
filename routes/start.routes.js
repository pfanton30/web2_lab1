const express = require('express');
const router = express.Router();

router.get('/', async function (req, res, next) {
    res.render('start', {
        title: 'Main page'
    });
});

module.exports = router;