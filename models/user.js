const mongoose = require("mongoose");
const crypto = require("crypto");

const workout = require("./workout");

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
});

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

userSchema.methods.checkPassword = function (password) {
  var inputHashedPassword = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, `sha512`)
    .toString(`hex`);
  return this.password === inputHashedPassword;
};

const User = mongoose.model("users", userSchema);

module.exports = User;
