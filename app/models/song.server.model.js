'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Song Schema
 */
var SongSchema = new Schema({
	
	created: {
		type: Date,
		default: Date.now
	},
	title: {
		type: String,
		default: '',
		trim: true,
		required: 'Title cannot be blank'
	},
	artist: {
		type: String,
		default: '',
		trim: true,
		required: 'Artist name cannot be blank'
	},
	genre: {
		type: String,
		default: '',
		 trim: true,
		required: 'Song genre cannot be blank'
	},
	imageUrl: {
		type: String
	},
	youTube: {
		type: String,
		default: ''
	},
	rating: {
		type: Number,
		default: 0,
		min: 0,
		max: 5,
		required: 'Please fill Song rate'
		// trim: true
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Song', SongSchema);