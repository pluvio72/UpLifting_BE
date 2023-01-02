const Workout = require("../../models/workout");
const Exercise = require("../../models/exercise");

const getWeight = () => Math.floor(Math.random() * 40);
const getReps = () => Math.floor(Math.random() * 15);
const getSets = () => Math.round(Math.random() * 2 + 2);
const getExerciseCount = () => Math.round(Math.random() * 3 + 1);

const getTitle = () => {
	const title = [
		"Workout Monday",
		"Full Body",
		"Workout #1",
		"Afternoon Workout",
	];
	return title[Math.floor(Math.random() * title.length)];
};

const getExercise = (exercises) => {
	const index = Math.floor(Math.random() * exercises.length);
	const name = exercises[index].name;
	exercises.splice(index, 1);
	return [exercises, name];
};

const generateWorkouts = async (count) => {
	let exerciseNames;
	let workouts = [];

	for (let i = 0; i < count; i += 1) {
		let exercises = [];
		//reset exercises (ones removed after added from prev)
		exerciseNames = await Exercise.find({});
		for (let j = 0; j < getExerciseCount(); j += 1) {
			const [newExercises, currentExercise] = getExercise(exerciseNames);
			// remove exercise from list
			exerciseNames = newExercises;

			let temp = {
				name: currentExercise,
				sets: [],
				metric: { name: "", value: "" },
			};
			for (let k = 0; k < getSets(); k += 1) {
				temp.sets[k] = {
					reps: getReps(),
					weight: getWeight(),
					completed: true,
					isPR: false,
				};
			}

			temp.metric = {
				name: "Reps",
				value: temp.sets.reduce((total, cur) => total + cur.reps, 0).toString(),
			};
			exercises.push(temp);
		}

		workouts.push({
			exercises,
			title: getTitle(),
			metrics: { name: "Reps", value: "NA" },
			isTemplate: false,
			creator: "",
		});
	}
	return workouts;
};

const saveWorkouts = async (users, workouts) => {
	for (let i = 0; i < users.length; i += 1) {
		console.log("Workout:", workouts[i]);
		const newWorkout = new Workout({
			...workouts[i],
			creator: users[i]._id,
		});
		// console.log("New Workout:", newWorkout);

		await newWorkout.save();
	}
};

module.exports = {
	generateWorkouts,
	saveWorkouts,
};

