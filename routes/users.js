var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var { Gym, User } = require('../models'); 

router.post('/sign-in', async (req, res) => {
  const {
    username,
    password
  } = req.body;

  try {
    const user = await User.findOne({ username });
    if (user) {
      const correctPassword = user.checkPassword(password);
      const newSecretKey = await user.assignNewKey();
      const token = jwt.sign({ email: user.email, user: user.username }, newSecretKey);
      console.log('Sign Up Token Generated:', token);

      if (correctPassword) return res.json({ success: true, token });
      else return res.json({
        success: false,
        message: 'Username or Password is incorrect.'
      });
    } else {
      return res.json({
        success: false,
        message: 'Username or Password is incorrect.'
      });
    }
  } catch(error) {
    console.warn(`Error in POST /users/sign-in, ${error.message}.`);
    return res.json({ success: false, message: 'Error' });
  }
});

router.post('/sign-up', async (req, res) => {
  // input data -> {
  //    username: string
  //    password: string
  //    email: string
  //    gym_details: {
  //      brand: string
  //      name: string
  //      address: string
  //      post_code: string
  //    }
  // }

  const {
    username,
    password,
    email,
    gym_details
  } = req.body;

  try {
    const gymExists = await Gym.exists({ brand: gym_details.brand, name: gym_details.name });    

    if (!gymExists) {
      const newGym = new Gym({
        brand: gym_details.brand,
        name: gym_details.name,
        address: gym_details.address,
        post_code: gym_details.post_code
      });

      await newGym.save();
    }

    var salt = crypto.randomBytes(16).toString('hex');
    var encryptedPassword = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);
    const newUser = new User({
      username,
      password: encryptedPassword,
      salt,
      email,
    });

    await newUser.save();
  
    return res.json({
      success: true,
    });
  }  catch(err) {
    console.warn('Error in POST: sign-up :', err);
    return res.json({ success: false });
  }
});

module.exports = router;
