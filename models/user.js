const mongoose = require("mongoose");
const crypto = require("crypto");

const workout = require("./workout");
const { convertToKilos } = require("../utils/weight");

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
  prs: {
    type: [
      {
        weight: String,
        reps: String,
        date_completed: Date,
      },
    ],
    default: [],
  },
  settings: {
    useKilos: Boolean,
  },
  bodyWeight: Number,
});

userSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.password = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, `sha512`)
    .toString(`hex`);
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

userSchema.methods.getWorkouts = async function (query, select, options) {
  // if user is using pounds instead of kilos
  // convert to pounds when sending to FE
  // as all weight data is stored in KG
  const needsConverting = !this.settings.useKilos;
  const workouts = await workout.find({ creator: this._id, ...query }, select, options);
  if (needsConverting) {
    for (let i = 0; i < workouts.length; i += 1) {
      for (let j = 0; j < workouts[i].exercises.length; j += 1) {
        for (let k = 0; k < workouts[i].exercises[j].sets.length; k += 1) {
          workouts[i].exercises[j].sets[k].weight = convertToKilos(
            workouts[i].exercises[j].sets[k].weight
          );
        }
      }
    }
  }
  return workouts;
};

const User = mongoose.model("users", userSchema);

module.exports = User;
