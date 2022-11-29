const express = require('express');
const router = express.Router();

const Gym = require('../models/gym');

router.get('/', async (req, res) => {
  try {
    const gyms = await Gym.find({ confirmed: true }).select('-_id brand name address post_code');
    // console.log("gyms: ", gyms);
    return res.json({ success: true, gyms });
  } catch(error) {
    console.warn(`Error in GET /gyms, ${error.message}.`);
    return res.json({ success: false });
  }
});

router.post('/request-add', async (req, res) => {
  const {
    brand,
    name,
    address,
    post_code
  } = req.body;

  try {
    const newGym = new Gym({
      brand,
      name,
      address,
      post_code,
    });
    await newGym.save();
    return res.json({ success: true });
  } catch(error) {
    console.warn(`Error in POST /gyms/request-add, ${error.message}.`);
    return res.json({ success: false });
  }
});

module.exports = router;