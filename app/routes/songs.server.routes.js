'use strict';

var users = require('../../app/controllers/users'),
	songs = require('../../app/controllers/songs');

module.exports = function(app) {
	

	// Songs Routes
	app.route('/songs')
		.get(songs.list)
		.post(users.requiresLogin, songs.create);

	app.route('/songs/:songId')
		.get(songs.read)
		.put(users.requiresLogin, songs.update)
		.delete(users.requiresLogin, songs.hasAuthorization, songs.delete);

	app.route('/songs/:genre')
		.get(songs.list);

	// Finish by binding the Song middleware
	app.param('songId', songs.songByID);
};