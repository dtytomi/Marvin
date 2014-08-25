'use strict';

//Setting up route
angular.module('songs').config(['$stateProvider',
	function($stateProvider) {
		// Songs state routing
		$stateProvider.
		state('listSongs', {
			url: '/songs',
			templateUrl: 'modules/songs/views/list-songs.client.view.html'
		}).
		state('createSong', {
			url: '/songs/create',
			templateUrl: 'modules/songs/views/create-song.client.view.html'
		}).
		state('viewSong', {
			url: '/songs/:songId',
			templateUrl: 'modules/songs/views/view-song.client.view.html'
		}).
		state('listSongsByGenre', {
			url: '/songs/findByGenre/:genre',
			templateUrl: 'modules/songs/views/list-songs.client.view.html'
		}).
		state('editSong', {
			url: '/songs/:songId/edit',
			templateUrl: 'modules/songs/views/edit-song.client.view.html'
		});
	}
]);