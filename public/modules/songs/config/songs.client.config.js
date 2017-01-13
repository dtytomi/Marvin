'use strict';

// Configuring the Articles module
angular.module('songs').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Songs', 'songs', 'dropdown', '/songs(/create)?');
		Menus.addSubMenuItem('topbar', 'songs', 'List Songs', 'songs');
		Menus.addSubMenuItem('topbar', 'songs', 'New Song', 'songs/create');
	}
]);