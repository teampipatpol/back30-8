const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: String,
  stock: Number,
  details: String,
  price:Number,
  image: String 

});

module.exports = mongoose.model('Product', productSchema);
