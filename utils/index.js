const decode = require("jwt-decode");

const getUsernameFromToken = (req) => {
	try {
		const decodedToken = decode(req.headers["authorization"].split(" ")[0]);
		return decodedToken.user;
	} catch (error) {
		console.warn(`Error parsing username from token, ${error.message}.`);
		return null;
	}
};

module.exports = getUsernameFromToken;

