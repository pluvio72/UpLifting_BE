var express = require("express");
var router = express.Router();
var crypto = require("crypto");
var jwt = require("jsonwebtoken");

var { Gym, User } = require("../models");
const authenticateUser = require("../middleware/auth");

router.post("/sign-in", async (req, res) => {
	try {
		const { username, password } = req.body;

		const user = await User.findOne({ username }).populate({
			path: "friends",
			populate: { path: "user" }
		}).populate("gym");
		if (user) {
			const correctPassword = user.checkPassword(password);
			const newSecretKey = await user.assignNewKey();
			const token = jwt.sign(
				{
					email: user.email,
					user: user.username,
				},
				newSecretKey,
				{
					expiresIn: "1d",
				}
			);
			// console.log('Sign Up Token Generated:', token);

			if (correctPassword) {
				return res.json({
					success: true,
					token,
					account: {
						firstName: user.firstName,
						lastName: user.lastName,
						username: user.username,
						stats: user.stats,
						settings: user.settings,
						gym: user.gym,
						friends: user.friends,
					},
				});
			} else {
				return res.json({
					success: false,
					message: "Username or Password is incorrect.",
				});
			}
		} else {
			return res.json({
				success: false,
				message: "Username or Password is incorrect.",
			});
		}
	} catch (error) {
		console.warn(`Error in POST /users/sign-in, ${error.message}.`);
		return res.json({ success: false, message: "Error" });
	}
});

router.post("/sign-up", async (req, res) => {
	// input data -> {
	//    username: string
	//    password: string
	//    email: string
	//    gym_details: {
	//      brand: string
	//      name: string
	//      address: string
	//      post_code: string
	//    }
	// }

	const { username, password, email, gym_details } = req.body;

	try {
		const gymExists = await Gym.exists({
			brand: gym_details.brand,
			name: gym_details.name,
		});

		if (!gymExists) {
			const newGym = new Gym({
				brand: gym_details.brand,
				name: gym_details.name,
				address: gym_details.address,
				post_code: gym_details.post_code,
			});

			await newGym.save();
		}

		var salt = crypto.randomBytes(16).toString("hex");
		var encryptedPassword = crypto
			.pbkdf2Sync(password, salt, 1000, 64, `sha512`)
			.toString(`hex`);
		const newUser = new User({
			username,
			password: encryptedPassword,
			salt,
			email,
		});

		await newUser.save();

		return res.json({ success: true });
	} catch (err) {
		console.warn("Error in POST: sign-up :", err);
		return res.json({ success: false });
	}
});

router.post("/update/settings", authenticateUser, async (req, res) => {
	try {
		// data will be of one of the following fields in settings:
		//    useKilos,
		const { username, data } = req.body;

		const success = await User.updateOne(
			{
				username,
			},
			{
				settings: {
					...data,
				},
			}
		);
		return res.json({ success: success.acknowledged });
	} catch (error) {
		console.warn(`Error in POST /users/update, ${error.message}.`);
		return res.json({ success: false });
	}
});

router.post("/update/stats", authenticateUser, async (req, res) => {
	try {
		const { username, data } = req.body;

		const success = await User.updateOne(
			{
				username,
			},
			{
				stats: {
					...data,
				},
			}
		);

		return res.json({ success: success.acknowledged });
	} catch (error) {
		console.warn(`Error in POST /users/update/stats, ${error.message}`);
		return res.json({ success: false });
	}
});

router.post("/update/account", authenticateUser, async (req, res) => {
	try {
		const { username, data } = req.body;
	} catch (error) {}
});

router.post("/friend/request", authenticateUser, async (req, res) => {
	try {
		const { newFriendUsername, username } = req.body;
		const user = await User.findOne({ username });
		const friend = await User.findOne({ username: newFriendUsername }).select("-_id firstName lastName username");
		await friend.receiveFriendRequest(user.id);
		return res.json({ success: true, friend });
	} catch (error) {
		console.warn(`Error in POST /users/friend/request, ${error.message}.`);
		return res.json({ success: false });
	}
});

router.post("/friend/request/accept", authenticateUser, async (req, res) => {
	try {
		const { friendUsername, username } = req.body;
		const user = await User.findOne({ username });
		const friend = await User.findOne({ username: friendUsername }).select("-_id firstName lastName username");
		await user.acceptFriendRequest(friend.id);
		return res.json({ success: true, friend });
	} catch (error) {
		console.warn(`Error in POST /users/friend/request, ${error.message}.`);
		return res.json({ success: false });
	}
})

router.post("/", authenticateUser, async (req, res) => {
	try {
		const { filter } = req.body;
		const users = await User.find({
			username: {
				$regex: filter,
				$options: "i",
			},
		}).select("-_id firstName lastName username stats settings");
		return res.json({ success: true, users });
	} catch (error) {
		console.warn(`Error in POST /users/, ${error.message}.`);
		return res.json({ success: false, users: [] });
	}
});

router.get("/validate-jwt", authenticateUser, async (req, res) => {
	try {
		const header = req.headers["authorization"].split(" ");
		let token = header[0];
		let username = header[1];

		const user = await User.findOne({ username });

		jwt.verify(token, user.key);
		return res.json({ success: true });
	} catch (error) {
		console.warn(`Error in GET /users/validate-jwt, ${error.message}.`);
		return res.json({ success: false });
	}
});

module.exports = router;

