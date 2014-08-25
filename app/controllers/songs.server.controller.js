'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Song = mongoose.model('Song'),
    _ = require('lodash');

var uuid = require('node-uuid'),
    multiparty = require('multiparty');

var path = require('path'),
    fs = require('fs');


/**
 * Get the error message from error object
 */
var getErrorMessage = function(err) {
    var message = '';

    if (err.code) {
        switch (err.code) {
            case 11000:
            case 11001:
                message = 'Song already exists';
                break;
            default:
                message = 'Something went wrong';
        }
    } else {
        for (var errName in err.errors) {
            if (err.errors[errName].message) message = err.errors[errName].message;
        }
    }

    return message;
};


/**
 * Show the current Song
 */
exports.read = function(req, res) {
    res.jsonp(req.song);
};

/**
 * Update a Song
 */
exports.update = function(req, res) {
    var song = req.song ;

    song = _.extend(song , req.body);

    song.save(function(err) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            res.jsonp(song);
        }
    });
};

/**
 * Delete an Song
 */
exports.delete = function(req, res) {
    var song = req.song ;

    song.remove(function(err) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            res.jsonp(song);
        }
    });
};

/**
 * List of Songs
 * Filter by genre if any
 */
exports.list = function(req, res) {
    if(req.query.genre){
        Song.find({genre: req.query.genre }, function(err, songs){
            console.log(req.query.genre);
            res.json(songs);
        });
    }
    else{
        Song.find().sort('-created').populate('user', 'displayName').exec(function(err, songs) {
            if (err) {
                return res.send(400, {
                    message: getErrorMessage(err)
                });
            } else {
                res.jsonp(songs);
            }
        });
    }
    
};

/**
 * Song middleware
 */
exports.songByID = function(req, res, next, id) { 
    Song.findById(id).populate('user', 'displayName').exec(function(err, song) {
        if (err) return next(err);
        if (!song) return next(new Error('Failed to load Song ' + id));
        req.song = song ;
        next();
    });
};


/**
 * Song authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    if (req.song.user.id !== req.user.id) {
        return res.send(403, 'User is not authorized');
    }
    next();
};

/**
*   Image Upload
*
*/

var uploadImage = function(req, res, contentType, tmpPath, destPath) {
    
        // Server side file type checker.
        if (contentType !== 'image/png' && contentType !== 'image/jpeg') {
            fs.unlink(tmpPath);
            console.log('contenttypefail');
            return res.status(400).send('Unsupported file type.');
        }

        fs.readFile(tmpPath , function(err, data) {
            fs.writeFile(destPath, data, function(err) {
                fs.unlink(tmpPath, function(){
                    if(err) {
                        console.log('img not saved error');
                        console.log(err);
                        throw err;
                    }
                });
            }); 
        });
};

/**
 * Create a Song
 */
exports.create = function(req, res) {
    //Parse Form
    var form = new multiparty.Form();
    form.parse(req, function(err, fields, files) {
        if(err){
            console.log('error parsing form');
        }
        var songObj = {title: fields.title[0] , artist: fields.artist[0], genre: fields.genre[0], rating: fields.rating[0]}
        var song = new Song(songObj);
        song.user = req.user;
        if(files.file[0]){
            //if there is a file do upload
            var file = files.file[0];
            console.log(file);
            var contentType = file.headers['content-type'];
            var tmpPath = file.path;
            var extIndex = tmpPath.lastIndexOf('.');
            var extension = (extIndex < 0) ? '' : tmpPath.substr(extIndex);
            // uuid is for generating unique filenames. 
            var fileName = uuid.v4() + extension;
            var destPath =  path.resolve('public/modules/core/img/server' + tmpPath);
            uploadImage(req, res, contentType, tmpPath, destPath);
            song.imageUrl = 'modules/core/img/server' + tmpPath;
        }
        song.save(function(err) {
            if (err) {
                return res.send(400, {
                    message: getErrorMessage(err)
                });
            } else {
                res.jsonp(song);
            }
        });

    });
};