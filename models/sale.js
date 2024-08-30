const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Product schema for embedded products in sales
const ProductSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

// Define the Sale schema
const SaleSchema = new Schema({
  orderNumber: { type: String, required: true, unique: true },
  date: { type: Date, default: Date.now },
  products: [ProductSchema],
  total: { type: Number, required: true }
});

const Sale = mongoose.model('Sale', SaleSchema);

module.exports = Sale;

