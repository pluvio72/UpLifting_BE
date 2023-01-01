const mongoose = require("mongoose");

const exerciseSchema = mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true,
	},
	category: [
		{
			type: String,
			required: true,
		},
	],
});

const Exercise = mongoose.model("exercises", exerciseSchema);

module.exports = Exercise;

