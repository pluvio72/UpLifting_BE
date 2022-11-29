const mongoose = require('mongoose');

const Gym = require('../gym');
const data = require('../data/gyms');

mongoose.connect('mongodb://localhost/socfit').then(async () => {
  for (let i = 0; i < data.length; i += 1) {
    const newGym = new Gym({
      brand: data[i].brand,
      name: data[i].name,
      address: data[i].address,
      post_code: data[i].post_code,
      confirmed: true
    });
    await newGym.save();
  }
});