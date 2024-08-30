const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  status: { type: String, enum: ['approved', 'pending', 'rejected'], default: 'pending' }
  
});

module.exports = mongoose.model('User', userSchema);
