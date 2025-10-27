const express = require('express');
const app = express();
const path = require('path');
const db = require('./db')
const session = require('express-session')
const pgSession = require('connect-pg-simple')(session)

const startRouter = require('./routes/start.routes');
const lotoRouter = require('./routes/loto.routes');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));

app.use(session({
    store: new pgSession({
        pool: db.pool,
    }),
    secret: "web2zad1",
    resave: false,
    saveUninitialized: true
}))

app.use('/', startRouter);
app.use('/', lotoRouter);

app.listen(3000);