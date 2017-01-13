'use strict';

//Songs service used to communicate Songs REST endpoints
angular.module('songs').factory('Songs', ['$resource',
	function($resource) {
		return $resource('/songs/:songId', { songId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
