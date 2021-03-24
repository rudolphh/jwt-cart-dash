const dotenv = require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('./local_store');


/// db and models setup
const dbHost = process.env.DB_HOST, dbName = process.env.DB_NAME,
    dbUser = process.env.DB_USER, dbPass = process.env.DB_PASS;

const db = mongoose.connect(dbHost + '/' + dbName, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    user: dbUser,
    pass: dbPass
});

const User = require('./models/user');
const Product = require('./models/product');

/// app setup
const app = express();
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const userController = require('./controllers/userController');
app.use('/user', userController);

const authController = require('./controllers/authController');
app.use('/api/auth', authController);


// authenticate middleware function

const accessTokenSecret = process.env.SECRET;

const authenticateJWT = (req, res, next) => {
    const token = req.headers['x-access-token'] || localStorage.getItem('authToken');

    if (token) {

        jwt.verify(token, accessTokenSecret, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            User.findOne({ _id: user.id }, (err, user) => {
                if(err) return res.status(500).send('There was a problem searching for the user');
                if(!user) req.user = null;
                req.user = user;
                
                next();
            });
            
        });
    } else {
        req.user = null;
        next();
    }
};

app.use(authenticateJWT);

///////// get routes

app.get('/', (req, res) => { 

    let isAdmin = false
    if(req.user){
        if(req.user.role == 'admin')
            isAdmin = true;
    }

    console.log(req.user);

    Product.find({}, (err, products) => {
        if(err) console.log(err);

        res.render('index.ejs', {
            user: req.user,
            addProdForm: isAdmin,
            products: products
        });
    });

});

app.get('/login', (req, res) => { 
    
    if(req.user) return res.redirect('/');

    res.render('index.ejs', {
        loginForm: true
    });
});


app.get('/register', (req, res) => { 

    let isAdmin = false;

    // if we have an authenticated user entering here
    if(req.user){
        if(req.user.role == 'admin')// if admin they can register some more users
            isAdmin = true; 
        else 
            return res.redirect('/');// normal users cannot register again
    }

    res.render('index.ejs', {
        registerForm: true,
        registerAction: isAdmin ? '/api/auth/register' : '/user/register'
    });
});


app.get('/users', (req, res) => {

    if(!req.user || (req.user.role != 'admin'))
        return res.redirect('/');

    User.find({}, (err, users) => {
        if(err) console.log(err);

        res.render('index.ejs', {
            user: req.user,
            addUserForm: true,
            registerAction: '/addUser',
            users: users
        });
    });

});

///////// post routes

app.post('/login', (req, res) => { 

    if(req.user) res.redirect('/');

    User.findOne({ username: req.body.username }, (err, user) => {
        if(err) return res.status(500).send('There was a problem searching for the user');

        if(!user){
            res.render('index.ejs', {
                loginForm: true,
                message: 'Invalid username'
            });

        } else {

            const passIsValid = bcrypt.compareSync(req.body.password, user.password);

            if(!passIsValid)
                return res.status(401).send({ auth: false, token: null });

            // password is valid sign json web token (jwt)
            let token = jwt.sign({ id: user.id }, process.env.SECRET, { expiresIn: 86400 });

            // set the token in local storage
            let localStorage = new LocalStorage('./local_store');
            localStorage.setItem('authToken', token);

            res.redirect('/');
        } 

    });
});


app.post('/addProduct', (req, res) => {

    if(!req.user || (req.user.role != 'admin'))
        return res.redirect('/');

    Product.create(req.body, (err, product) => {
        if(err) res.status(500).send("Error in adding product");

        res.redirect('/');
    })
});

app.post('/addUser', (req, res) => {

    if(!req.user || (req.user.role != 'admin')){
        return res.redirect('/');
    }

    req.body.password = bcrypt.hashSync(req.body.password, 8);
    User.create(req.body, (err, product) => {
        if(err) res.status(500).send("Error in adding user");

        res.redirect('/users');
    })
});



app.post('/logout', (req, res) => {
    localStorage.removeItem('authToken');
    return res.redirect('/');
});








////////  Server
const port = 3000;
app.listen(port, (err) => {
    if(err) console.log(err);
    console.log(`listening on port ${port}`);
});