const mongoose = require("mongoose");
const crypto = require("crypto");

const workout = require("./schemas/workout");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minLength: 4,
  },
  password: {
    type: String,
    required: true,
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
  workoutHistory: {
    type: [workout],
    default: [],
  },
});

userSchema.methods.addWorkout = async function (workoutData) {
  this.workoutHistory.push(workoutData);
  await this.save();
};

userSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.password = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, `sha512`)
    .toString(`hex`);
};

userSchema.methods.assignNewKey = async function () {
  const newKey = crypto.randomBytes(10).toString("hex");
  console.log("Generated Secret:", newKey);
  this.key = newKey;
  await this.save();
  return newKey;
};

userSchema.methods.checkForPR = function (exerciseName, weight, reps) {
  let workoutData = this.workoutHistory;
  // returns array of arrays so must flatmap
  let exerciseSetsToCheck = workoutData.map((e) => e.exercises);
  let exercises = [];
  for (let i = 0; i < exerciseSetsToCheck.length; i += 1) {
    exercises = exercises.concat(exerciseSetsToCheck[i]);
  }

  for (let i = 0; i < exercises.length; i += 1) {
    for (let j = 0; j < exercises[i].sets.length; j += 1) {
      if (
        weight * reps >
        exercises[i].sets[j].weight * exercises[i].sets[j].reps
      )
        return true;
    }
  }
  return false;
};

userSchema.methods.checkPassword = function (password) {
  var inputHashedPassword = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, `sha512`)
    .toString(`hex`);
  return this.password === inputHashedPassword;
};

const User = mongoose.model("users", userSchema);

module.exports = User;
