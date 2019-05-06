const express = require('express');
const router = new express.Router();
const Message = require('../models/message');
const { authenticateJWT, ensureLoggedIn, ensureCorrectUser, ensureCorrectMessageUser, ensureCorrectToUser  } = require("../middleware/auth")

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

 router.get('/:id', authenticateJWT, ensureLoggedIn, ensureCorrectMessageUser, async function(req, res, next) {
    let msgId = req.params.id;
    return res.json(await Message.get(msgId));
 });

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post('/', authenticateJWT, ensureLoggedIn, ensureCorrectUser, async function(req, res, next) {
    let { to_username, body } = req.body;
    return res.json(Message.create(req.user.username, to_username, body));
 });

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post('/:id/read', authenticateJWT, ensureLoggedIn, ensureCorrectToUser, function(req, res, next) {
    let msgId = req.params.id;
    return res.json(Message.markRead(msgId));
 });

 module.exports = router;