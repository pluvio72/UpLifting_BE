const mongoose = require('mongoose');

const User = require('./user');
var Gym = require('./gym');

mongoose.connect(process.env.DB_URI).then(res => {
  console.log('Mongo DB Connected...');
});

mongoose.connection.on('error', (err) => {
  console.warn('Error connecting to mongodb: ', err);
});

module.exports = {
  User,
  Gym,
}