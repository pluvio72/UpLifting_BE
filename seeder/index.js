require("dotenv").config();
const mongoose = require("mongoose");
const { User } = require("../models");

const getUsers = require("./data/userData");
const generateUser = require("./generators/userGenerator");

mongoose.connect(process.env.DB_URI).then(async (res) => {
	try {
		// remove all users
		await User.remove({});

		let users = await generateUser(50);
		const savedUsers = getUsers();
		users = users.concat(savedUsers);

		for (let i = 0; i < users.length; i += 1) {
			const user = new User({
				firstName: users[i].firstName,
				lastName: users[i].lastName,
				username: users[i].username,
				password: users[i].password,
				salt: users[i].salt,
				email: users[i].email,
			});
			await user.save();
		}

		console.log("Database seeding finished...");
		res.disconnect();
	} catch (error) {
		console.warn(`Error: ${error.message}.`);
		res.disconnect();
	}
});

