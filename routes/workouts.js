const router = require("express").Router();
const authenticateUser = require("../middleware/auth");
const User = require("../models/user");

router.get("/:username", authenticateUser, async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username }).select("workoutHistory");
    if (!user) return res.json({ success: false, message: "Error" });

    return res.json({
      success: true,
      workouts: user.workoutHistory,
    });
  } catch (error) {
    console.warn(`Error in GET: /workouts/:userId, ${error.message}.`);
    return res.json({ success: false, workouts: [] });
  }
});

router.get("/:username/recent/:limit", authenticateUser, async (req, res) => {
  try {
    const { username, limit } = req.params;
    const user = await User.findOne({ username }).select("workoutHistory");
    if (!user) return res.json({ success: false, message: "Error" });

    const selectedWorkouts =
      user.workoutHistory.length > limit
        ? user.workoutHistory.slice(0, limit)
        : user.workoutHistory;
    return res.json({ success: true, workouts: selectedWorkouts });

  } catch (error) {
    console.warn(
      `Error in GET: /workouts/:username/recent/:limit, ${error.message}.`
    );
    return res.json({ success: false, workouts: [] });
  }
});

router.get('/:username/charts', authenticateUser, async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select("workoutHistory");
    if (!user) return res.json({ success: false, message: "Error" });

    const workouts = user.workoutHistory;

    for ( let i = 0; i < workouts.length; i += 1 ) {

    }

  } catch (error) {

  }
})

router.post("/new", authenticateUser, async (req, res) => {
  try {
    const { title, username, workout, metrics } = req.body;

    try {
      const user = await User.findOne({ username });
      const newWorkout = {
        title,
        exercises: workout,
        creator: user._id,
        metrics,
      };
      await user.addWorkout(newWorkout);

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

module.exports = router;
