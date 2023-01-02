require("dotenv").config();
const mongoose = require("mongoose");

const User = require("../models/user");
const Exercise = require("../models/exercise");
const Workout = require("../models/workout");

const generateUsers = require("./generators/userGenerator");
const generateExercises = require("./generators/exerciseGenerator");
const {
	generateWorkouts,
	saveWorkouts,
} = require("./generators/workoutGenerator");

const COUNT = 50;

mongoose.connect(process.env.DB_URI).then(async (res) => {
	try {
		// remove all data
		await User.deleteMany({});
		await Exercise.deleteMany({});
		await Workout.deleteMany({});

		// generate data
		const users = await generateUsers(COUNT);
		await generateExercises();

		const workouts = await generateWorkouts(COUNT);
		await saveWorkouts(users, workouts);

		console.log("Database seeding finished...");
		res.disconnect();
	} catch (error) {
		console.warn(`Error: ${error.message}.`);
		res.disconnect();
	}
});

