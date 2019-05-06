const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const { authenticateJWT, ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth")

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/

router.get("/", authenticateJWT, ensureLoggedIn, async function(req, res, next) {
    return res.json({users: await User.all()});
});

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/

router.get("/:username", authenticateJWT, ensureLoggedIn, ensureCorrectUser, async function(req, res, next) {
    let username = req.params.username;
    return res.json({user: await User.get(username)});
});


/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get("/:username/to", authenticateJWT, ensureLoggedIn, ensureCorrectUser, async function(req, res, next) {
    let username = req.params.username;
    return res.json({user: await User.messagesTo(username)});
});


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get("/:username/from", authenticateJWT, ensureLoggedIn, ensureCorrectUser, async function(req, res, next) {
    let username = req.params.username;
    return res.json({user: await User.messagesFrom(username)});
});

module.exports = router;