const dotenv = require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const LocalStorage = require('node-localstorage').LocalStorage;
const user = require('../models/user');
localStorage = new LocalStorage('../local_store');

const router = express.Router();
router.use(express.urlencoded({ extended: false }));
router.use(express.json());

// middleware for all auth routes
router.use('/', (req, res, next) => {
    let token = req.headers['x-access-token'];
    if(!token) {
        return res.status(401).send({
            auth: false,
            message: 'No token provided' 
        });
    } else { 
        
        jwt.verify(token, process.env.SECRET, (err, decoded) => {
            if(err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token' });
            
            // token is good, check if user is admin type
            User.findById(decoded.id, { password: 0 }, (err, user) => {
                if(err) return res.status(500).send('User not found');
                // user is found
                if(user.type == 'admin'){
                    res.locals.token = token;
                } else {
                    return res.status(401).send({
                        auth: false,
                        message: 'User is not admin'
                    })
                }
            });
        });
    }

    next();
});

router.post('/register', (req, res) => {

    let hashedPass = bcrypt.hashSync(req.body.password, 8);

    User.create({
        username: req.body.username,
        password: hashedPass,
        role: req.body.role
    }, (err, user) => {
        if(err) res.status(500).send("Error registering the user");

        /*
        let token = jwt.sign({ id: user._id }, process.env.SECRET, {
            expiresIn: 86400 // expires in 24 hours
        });

        res.status(200).send({ auth: true, token: token });
        */
       res.redirect('/users');
    });
});





module.exports = router;