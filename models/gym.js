const mongoose = require('mongoose');

const gymSchema = mongoose.Schema({
  brand: {
    type: String,
    required: true,
    unique: false
  },
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  post_code: {
    type: String,
    required: true
  },
  confirmed: {
    type: Boolean,
    default: false
  }
});

const Gym = mongoose.model('gyms', gymSchema);

module.exports = Gym;
