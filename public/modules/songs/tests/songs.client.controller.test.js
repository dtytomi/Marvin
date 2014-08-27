'use strict';

(function() {
	// Songs Controller Spec
	describe('Songs Controller Tests', function() {
		// Initialize global variables
		var SongsController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Songs controller.
			SongsController = $controller('SongsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Song object fetched from XHR', inject(function(Songs) {
			// Create sample Song using the Songs service
			var sampleSong = new Songs({
				name: 'New Song'
			});

			// Create a sample Songs array that includes the new Song
			var sampleSongs = [sampleSong];

			// Set GET response
			$httpBackend.expectGET('songs').respond(sampleSongs);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.songs).toEqualData(sampleSongs);
		}));

		it('$scope.findOne() should create an array with one Song object fetched from XHR using a songId URL parameter', inject(function(Songs) {
			// Define a sample Song object
			var sampleSong = new Songs({
				name: 'New Song'
			});

			// Set the URL parameter
			$stateParams.songId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/songs\/([0-9a-fA-F]{24})$/).respond(sampleSong);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.song).toEqualData(sampleSong);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Songs) {
			// Create a sample Song object
			var sampleSongPostData = new Songs({
				name: 'New Song'
			});

			// Create a sample Song response
			var sampleSongResponse = new Songs({
				_id: '525cf20451979dea2c000001',
				name: 'New Song'
			});

			// Fixture mock form input values
			scope.name = 'New Song';

			// Set POST response
			$httpBackend.expectPOST('songs', sampleSongPostData).respond(sampleSongResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Song was created
			expect($location.path()).toBe('/songs/' + sampleSongResponse._id);
		}));

		it('$scope.update() should update a valid Song', inject(function(Songs) {
			// Define a sample Song put data
			var sampleSongPutData = new Songs({
				_id: '525cf20451979dea2c000001',
				name: 'New Song'
			});

			// Mock Song in scope
			scope.song = sampleSongPutData;

			// Set PUT response
			$httpBackend.expectPUT(/songs\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/songs/' + sampleSongPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid songId and remove the Song from the scope', inject(function(Songs) {
			// Create new Song object
			var sampleSong = new Songs({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Songs array and include the Song
			scope.songs = [sampleSong];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/songs\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleSong);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.songs.length).toBe(0);
		}));
	});
}());