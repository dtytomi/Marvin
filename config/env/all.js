'use strict';

module.exports = {
	app: {
		title: 'Keyz Beat',
		description: 'Music Reviewing Site',
		keywords: 'Artist, Song, Title, Picture'
	},
	port: process.env.PORT || 3000,
	templateEngine: 'swig',
	sessionSecret: 'MEAN',
	sessionCollection: 'sessions',
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.css',
				'public/lib/bootstrap/dist/css/bootstrap-theme.css',
				'public/lib/font-awesome/css/font-awesome.min.css',
			],
			js: [
				'public/lib/angular-file-upload/dist/angular-file-upload-html5-shim.min.js',			
				'public/lib/angular/angular.js',
				'public/lib/angular-file-upload/dist/angular-file-upload.min.js',
				'public/lib/angular-resource/angular-resource.js', 
				'public/lib/angular-animate/angular-animate.js', 
				'public/lib/angular-ui-router/release/angular-ui-router.js',
				'public/lib/angular-ui-utils/ui-utils.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
				'public/lib/angular-touch/angular-touch.min.js'							
			]
		},
		css: [
			'public/modules/**/css/*.css'
		],
		js: [
			'public/config.js',
			'public/application.js',
			'public/modules/*/*.js',
			'public/modules/*/*[!tests]*/*.js'
		],
		tests: [
			'public/lib/angular-mocks/angular-mocks.js',
			'public/modules/*/tests/*.js'
		]
	}
};