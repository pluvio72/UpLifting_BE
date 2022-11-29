const router = require('express').Router();
const authenticateUser = require('../middleware/auth');
const Workout = require('../models/workout');

router.get('/:userId', authenticateUser, async (req, res) => {
  try {
    const workouts = Workout.find({ creator: req.params.userId });
    return res.json({
      success: true,
      workouts,
    });
  } catch (error) {
    console.warn(`Error in GET: /workous/:userId, ${error.message}.`);
    return res.json({ success: false });
  }
});

module.exports = router;