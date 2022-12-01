const router = require('express').Router();
const authenticateUser = require('../middleware/auth');
const User = require('../models/user');
const Workout = require('../models/workout');

router.get('/:username', authenticateUser, async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User({ username });
    if (!user) return res.json({ success: false, message: "Error" });

    const workouts = await Workout.find({ creator: user._id });
    return res.json({
      success: true,
      workouts,
    });
  } catch (error) {
    console.warn(`Error in GET: /workouts/:userId, ${error.message}.`);
    return res.json({ success: false });
  }
});

router.post('/new', authenticateUser, async (req, res) => {
  try {
    const {
      username,
      workout
    } = req.body;


  } catch (error) {
    console.warn(`Error in POST: /workouts/new, ${error.message}.`);
    return res.json({ success: false });
  }
})

module.exports = router;