const Exercise = require("../../models/exercise");
const exercises = require("../data/exerciseData");

const saveExercises = async () => {
	for (let i = 0; i < exercises.length; i += 1) {
		const newExercise = Exercise(exercises[i]);
		await newExercise.save();
	}
};

module.exports = saveExercises;

