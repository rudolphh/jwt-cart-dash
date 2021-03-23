const express = require('express');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv').config();
const user = require('../models/user');
const jwt = require('jsonwebtoken');

const LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('../local_store');

const router = express.Router();
router.use(express.urlencoded({ extended: false }));
router.use(express.json());

router.post('/register', (req, res) => {

    let hashedPass = bcrypt.hashSync(req.body.password, 8);

    user.create({
        username: req.body.username,
        password: hashedPass,
    }, (err, user) => {
        if(err) res.status(500).send("Error registering the user");

        let token = jwt.sign({ id: user._id }, process.env.SECRET, {
            expiresIn: 86400 // expires in 24 hours
        });

        res.status(200).send({ auth: true, token: token });
    });
});





module.exports = router;