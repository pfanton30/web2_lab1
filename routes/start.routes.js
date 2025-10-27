const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const Cycle = require('../models/Cycle');

router.get('/', async (req, res) => {
    try {
        const lastCycle = await Cycle.findLastCycle();

        let ticketCount = null;
        let drawnNumbers = null;
        let active = false;

        if (lastCycle) {
            active = lastCycle.is_open;
            drawnNumbers = lastCycle.drawn_numbers;

            const countRes = await db.query(
                'SELECT COUNT(*) FROM ticket WHERE cycle_id = $1',
                [lastCycle.id]
            );
            ticketCount = countRes.rows[0].count;
        }

        // todo: integriraj Auth0
        const user = req.session.user || null;

        res.render('index', {
            user,
            active,
            ticketCount,
            drawnNumbers
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.get('/submitloto', async (req, res) => {
    try {
        const openCycle = await Cycle.findOpenCycle();
        if (!openCycle) return res.send('Uplate trenutno nisu aktivne.');

        res.render('submitloto');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
