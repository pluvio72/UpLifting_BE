require("dotenv").config();
const mongoose = require("mongoose");
const { User } = require("../models");
const Exercise = require("../models/exercise");

const generateUsers = require("./generators/userGenerator");
const generateExercises = require("./generators/exerciseGenerator");

mongoose.connect(process.env.DB_URI).then(async (res) => {
	try {
		// remove all data
		await User.deleteMany({});
		await Exercise.deleteMany({});

		// generate data
		await generateUsers(50);
		await generateExercises();

		console.log("Database seeding finished...");
		res.disconnect();
	} catch (error) {
		console.warn(`Error: ${error.message}.`);
		res.disconnect();
	}
});

