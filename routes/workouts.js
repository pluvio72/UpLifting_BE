const router = require("express").Router();
const authenticateUser = require("../middleware/auth");
const User = require("../models/user");
const Workout = require('../models/workout');

router.get("/:username", authenticateUser, async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    const workouts = await Workout.find({ creator: user._id });
    if (!user) return res.json({ success: false, message: "Error" });

    return res.json({
      success: true,
      workouts,
    });
  } catch (error) {
    console.warn(`Error in GET: /workouts/:userId, ${error.message}.`);
    return res.json({ success: false, workouts: [] });
  }
});

router.get("/:username/recent/:limit", authenticateUser, async (req, res) => {
  try {
    const { username, limit } = req.params;
    const user = await User.findOne({ username });
    const workouts = await Workout.find({ creator: user._id });
    if (!user) return res.json({ success: false, message: "Error" });

    const selectedWorkouts =
    workouts.length > limit
        ? workouts.slice(0, limit)
        : workouts;
    return res.json({ success: true, workouts: selectedWorkouts });
  } catch (error) {
    console.warn(
      `Error in GET: /workouts/:username/recent/:limit, ${error.message}.`
    );
    return res.json({ success: false, workouts: [] });
  }
});

router.get("/:username/charts", authenticateUser, async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    
    if (!user) return res.json({ success: false, message: "Error" });

    const workouts = user.workoutHistory;

    for (let i = 0; i < workouts.length; i += 1) {}
  } catch (error) {}
});

router.post("/new", authenticateUser, async (req, res) => {
  try {
    const { title, username, workout, metrics } = req.body;

    try {
      const user = await User.findOne({ username });
      const usersWorkouts = await Workout.find({ creator: user._id });

      // check if any exercise sets include a PR
      let workoutData = workout;
      for (let i = 0; i < workoutData.length; i += 1) {
        for (let j = 0; j < workoutData[i].sets.length; j += 1) {
          const isPR = Workout.checkForPR(
            usersWorkouts,
            workoutData[i].name,
            workoutData[i].sets[j].weight,
            workoutData[i].sets[j].reps
          );
          workoutData[i].sets[j].isPR = isPR;
        }
      }
      const newWorkout = new Workout({
        title,
        exercises: workoutData,
        creator: user._id,
        metrics,
      });
      await newWorkout.save();

      return res.json({ success: true });
    } catch (error) {
      console.warn(`Error in POST: /workouts/new, ${error.message}`);
      return res.json({ success: false });
    }
  } catch (error) {
    console.warn(`Error in POST: /workouts/new, ${error.message}.`);
    return res.json({ success: false });
  }
});

router.get('/:username/prs/:limit', authenticateUser, async (req, res) => {
  try {
    const { username, limit } = req.query;
    const user = User.find({ username, "workoutHistory.exercises": {
      $elemMatch: {
        "sets": { isPR: true }
      }
    } });
    let prs = [];

  } catch (error) {
    console.warn(`Error in GET: /workouts/:username/prs/:limit, ${error.message}.`);
    return res.json({ success: false });
  }
});

module.exports = router;
