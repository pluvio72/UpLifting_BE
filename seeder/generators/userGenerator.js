const axios = require("axios");
const crypto = require("crypto");

const User = require("../../models/user");
const getSavedUsers = require("../data/userData");

const usernamesURL =
	"https://raw.githubusercontent.com/danielmiessler/SecLists/master/Usernames/xato-net-10-million-usernames.txt";
const firstNamesURL =
	"https://raw.githubusercontent.com/danielmiessler/SecLists/master/Usernames/Names/names.txt";
const lastNamesURL =
	"https://raw.githubusercontent.com/danielmiessler/SecLists/master/Usernames/Names/names.txt";

const emailProviders = [
	"mail.com",
	"gmail.com",
	"yahoo.com",
	"bing.com",
	"outlook.com",
];

const getMailProvider = () =>
	emailProviders[Math.floor(Math.random() * emailProviders.length)];

const fetchContent = (url) =>
	axios.get(url).then((res) => res.data.split("\n"));

const generateUsers = async (count) => {
	let usernames = await fetchContent(usernamesURL);
	const firstNames = await fetchContent(firstNamesURL);
	const lastNames = await fetchContent(lastNamesURL);

	const savedUsers = getSavedUsers();

	let users = [];
	for (let i = 0; i < count - savedUsers.length; i += 1) {
		var salt = crypto.randomBytes(16).toString("hex");
		var password = usernames[Math.floor(Math.random() * usernames.length)];
		var encryptedPassword = crypto
			.pbkdf2Sync(password, salt, 1000, 64, `sha512`)
			.toString(`hex`);

		const usernameIndex = Math.floor(Math.random() * usernames.length);

		const newUser = new User({
			username: usernames[usernameIndex],
			firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
			lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
			password: encryptedPassword,
			salt: salt,
			email: `${usernames[usernameIndex]}@${getMailProvider()}`,
		});

		await newUser.save();
		// remove username from list
		usernames.splice(usernameIndex, 1);

		users.push(newUser);
	}

	for (let i = 0; i < savedUsers.length; i += 1) {
		const newUser = new User(savedUsers[i]);
		await newUser.save();

		users.push(newUser);
	}

	return users;
};

module.exports = generateUsers;

