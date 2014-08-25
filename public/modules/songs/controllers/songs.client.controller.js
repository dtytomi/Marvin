'use strict';

// Songs controller
angular.module('songs')
.controller('SongsController', ['$scope', '$upload', '$stateParams', '$state',  '$location', 'Authentication', 'Songs',
	function($scope, $upload, $stateParams, $state, $location, Authentication, Songs ) {
		$scope.authentication = Authentication;

		// Create new Song
		$scope.create = function() {
			// Create new Song object
			var song = new Songs ($scope.song);
			$scope.song.rating = $scope.rate;
			// Redirect after save
			$scope.upload = $upload.upload({
	            url: '/songs',
	            method: 'POST',
	            data: $scope.song,
	            file: $scope.files[0]
	        }).success(function(response) {
	            $location.path('songs/' + response._id); 
	        }).error(function(err) {
	            console.log('Error uploading file: ' + err.message || err);
	        });
		};

		// Upload Image
		$scope.onFileSelect = function($files) {
			$scope.files = $files;
	    };

		// Remove existing Song
		$scope.remove = function( song ) {
			if ( song ) { song.$remove();

				for (var i in $scope.songs ) {
					if ($scope.songs [i] === song ) {
						$scope.songs.splice(i, 1);
					}
				}
			} else {
				$scope.song.$remove(function() {
					$location.path('songs');
				});
			}
		};

		// Update existing Song
		$scope.update = function() {
			var song = $scope.song ;

			song.$update(function() {
				$location.path('songs/' + song._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Songs
		$scope.find = function() {
			console.log($stateParams);
			if($stateParams.genre){
				$scope.songs = Songs.query({genre: $stateParams.genre});
			}
			else{
				$scope.songs = Songs.query();
			}
			
		};

		// Find existing Song
		$scope.findOne = function() {
			$scope.song = Songs.get({ 
				songId: $stateParams.songId
			});
		};

		//	Rating
	    $scope.rating = 5;
	   	$scope.rate = 0;	
	    $scope.rateFunction = function(rating) {
	      $scope.rate = rating;
	    };

	    // Search
	    $scope.onSearch = function(name){
	    	$state.go('listSongsByGenre', {genre: name});
	    };
	   
		
	    
	}
])
.directive('starRating',
    function() {
        return {
            restrict: 'A',
            template: '<ul class="rating">'
                    + ' <li ng-repeat="star in stars" ng-class="star" ng-click="toggle($index)">'
                    + '\u2605'
                    + '</li>'
                    + '</ul>',
                    scope : {
                    ratingValue : '=',
                    max : '=',
                    onRatingSelected : '&'
            },
            link: function postLink(scope, element, attrs) {
                // Star rating directive logic
                // ...
                var updateStars = function() {
                    scope.stars = [];
                    for ( var i = 0; i < scope.max; i++) {
                        scope.stars.push({
                            filled : i < scope.ratingValue
                        });
                    }
                };

                var updateStars = function() {
                    scope.stars = [];
                    for ( var i = 0; i < scope.max; i++) {
                        scope.stars.push({
                            filled : i < scope.ratingValue
                        });
                    }
                };
            
                scope.toggle = function(index) {
                    scope.ratingValue = index + 1;
                    scope.onRatingSelected({
                         rating : index + 1
                    });
                };
                scope.$watch('ratingValue',
                    function(oldVal, newVal) {
                            if (newVal) {
                                updateStars();
                            }
                        }
                );
            }
        };
    }   
);