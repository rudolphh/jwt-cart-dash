let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let product = new Schema({
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    price: { type: String, required: true }
    
}, { timestamps: true });

module.exports = mongoose.model('product', product, 'products');