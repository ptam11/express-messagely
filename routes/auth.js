const express = require('express');
const router = new express.Router();
const db = require('../db');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');
const expressError = require("../expressError")

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post('/login', async function(req, res, next) {
	try {
		let { username, password } = req.body;
        let authenticated = await User.authenticate(username, password);

        if(authenticated) {
            let token = jwt.sign({ username }, SECRET_KEY);
            User.updateLoginTimestamp(username);
            return res.json({ token });
        } else {
            throw new expressError("Invalid username or password.", 404);
        }
	} catch (err) {
		return next(err);
	}
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post('/register', async function(req, res, next) {
	try {
		let user = await User.register(req.body);
		let username = user.username;
		let token = jwt.sign({ username }, SECRET_KEY);

		await User.updateLoginTimestamp(username);

		return res.json({ token });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
