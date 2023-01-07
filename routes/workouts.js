const router = require("express").Router();
const authenticateUser = require("../middleware/auth");
const getUsernameFromToken = require("../utils");

const User = require("../models/user");
const Workout = require("../models/workout");
const Exercise = require("../models/exercise");

const { convertToKilos } = require("../utils/weight");

router.get("/exercises", authenticateUser, async (req, res) => {
	try {
		const exercises = await Exercise.find({});
		return res.json({ success: true, exercises });
	} catch (error) {
		console.warn(`Error in GET /workouts/exercises, ${error.message}.`);
		return res.json({ success: false, exercises: [] });
	}
});

router.get("/:username", authenticateUser, async (req, res) => {
	try {
		const { username } = req.params;

		const user = await User.findOne({ username });
		if (!user) return res.json({ success: false, message: "Error" });
		const workouts = await user.getWorkouts();

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
		const workouts = await user.getWorkouts();
		if (!user) return res.json({ success: false, workouts: [] });

		const selectedWorkouts =
			workouts.length > limit ? workouts.slice(0, limit) : workouts;
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
		const { title, username, workout, metrics, isTemplate } = req.body;

		const user = await User.findOne({ username });
		const usersWorkouts = await Workout.find({ creator: user._id });
		// if user wants to save workout measured in pounds store in kilos
		// but send back in pounds
		const needsConverting = !user.settings.useKilos;

		const prs = [];
		// check if any exercise sets include a PR
		let workoutData = workout;
		for (let i = 0; i < workoutData.length; i += 1) {
			for (let j = 0; j < workoutData[i].sets.length; j += 1) {
				if (needsConverting)
					workoutData[i].sets[j].weight = convertToKilos(
						workoutData[i].sets[j].weight
					);
				const isPR = Workout.checkForPR(
					usersWorkouts,
					workoutData[i].name,
					workoutData[i].sets[j].weight,
					workoutData[i].sets[j].reps
				);
				workoutData[i].sets[j].isPR = isPR;

				prs.push({
					...workoutData[i].sets[j],
					date_completed: Date.now(),
					name: workoutData[i].name,
				});
			}
		}
		const newWorkout = new Workout({
			title,
			exercises: workoutData,
			creator: user._id,
			metrics,
			isTemplate,
		});
		await newWorkout.save();
		await user.addPRs(prs);

		return res.json({ success: true });
	} catch (error) {
		console.warn(`Error in POST: /workouts/new, ${error.message}`);
		return res.json({ success: false });
	}
});

router.get("/:username/templates", authenticateUser, async (req, res) => {
	try {
		const { username } = req.params;

		const user = await User.findOne({ username });
		const workouts = user.getWorkouts({ isTemplate: true });
		return res.json({ success: true, templates: workouts });
	} catch (error) {
		console.warn(
			`Error in GET /workouts/:username/templates, ${error.message}.`
		);
		return res.json({ success: false, templates: [] });
	}
});

router.get("/:username/prs/:limit", authenticateUser, async (req, res) => {
	try {
		const { username, limit } = req.params;
		const user = await User.findOne({ username });
		const workouts = await user.getWorkouts(
			{
				exercises: { $elemMatch: { sets: { $elemMatch: { isPR: true } } } },
			},
			"exercises date_completed",
			{ sort: { date_completed: -1 } }
		);
		console.log("Exericses:", workouts);

		// just get exercise set field
		let prs = [];
		for (let i = 0; i < workouts.length; i += 1) {
			for (let j = 0; j < workouts[i].exercises.length; j += 1) {
				for (let k = 0; k < workouts[i].exercises[j].sets.length; k += 1) {
					if (workouts[i].exercises[j].sets[k].isPR) {
						const dateCompleted = new Date(workouts[i].date_completed);
						prs.push({
							name: workouts[i].exercises[j].name,
							date_completed:
								dateCompleted.getDate() + "/" + dateCompleted.getMonth(),
							weight: workouts[i].exercises[j].sets[k].weight,
							reps: workouts[i].exercises[j].sets[k].reps,
						});
					}
				}
			}
		}

		return res.json({ success: true, prs: prs.slice(0, limit) });
	} catch (error) {
		console.warn(
			`Error in GET: /workouts/:username/prs/:limit, ${error.message}.`
		);
		return res.json({ success: false, prs: [] });
	}
});

router.post("/exercise-history", authenticateUser, async (req, res) => {
	try {
		const username = getUsernameFromToken(req);
		const user = await User.findOne({ username });
		if (!user) return res.json({ success: false, info: [] });

		const history = await user.getSpecificExercisesHistory([
			req.body.exerciseName,
		]);
		console.log("History: ", history);
		return res.json({ success: true, info: history });
	} catch (error) {
		console.warn(
			`Error in POST: /workouts/exercise-history, ${error.message}.`
		);
		return res.json({ success: false, info: [] });
	}
});

module.exports = router;

