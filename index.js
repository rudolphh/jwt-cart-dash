const dotenv = require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

/// db and models setup
const dbHost = process.env.DB_HOST, dbName = process.env.DB_NAME,
    dbUser = process.env.DB_USER, dbPass = process.env.DB_PASS;

const db = mongoose.connect(dbHost + '/' + dbName, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    user: dbUser,
    pass: dbPass
});

const user = require('./models/user');
const product = require('./models/product');

/// app setup
const app = express();
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const userController = require('./controllers/userController');
app.use('/user', userController);

///////// get routes

app.get('/', (req, res) => { 

    res.render('index.ejs', {
        login: false,
        register: false,
        items: [ { _id: 1, product: "milk", qty: 3, price: "2.35"}]
    });
});

app.get('/register', (req, res) => { 

    res.render('index.ejs', {
        login: false,
        register: true
    });
});

app.get('/login', (req, res) => { 

    res.render('index.ejs', {
        login: true
    });
});

///////// post routes

app.post('/register', (req, res) => { 

    user.create(req.body, (err, data) => {
        if(err) res.status(500).send(err);
        else {

        }
    });

    res.render('index.ejs', {
        login: false,
        register: true
    });
});

app.post('/login', (req, res) => { 


    res.render('index.ejs', {
        login: true
    });
});








////////  Server
const port = 3000;
app.listen(port, (err) => {
    if(err) console.log(err);
    console.log(`listening on port ${port}`);
});