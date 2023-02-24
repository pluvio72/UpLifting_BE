const mongoose = require("mongoose");
const crypto = require("crypto");

const workout = require("./workout");
const { convertToPounds } = require("../utils/weight");

const userSchema = mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true,
		minLength: 3,
	},
	password: {
		type: String,
		required: true,
	},

	firstName: {
		type: String,
		required: false,
	},
	lastName: {
		type: String,
		required: false,
	},
	salt: {
		type: String,
		required: true,
	},
	key: {
		type: String,
	},
	email: {
		type: String,
		unique: true,
	},
	gym: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "gyms",
	},
	friends: {
		type: [
			{
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "users",
				},
				pending: Boolean,
			},
		],
		default: [],
	},
	prs: {
		type: [
			{
				weight: String,
				reps: String,
				date_completed: Date,
				name: String,
				_id: false,
			},
		],
		default: [],
	},
	settings: {
		useKilos: Boolean,
	},
	stats: {
		_id: false,
		type: {
			weight: {
				unit: String,
				value: Number,
			},
			height: {
				unit: String,
				value: Number,
			},
		},
	},
	default: {},
});

userSchema.methods.setPassword = async function (password) {
	this.salt = crypto.randomBytes(16).toString("hex");
	this.password = crypto
		.pbkdf2Sync(password, this.salt, 1000, 64, `sha512`)
		.toString(`hex`);
	await this.save();
};

userSchema.methods.checkPassword = function (password) {
	var inputHashedPassword = crypto
		.pbkdf2Sync(password, this.salt, 1000, 64, `sha512`)
		.toString(`hex`);
	return this.password === inputHashedPassword;
};

userSchema.methods.assignNewKey = async function () {
	const newKey = crypto.randomBytes(10).toString("hex");
	console.log("Generated Secret:", newKey);
	this.key = newKey;
	await this.save();
	return newKey;
};

userSchema.methods.receiveFriendRequest = async function (userId) {
	if (this.friends.find((e) => e.user === userId) === undefined) {
		this.friends.push({ user: userId, pending: true });
		console.log("Received friend request from: ", userId);
		await this.save();
	}
};

userSchema.methods.getWorkouts = async function (query, select, options) {
	// if user is using pounds instead of kilos
	// convert to pounds when sending to FE
	// as all weight data is stored in KG
	const needsConverting = !this.settings.useKilos;
	const workouts = await workout.find(
		{
			creator: this._id,
			...query,
		},
		select,
		options
	);
	if (needsConverting) {
		for (let i = 0; i < workouts.length; i += 1) {
			for (let j = 0; j < workouts[i].exercises.length; j += 1) {
				for (let k = 0; k < workouts[i].exercises[j].sets.length; k += 1) {
					if (needsConverting) {
						workouts[i].exercises[j].sets[k].weight = convertToPounds(
							workouts[i].exercises[j].sets[k].weight
						).toFixed(1);
					}
				}
			}
		}
	}
	return workouts;
};

userSchema.methods.getSpecificExercisesHistory = async function (
	exerciseNames
) {
	const workouts = await workout
		.find({
			creator: this._id,
			exercises: { $elemMatch: { name: { $in: exerciseNames } } },
		})
		.select("exercises date_completed");

	let outputObj = {};
	for (let i = 0; i < workouts.length; i += 1) {
		for (let j = 0; j < workouts[i].exercises.length; j += 1) {
			let cur = workouts[i].exercises[j];
			if (exerciseNames.includes(cur.name)) {
				let curInputObj = {
					set: cur.sets,
					date_completed: workouts[i].date_completed,
				};
				if (outputObj[cur.name] === undefined)
					outputObj[cur.name] = [curInputObj];
				else outputObj[cur.name].push(curInputObj);
			}
		}
	}
	return outputObj;
};

userSchema.methods.addPRs = async function (prs) {
	this.prs = this.prs.concat(prs);
	await this.save();
};

const User = mongoose.model("users", userSchema);

module.exports = User;

