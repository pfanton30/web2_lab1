const express = require('express');
const router = express.Router();
const Ticket = require('../models/TicketModel');
const Cycle = require('../models/CycleModel');
const QRCode = require('qrcode');
const db = require('../db');

router.post('/new-round', async (req, res) => {
    try {
        const openCycle = await Cycle.findOpenCycle();
        if (openCycle) return res.sendStatus(204);

        await db.query('INSERT INTO cycle (is_open) VALUES (TRUE)');
        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.post('/close', async (req, res) => {
    try {
        const openCycle = await Cycle.findOpenCycle();
        if (!openCycle) return res.sendStatus(204);

        await Cycle.closeCycle(openCycle.id);
        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.post('/store-results', async (req, res) => {
    try {
        const { numbers } = req.body;
        if (!numbers || !Array.isArray(numbers)) return res.status(400).send('Invalid numbers');

        const lastCycle = await Cycle.findLastCycle();
        if (!lastCycle) return res.status(400).send('No cycle found');

        if (lastCycle.is_open || lastCycle.drawn_numbers) {
            return res.status(400).send('Cannot store results for active or already drawn cycle');
        }

        await db.query('UPDATE cycle SET drawn_numbers = $1 WHERE id = $2', [numbers, lastCycle.id]);
        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.post('/tickets', async (req, res) => {
    try {
        const { player_id, chosen_numbers } = req.body;

        if (!player_id || player_id.length > 20) return res.status(400).send('Invalid player ID');
        const numbersArray = chosen_numbers.split(',').map(n => parseInt(n.trim(), 10));
        if (numbersArray.length < 6 || numbersArray.length > 10) return res.status(400).send('Invalid number count');
        if (numbersArray.some(n => n < 1 || n > 45)) return res.status(400).send('Numbers out of range');
        if (new Set(numbersArray).size !== numbersArray.length) return res.status(400).send('Duplicate numbers');

        const openCycle = await Cycle.findOpenCycle();
        if (!openCycle) return res.status(400).send('No active cycle');

        const ticket = new Ticket();
        await ticket.createTicket(openCycle.id, player_id, numbersArray);

        const url = `${req.protocol}://${req.get('host')}/ticket/${ticket.id}`;
        const qrImage = await QRCode.toDataURL(url);

        res.render('ticket-confirmation', { qrImage, qrUrl: url });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.get('/ticket/:id', async (req, res) => {
    try {
        const ticketModel = new Ticket();
        const results = await ticketModel.findTicketById(req.params.id);

        if (!results || results.length === 0) return res.status(404).send('Ticket not found');

        const t = results[0];
        const cycle = await Cycle.findCycleById(t.cycle_id);

        let matches = 0;
        if (cycle.drawn_numbers) {
            matches = t.chosen_numbers.filter(n => cycle.drawn_numbers.includes(n)).length;
        }

        res.render('ticket-details', {
            ticket: t,
            round: cycle,
            matches
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;

