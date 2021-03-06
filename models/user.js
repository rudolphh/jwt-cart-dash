let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let user = new Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    role: {
        type: String,
        required: true,
        enum : ['normal','admin'],
        default: 'normal'
    }
    
}, { timestamps: true });

module.exports = mongoose.model('user', user, 'users');