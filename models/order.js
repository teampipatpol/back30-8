const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  soldAt: {
    type: Date,
    default: Date.now // Set default value to current date and time
  },
  status: { type: String, default: 'completed' } // เพิ่มสถานะ

});

module.exports = mongoose.model('Order', orderSchema);
