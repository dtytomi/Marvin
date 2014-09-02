'use strict';
// Init the application configuration module for AngularJS application
var ApplicationConfiguration = function () {
    // Init module configuration options
    var applicationModuleName = 'keyz-beat';
    var applicationModuleVendorDependencies = [
        'ngResource',
        'ngAnimate',
        'ngTouch',
        'ui.router',
        'ui.bootstrap',
        'ui.utils',
        'angularFileUpload'
      ];
    // Add a new vertical module
    var registerModule = function (moduleName, dependencies) {
      // Create angular module
      angular.module(moduleName, dependencies || []);
      // Add the module to the AngularJS configuration file
      angular.module(applicationModuleName).requires.push(moduleName);
    };
    return {
      applicationModuleName: applicationModuleName,
      applicationModuleVendorDependencies: applicationModuleVendorDependencies,
      registerModule: registerModule
    };
  }();'use strict';
//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);
// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config([
  '$locationProvider',
  function ($locationProvider) {
    $locationProvider.hashPrefix('!');
  }
]);
//Then define the init function for starting up the application
angular.element(document).ready(function () {
  //Fixing facebook bug with redirect
  if (window.location.hash === '#_=_')
    window.location.hash = '#!';
  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});'use strict';
// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');/*
 * Cloud 9 Carousel 2.0
 *   Cleaned up, refactored, and improved version of CloudCarousel
 *
 * See the demo and get the latest version on GitHub:
 *   http://specious.github.io/cloud9carousel/
 *
 * Copyright (c) 2014 by Ildar Sagdejev ( http://twitter.com/tknomad )
 * Copyright (c) 2011 by R. Cecco ( http://www.professorcloud.com )
 * MIT License
 *
 * Please retain this copyright header in all versions of the software
 *
 * Requires:
 *  - jQuery 1.3.0 or later -OR- Zepto 1.1.1 or later
 *
 * Optional (jQuery only):
 *  - Reflection support via reflection.js plugin by Christophe Beyls
 *     http://www.digitalia.be/software/reflectionjs-for-jquery
 *  - Mousewheel support via mousewheel plugin
 *     http://plugins.jquery.com/mousewheel/
 */
;
(function ($) {
  //
  // Detect CSS transform support
  //
  var transform = function () {
      var vendors = [
          'webkit',
          'moz',
          'ms'
        ];
      var style = document.createElement('div').style;
      var trans = 'transform' in style ? 'transform' : undefined;
      for (var i = 0, count = vendors.length; i < count; i++) {
        var prop = vendors[i] + 'Transform';
        if (prop in style) {
          trans = prop;
          break;
        }
      }
      return trans;
    }();
  var Item = function (element, options) {
    element.item = this;
    this.element = element;
    if (element.tagName === 'IMG') {
      this.fullWidth = element.width;
      this.fullHeight = element.height;
    } else {
      element.style.display = 'inline-block';
      this.fullWidth = element.offsetWidth;
      this.fullHeight = element.offsetHeight;
    }
    element.style.position = 'absolute';
    if (options.mirror && this.element.tagName === 'IMG') {
      // Wrap image in a div together with its generated reflection
      this.reflection = $(element).reflect(options.mirror).next()[0];
      var $reflection = $(this.reflection);
      this.reflection.fullHeight = $reflection.height();
      $reflection.css('margin-top', options.mirror.gap + 'px');
      $reflection.css('width', '100%');
      element.style.width = '100%';
      // The item element now contains the image and reflection
      this.element = this.element.parentNode;
      this.element.item = this;
      this.element.alt = element.alt;
      this.element.title = element.title;
    }
    if (transform && options.transforms)
      this.element.style[transform + 'Origin'] = '0 0';
    this.moveTo = function (x, y, scale) {
      this.width = this.fullWidth * scale;
      this.height = this.fullHeight * scale;
      this.x = x;
      this.y = y;
      this.scale = scale;
      var style = this.element.style;
      style.zIndex = '' + scale * 100 | 0;
      if (transform && options.transforms) {
        style[transform] = 'translate(' + x + 'px, ' + y + 'px) scale(' + scale + ')';
      } else {
        // The gap between the image and its reflection doesn't resize automatically
        if (options.mirror && this.element.tagName === 'IMG')
          this.reflection.style.marginTop = options.mirror.gap * scale + 'px';
        style.width = this.width + 'px';
        style.left = x + 'px';
        style.top = y + 'px';
      }
    };
  };
  var time = function () {
      return !window.performance || !window.performance.now ? function () {
        return +new Date();
      } : function () {
        return performance.now();
      };
    }();
  //
  // Detect requestAnimationFrame() support
  //
  // Support legacy browsers:
  //   http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
  //
  var cancelFrame = window.cancelAnimationFrame || window.cancelRequestAnimationFrame;
  var requestFrame = window.requestAnimationFrame;
  (function () {
    var vendors = [
        'webkit',
        'moz',
        'ms'
      ];
    for (var i = 0, count = vendors.length; i < count && !cancelFrame; i++) {
      cancelFrame = window[vendors[i] + 'CancelAnimationFrame'] || window[vendors[i] + 'CancelRequestAnimationFrame'];
      requestFrame = requestFrame && window[vendors[i] + 'RequestAnimationFrame'];
    }
  }());
  var Carousel = function (element, options) {
    var self = this;
    var $container = $(element);
    this.items = [];
    this.xOrigin = options.xOrigin === null ? $container.width() * 0.5 : options.xOrigin;
    this.yOrigin = options.yOrigin === null ? $container.height() * 0.1 : options.yOrigin;
    this.xRadius = options.xRadius === null ? $container.width() / 2.3 : options.xRadius;
    this.yRadius = options.yRadius === null ? $container.height() / 6 : options.yRadius;
    this.farScale = options.farScale;
    this.rotation = this.destRotation = Math.PI / 2;
    // start with the first item positioned in front
    this.speed = options.speed;
    this.smooth = options.smooth;
    this.fps = options.fps;
    this.timer = 0;
    this.autoPlayAmount = options.autoPlay;
    this.autoPlayDelay = options.autoPlayDelay;
    this.autoPlayTimer = 0;
    this.onLoaded = options.onLoaded;
    this.onRendered = options.onRendered;
    this.itemOptions = { transforms: options.transforms };
    if (options.mirror) {
      this.itemOptions.mirror = $.extend({ gap: 2 }, options.mirror);
    }
    $container.css({
      position: 'relative',
      overflow: 'hidden'
    });
    // Rotation:
    //  *      0 : right
    //  *   Pi/2 : front
    //  *   Pi   : left
    //  * 3 Pi/2 : back
    this.rotateItem = function (itemIndex, rotation) {
      var item = this.items[itemIndex];
      var sin = Math.sin(rotation);
      var farScale = this.farScale;
      var scale = farScale + (1 - farScale) * (sin + 1) * 0.5;
      item.moveTo(this.xOrigin + scale * (Math.cos(rotation) * this.xRadius - item.fullWidth * 0.5), this.yOrigin + scale * sin * this.yRadius, scale);
    };
    this.render = function () {
      var count = this.items.length;
      var spacing = 2 * Math.PI / count;
      var radians = this.rotation;
      for (var i = 0; i < count; i++) {
        this.rotateItem(i, radians);
        radians += spacing;
      }
      if (typeof this.onRendered === 'function')
        this.onRendered(this);
    };
    this.playFrame = function () {
      var rem = self.destRotation - self.rotation;
      var now = time();
      var dt = (now - self.lastTime) * 0.002;
      self.lastTime = now;
      if (Math.abs(rem) < 0.003) {
        self.rotation = self.destRotation;
        self.pause();
      } else {
        // Rotate asymptotically closer to the destination
        self.rotation = self.destRotation - rem / (1 + self.speed * dt);
        self.scheduleNextFrame();
      }
      self.render();
    };
    this.scheduleNextFrame = function () {
      this.lastTime = time();
      this.timer = this.smooth && cancelFrame ? requestFrame(self.playFrame) : setTimeout(self.playFrame, 1000 / this.fps);
    };
    this.itemsRotated = function () {
      return this.items.length * (Math.PI / 2 - this.rotation) / (2 * Math.PI);
    };
    this.floatIndex = function () {
      var count = this.items.length;
      var floatIndex = this.itemsRotated() % count;
      // Make sure float-index is positive
      return floatIndex < 0 ? floatIndex + count : floatIndex;
    };
    this.nearestIndex = function () {
      return Math.round(this.floatIndex()) % this.items.length;
    };
    this.nearestItem = function () {
      return this.items[this.nearestIndex()];
    };
    this.play = function () {
      if (this.timer === 0)
        this.scheduleNextFrame();
    };
    this.pause = function () {
      this.smooth && cancelFrame ? cancelFrame(this.timer) : clearTimeout(this.timer);
      this.timer = 0;
    };
    //
    // Spin the carousel.  Count is the number (+-) of carousel items to rotate
    //
    this.go = function (count) {
      this.destRotation += 2 * Math.PI / this.items.length * count;
      this.play();
    };
    this.deactivate = function () {
      this.pause();
      clearInterval(this.autoPlayTimer);
      options.buttonLeft.unbind('click');
      options.buttonRight.unbind('click');
      $container.unbind('.cloud9');
    };
    this.autoPlay = function () {
      this.autoPlayTimer = setInterval(function () {
        self.go(self.autoPlayAmount);
      }, this.autoPlayDelay);
    };
    this.enableAutoPlay = function () {
      // Stop auto-play on mouse over
      $container.bind('mouseover.cloud9', function () {
        clearInterval(self.autoPlayTimer);
      });
      // Resume auto-play when mouse leaves the container
      $container.bind('mouseout.cloud9', function () {
        self.autoPlay();
      });
      this.autoPlay();
    };
    this.bindControls = function () {
      options.buttonLeft.bind('click', function () {
        self.go(-1);
        return false;
      });
      options.buttonRight.bind('click', function () {
        self.go(1);
        return false;
      });
      if (options.mouseWheel) {
        $container.bind('mousewheel.cloud9', function (event, delta) {
          self.go(delta > 0 ? 1 : -1);
          return false;
        });
      }
      if (options.bringToFront) {
        $container.bind('click.cloud9', function (event) {
          var hits = $(event.target).closest('.' + options.itemClass);
          if (hits.length !== 0) {
            var idx = self.items.indexOf(hits[0].item);
            var count = self.items.length;
            var diff = idx - self.floatIndex() % count;
            // Choose direction based on which way is shortest
            if (2 * Math.abs(diff) > count)
              diff += diff > 0 ? -count : count;
            self.destRotation = self.rotation;
            self.go(-diff);
          }
        });
      }
    };
    var items = $container.find('.' + options.itemClass);
    this.finishInit = function () {
      //
      // Wait until all images have completely loaded
      //
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.tagName === 'IMG' && (item.width === undefined || item.complete !== undefined && !item.complete))
          return;
      }
      clearInterval(this.initTimer);
      // Init items
      for (i = 0; i < items.length; i++)
        this.items.push(new Item(items[i], this.itemOptions));
      // Disable click-dragging of items
      $container.bind('mousedown onselectstart', function () {
        return false;
      });
      if (this.autoPlayAmount !== 0)
        this.enableAutoPlay();
      this.bindControls();
      this.render();
      if (typeof this.onLoaded === 'function')
        this.onLoaded(this);
    };
    this.initTimer = setInterval(function () {
      self.finishInit();
    }, 50);
  };
  //
  // The jQuery plugin
  //
  $.fn.Cloud9Carousel = function (options) {
    return this.each(function () {
      /* For full list of options see the README */
      options = $.extend({
        xOrigin: null,
        yOrigin: null,
        xRadius: null,
        yRadius: null,
        farScale: 0.5,
        transforms: true,
        smooth: true,
        fps: 30,
        speed: 4,
        autoPlay: 0,
        autoPlayDelay: 4000,
        bringToFront: false,
        itemClass: 'cloud9-item',
        handle: 'carousel'
      }, options);
      $(this).data(options.handle, new Carousel(this, options));
    });
  };
}(window.jQuery || window.Zepto));/*!
	reflection.js for jQuery v1.12
	(c) 2006-2013 Christophe Beyls <http://www.digitalia.be>
	MIT-style license.
*/
;
(function ($) {
  $.fn.reflect = function (options) {
    options = $.extend({
      height: 1 / 3,
      opacity: 0.5
    }, options);
    return this.unreflect().each(function () {
      var img = this;
      if (/^img$/i.test(img.tagName)) {
        function doReflect() {
          var imageWidth = img.width, imageHeight = img.height, reflection, reflectionHeight, wrapper, context, gradient;
          reflectionHeight = Math.floor(options.height > 1 ? Math.min(imageHeight, options.height) : imageHeight * options.height);
          reflection = $('<canvas />')[0];
          if (reflection.getContext) {
            context = reflection.getContext('2d');
            try {
              $(reflection).attr({
                width: imageWidth,
                height: reflectionHeight
              });
              context.save();
              context.translate(0, imageHeight - 1);
              context.scale(1, -1);
              context.drawImage(img, 0, 0, imageWidth, imageHeight);
              context.restore();
              context.globalCompositeOperation = 'destination-out';
              gradient = context.createLinearGradient(0, 0, 0, reflectionHeight);
              gradient.addColorStop(0, 'rgba(255, 255, 255, ' + (1 - options.opacity) + ')');
              gradient.addColorStop(1, 'rgba(255, 255, 255, 1.0)');
              context.fillStyle = gradient;
              context.rect(0, 0, imageWidth, reflectionHeight);
              context.fill();
            } catch (e) {
              return;
            }
          } else {
            if (!window.ActiveXObject)
              return;
            reflection = $('<img />').attr('src', img.src).css({
              width: imageWidth,
              height: imageHeight,
              marginBottom: reflectionHeight - imageHeight,
              filter: 'FlipV progid:DXImageTransform.Microsoft.Alpha(Opacity=' + options.opacity * 100 + ', FinishOpacity=0, Style=1, StartX=0, StartY=0, FinishX=0, FinishY=' + reflectionHeight / imageHeight * 100 + ')'
            })[0];
          }
          $(reflection).css({
            display: 'block',
            border: 0
          });
          wrapper = $(/^a$/i.test(img.parentNode.tagName) ? '<span />' : '<div />').insertAfter(img).append([
            img,
            reflection
          ])[0];
          wrapper.className = img.className;
          $(img).data('reflected', wrapper.style.cssText = img.style.cssText);
          $(wrapper).css({
            width: imageWidth,
            height: imageHeight + reflectionHeight,
            overflow: 'hidden'
          });
          img.style.cssText = 'display: block; border: 0px';
          img.className = 'reflected';
        }
        if (img.complete)
          doReflect();
        else
          $(img).load(doReflect);
      }
    });
  };
  $.fn.unreflect = function () {
    return this.unbind('load').each(function () {
      var img = this, reflected = $(this).data('reflected'), wrapper;
      if (reflected !== undefined) {
        wrapper = img.parentNode;
        img.className = wrapper.className;
        img.style.cssText = reflected;
        $(img).data('reflected', null);
        wrapper.parentNode.replaceChild(img, wrapper);
      }
    });
  };
}(window.jQuery || window.Zepto));(function () {
  $(document).ready(function () {
    var options = {
        yOrigin: 42,
        yRadius: 48,
        mirror: {
          gap: 12,
          height: 0.2
        },
        buttonLeft: $('.nav > .left'),
        buttonRight: $('.nav > .right'),
        autoPlay: 1,
        bringToFront: true,
        itemClass: 'cloud9-item',
        handle: 'carousel',
        onRendered: showcaseUpdated,
        onLoaded: function () {
          showcase.css('visibility', 'visible');
          showcase.css('display', 'none');
          showcase.fadeIn(1500);
        }
      };
    var showcase = $('#showcase').Cloud9Carousel(options);
    function showcaseUpdated(showcase) {
      var title = $('#item-title').html($(showcase.nearestItem()).attr('alt'));
      var c = Math.cos(showcase.floatIndex() % 1 * 2 * Math.PI);
      title.css('opacity', 0.5 + 0.5 * c);
    }
    // Simulate physical button click effect
    $('.nav > button').click(function (e) {
      var b = $(e.target).addClass('down');
      setTimeout(function () {
        b.removeClass('down');
      }, 80);
    });
    $(document).keydown(function (e) {
      switch (e.keyCode) {
      /* left arrow */
      case 37:
        $('.nav > .left').click();
        break;
      /* right arrow */
      case 39:
        $('.nav > .right').click();
      }
    });
  });
}());'use strict';
// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('songs');'use strict';
// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');'use strict';
// Setting up route
angular.module('core').config([
  '$stateProvider',
  '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    // Redirect to home view when route not found
    $urlRouterProvider.otherwise('/');
    // Home state routing
    $stateProvider.state('home', {
      url: '/',
      templateUrl: 'modules/core/views/home.client.view.html'
    });
  }
]);'use strict';
angular.module('core').controller('HeaderController', [
  '$scope',
  'Authentication',
  'Menus',
  function ($scope, Authentication, Menus) {
    $scope.authentication = Authentication;
    $scope.isCollapsed = false;
    $scope.menu = Menus.getMenu('topbar');
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };
    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });
  }
]);'use strict';
angular.module('core').controller('HomeController', [
  '$scope',
  'Authentication',
  function ($scope, Authentication) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
  }
]);/*
 * Cloud 9 Carousel 2.0
 *   Cleaned up, refactored, and improved version of CloudCarousel
 *
 * See the demo and get the latest version on GitHub:
 *   http://specious.github.io/cloud9carousel/
 *
 * Copyright (c) 2014 by Ildar Sagdejev ( http://twitter.com/tknomad )
 * Copyright (c) 2011 by R. Cecco ( http://www.professorcloud.com )
 * MIT License
 *
 * Please retain this copyright header in all versions of the software
 *
 * Requires:
 *  - jQuery 1.3.0 or later -OR- Zepto 1.1.1 or later
 *
 * Optional (jQuery only):
 *  - Reflection support via reflection.js plugin by Christophe Beyls
 *     http://www.digitalia.be/software/reflectionjs-for-jquery
 *  - Mousewheel support via mousewheel plugin
 *     http://plugins.jquery.com/mousewheel/
 */
;
(function ($) {
  //
  // Detect CSS transform support
  //
  var transform = function () {
      var vendors = [
          'webkit',
          'moz',
          'ms'
        ];
      var style = document.createElement('div').style;
      var trans = 'transform' in style ? 'transform' : undefined;
      for (var i = 0, count = vendors.length; i < count; i++) {
        var prop = vendors[i] + 'Transform';
        if (prop in style) {
          trans = prop;
          break;
        }
      }
      return trans;
    }();
  var Item = function (element, options) {
    element.item = this;
    this.element = element;
    if (element.tagName === 'IMG') {
      this.fullWidth = element.width;
      this.fullHeight = element.height;
    } else {
      element.style.display = 'inline-block';
      this.fullWidth = element.offsetWidth;
      this.fullHeight = element.offsetHeight;
    }
    element.style.position = 'absolute';
    if (options.mirror && this.element.tagName === 'IMG') {
      // Wrap image in a div together with its generated reflection
      this.reflection = $(element).reflect(options.mirror).next()[0];
      var $reflection = $(this.reflection);
      this.reflection.fullHeight = $reflection.height();
      $reflection.css('margin-top', options.mirror.gap + 'px');
      $reflection.css('width', '100%');
      element.style.width = '100%';
      // The item element now contains the image and reflection
      this.element = this.element.parentNode;
      this.element.item = this;
      this.element.alt = element.alt;
      this.element.title = element.title;
    }
    if (transform && options.transforms)
      this.element.style[transform + 'Origin'] = '0 0';
    this.moveTo = function (x, y, scale) {
      this.width = this.fullWidth * scale;
      this.height = this.fullHeight * scale;
      this.x = x;
      this.y = y;
      this.scale = scale;
      var style = this.element.style;
      style.zIndex = '' + scale * 100 | 0;
      if (transform && options.transforms) {
        style[transform] = 'translate(' + x + 'px, ' + y + 'px) scale(' + scale + ')';
      } else {
        // The gap between the image and its reflection doesn't resize automatically
        if (options.mirror && this.element.tagName === 'IMG')
          this.reflection.style.marginTop = options.mirror.gap * scale + 'px';
        style.width = this.width + 'px';
        style.left = x + 'px';
        style.top = y + 'px';
      }
    };
  };
  var time = function () {
      return !window.performance || !window.performance.now ? function () {
        return +new Date();
      } : function () {
        return performance.now();
      };
    }();
  //
  // Detect requestAnimationFrame() support
  //
  // Support legacy browsers:
  //   http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
  //
  var cancelFrame = window.cancelAnimationFrame || window.cancelRequestAnimationFrame;
  var requestFrame = window.requestAnimationFrame;
  (function () {
    var vendors = [
        'webkit',
        'moz',
        'ms'
      ];
    for (var i = 0, count = vendors.length; i < count && !cancelFrame; i++) {
      cancelFrame = window[vendors[i] + 'CancelAnimationFrame'] || window[vendors[i] + 'CancelRequestAnimationFrame'];
      requestFrame = requestFrame && window[vendors[i] + 'RequestAnimationFrame'];
    }
  }());
  var Carousel = function (element, options) {
    var self = this;
    var $container = $(element);
    this.items = [];
    this.xOrigin = options.xOrigin === null ? $container.width() * 0.5 : options.xOrigin;
    this.yOrigin = options.yOrigin === null ? $container.height() * 0.1 : options.yOrigin;
    this.xRadius = options.xRadius === null ? $container.width() / 2.3 : options.xRadius;
    this.yRadius = options.yRadius === null ? $container.height() / 6 : options.yRadius;
    this.farScale = options.farScale;
    this.rotation = this.destRotation = Math.PI / 2;
    // start with the first item positioned in front
    this.speed = options.speed;
    this.smooth = options.smooth;
    this.fps = options.fps;
    this.timer = 0;
    this.autoPlayAmount = options.autoPlay;
    this.autoPlayDelay = options.autoPlayDelay;
    this.autoPlayTimer = 0;
    this.onLoaded = options.onLoaded;
    this.onRendered = options.onRendered;
    this.itemOptions = { transforms: options.transforms };
    if (options.mirror) {
      this.itemOptions.mirror = $.extend({ gap: 2 }, options.mirror);
    }
    $container.css({
      position: 'relative',
      overflow: 'hidden'
    });
    // Rotation:
    //  *      0 : right
    //  *   Pi/2 : front
    //  *   Pi   : left
    //  * 3 Pi/2 : back
    this.rotateItem = function (itemIndex, rotation) {
      var item = this.items[itemIndex];
      var sin = Math.sin(rotation);
      var farScale = this.farScale;
      var scale = farScale + (1 - farScale) * (sin + 1) * 0.5;
      item.moveTo(this.xOrigin + scale * (Math.cos(rotation) * this.xRadius - item.fullWidth * 0.5), this.yOrigin + scale * sin * this.yRadius, scale);
    };
    this.render = function () {
      var count = this.items.length;
      var spacing = 2 * Math.PI / count;
      var radians = this.rotation;
      for (var i = 0; i < count; i++) {
        this.rotateItem(i, radians);
        radians += spacing;
      }
      if (typeof this.onRendered === 'function')
        this.onRendered(this);
    };
    this.playFrame = function () {
      var rem = self.destRotation - self.rotation;
      var now = time();
      var dt = (now - self.lastTime) * 0.002;
      self.lastTime = now;
      if (Math.abs(rem) < 0.003) {
        self.rotation = self.destRotation;
        self.pause();
      } else {
        // Rotate asymptotically closer to the destination
        self.rotation = self.destRotation - rem / (1 + self.speed * dt);
        self.scheduleNextFrame();
      }
      self.render();
    };
    this.scheduleNextFrame = function () {
      this.lastTime = time();
      this.timer = this.smooth && cancelFrame ? requestFrame(self.playFrame) : setTimeout(self.playFrame, 1000 / this.fps);
    };
    this.itemsRotated = function () {
      return this.items.length * (Math.PI / 2 - this.rotation) / (2 * Math.PI);
    };
    this.floatIndex = function () {
      var count = this.items.length;
      var floatIndex = this.itemsRotated() % count;
      // Make sure float-index is positive
      return floatIndex < 0 ? floatIndex + count : floatIndex;
    };
    this.nearestIndex = function () {
      return Math.round(this.floatIndex()) % this.items.length;
    };
    this.nearestItem = function () {
      return this.items[this.nearestIndex()];
    };
    this.play = function () {
      if (this.timer === 0)
        this.scheduleNextFrame();
    };
    this.pause = function () {
      this.smooth && cancelFrame ? cancelFrame(this.timer) : clearTimeout(this.timer);
      this.timer = 0;
    };
    //
    // Spin the carousel.  Count is the number (+-) of carousel items to rotate
    //
    this.go = function (count) {
      this.destRotation += 2 * Math.PI / this.items.length * count;
      this.play();
    };
    this.deactivate = function () {
      this.pause();
      clearInterval(this.autoPlayTimer);
      options.buttonLeft.unbind('click');
      options.buttonRight.unbind('click');
      $container.unbind('.cloud9');
    };
    this.autoPlay = function () {
      this.autoPlayTimer = setInterval(function () {
        self.go(self.autoPlayAmount);
      }, this.autoPlayDelay);
    };
    this.enableAutoPlay = function () {
      // Stop auto-play on mouse over
      $container.bind('mouseover.cloud9', function () {
        clearInterval(self.autoPlayTimer);
      });
      // Resume auto-play when mouse leaves the container
      $container.bind('mouseout.cloud9', function () {
        self.autoPlay();
      });
      this.autoPlay();
    };
    this.bindControls = function () {
      options.buttonLeft.bind('click', function () {
        self.go(-1);
        return false;
      });
      options.buttonRight.bind('click', function () {
        self.go(1);
        return false;
      });
      if (options.mouseWheel) {
        $container.bind('mousewheel.cloud9', function (event, delta) {
          self.go(delta > 0 ? 1 : -1);
          return false;
        });
      }
      if (options.bringToFront) {
        $container.bind('click.cloud9', function (event) {
          var hits = $(event.target).closest('.' + options.itemClass);
          if (hits.length !== 0) {
            var idx = self.items.indexOf(hits[0].item);
            var count = self.items.length;
            var diff = idx - self.floatIndex() % count;
            // Choose direction based on which way is shortest
            if (2 * Math.abs(diff) > count)
              diff += diff > 0 ? -count : count;
            self.destRotation = self.rotation;
            self.go(-diff);
          }
        });
      }
    };
    var items = $container.find('.' + options.itemClass);
    this.finishInit = function () {
      //
      // Wait until all images have completely loaded
      //
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.tagName === 'IMG' && (item.width === undefined || item.complete !== undefined && !item.complete))
          return;
      }
      clearInterval(this.initTimer);
      // Init items
      for (i = 0; i < items.length; i++)
        this.items.push(new Item(items[i], this.itemOptions));
      // Disable click-dragging of items
      $container.bind('mousedown onselectstart', function () {
        return false;
      });
      if (this.autoPlayAmount !== 0)
        this.enableAutoPlay();
      this.bindControls();
      this.render();
      if (typeof this.onLoaded === 'function')
        this.onLoaded(this);
    };
    this.initTimer = setInterval(function () {
      self.finishInit();
    }, 50);
  };
  //
  // The jQuery plugin
  //
  $.fn.Cloud9Carousel = function (options) {
    return this.each(function () {
      /* For full list of options see the README */
      options = $.extend({
        xOrigin: null,
        yOrigin: null,
        xRadius: null,
        yRadius: null,
        farScale: 0.5,
        transforms: true,
        smooth: true,
        fps: 30,
        speed: 4,
        autoPlay: 0,
        autoPlayDelay: 4000,
        bringToFront: false,
        itemClass: 'cloud9-item',
        handle: 'carousel'
      }, options);
      $(this).data(options.handle, new Carousel(this, options));
    });
  };
}(window.jQuery || window.Zepto));'use strict';
//Menu service used for managing  menus
angular.module('core').service('Menus', [function () {
    // Define a set of default roles
    this.defaultRoles = ['*'];
    // Define the menus object
    this.menus = {};
    // A private function for rendering decision 
    var shouldRender = function (user) {
      if (user) {
        if (!!~this.roles.indexOf('*')) {
          return true;
        } else {
          for (var userRoleIndex in user.roles) {
            for (var roleIndex in this.roles) {
              if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
                return true;
              }
            }
          }
        }
      } else {
        return this.isPublic;
      }
      return false;
    };
    // Validate menu existance
    this.validateMenuExistance = function (menuId) {
      if (menuId && menuId.length) {
        if (this.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exists');
        }
      } else {
        throw new Error('MenuId was not provided');
      }
      return false;
    };
    // Get the menu object by menu id
    this.getMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Return the menu object
      return this.menus[menuId];
    };
    // Add new menu object by menu id
    this.addMenu = function (menuId, isPublic, roles) {
      // Create the new menu
      this.menus[menuId] = {
        isPublic: isPublic || false,
        roles: roles || this.defaultRoles,
        items: [],
        shouldRender: shouldRender
      };
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Return the menu object
      delete this.menus[menuId];
    };
    // Add menu item object
    this.addMenuItem = function (menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Push new menu item
      this.menus[menuId].items.push({
        title: menuItemTitle,
        link: menuItemURL,
        menuItemType: menuItemType || 'item',
        menuItemClass: menuItemType,
        uiRoute: menuItemUIRoute || '/' + menuItemURL,
        isPublic: isPublic === null || typeof isPublic === 'undefined' ? this.menus[menuId].isPublic : isPublic,
        roles: roles === null || typeof roles === 'undefined' ? this.menus[menuId].roles : roles,
        position: position || 0,
        items: [],
        shouldRender: shouldRender
      });
      // Return the menu object
      return this.menus[menuId];
    };
    // Add submenu item object
    this.addSubMenuItem = function (menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
          // Push new submenu item
          this.menus[menuId].items[itemIndex].items.push({
            title: menuItemTitle,
            link: menuItemURL,
            uiRoute: menuItemUIRoute || '/' + menuItemURL,
            isPublic: isPublic === null || typeof isPublic === 'undefined' ? this.menus[menuId].items[itemIndex].isPublic : isPublic,
            roles: roles === null || typeof roles === 'undefined' ? this.menus[menuId].items[itemIndex].roles : roles,
            position: position || 0,
            shouldRender: shouldRender
          });
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeMenuItem = function (menuId, menuItemURL) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
          this.menus[menuId].items.splice(itemIndex, 1);
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeSubMenuItem = function (menuId, submenuItemURL) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
          if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
            this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    //Adding the topbar menu
    this.addMenu('topbar');
  }]);'use strict';
// Configuring the Articles module
angular.module('songs').run([
  'Menus',
  function (Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', 'Songs', 'songs', 'dropdown', '/songs(/create)?');
    Menus.addSubMenuItem('topbar', 'songs', 'List Songs', 'songs');
    Menus.addSubMenuItem('topbar', 'songs', 'New Song', 'songs/create');
  }
]);'use strict';
//Setting up route
angular.module('songs').config([
  '$stateProvider',
  function ($stateProvider) {
    // Songs state routing
    $stateProvider.state('listSongs', {
      url: '/songs',
      templateUrl: 'modules/songs/views/list-songs.client.view.html'
    }).state('createSong', {
      url: '/songs/create',
      templateUrl: 'modules/songs/views/create-song.client.view.html'
    }).state('viewSong', {
      url: '/songs/:songId',
      templateUrl: 'modules/songs/views/view-song.client.view.html'
    }).state('listSongsByGenre', {
      url: '/songs/findByGenre/:genre',
      templateUrl: 'modules/songs/views/list-songs.client.view.html'
    }).state('editSong', {
      url: '/songs/:songId/edit',
      templateUrl: 'modules/songs/views/edit-song.client.view.html'
    });
  }
]);'use strict';
// Songs controller
angular.module('songs').controller('SongsController', [
  '$scope',
  '$upload',
  '$stateParams',
  '$state',
  '$location',
  'Authentication',
  'Songs',
  function ($scope, $upload, $stateParams, $state, $location, Authentication, Songs) {
    $scope.authentication = Authentication;
    // Create new Song
    $scope.create = function () {
      // Create new Song object
      var song = new Songs($scope.song);
      $scope.song.rating = $scope.rate;
      // Redirect after save
      $scope.upload = $upload.upload({
        url: '/songs',
        method: 'POST',
        data: $scope.song,
        file: $scope.files[0]
      }).success(function (response) {
        $location.path('songs/' + response._id);
      }).error(function (err) {
        console.log('Error uploading file: ' + err.message || err);
      });
    };
    // Upload Image
    $scope.onFileSelect = function ($files) {
      $scope.files = $files;
    };
    // Remove existing Song
    $scope.remove = function (song) {
      if (song) {
        song.$remove();
        for (var i in $scope.songs) {
          if ($scope.songs[i] === song) {
            $scope.songs.splice(i, 1);
          }
        }
      } else {
        $scope.song.$remove(function () {
          $location.path('songs');
        });
      }
    };
    // Update existing Song
    $scope.update = function () {
      var song = $scope.song;
      song.$update(function () {
        $location.path('songs/' + song._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    // Find a list of Songs
    $scope.find = function () {
      console.log($stateParams);
      if ($stateParams.genre) {
        $scope.songs = Songs.query({ genre: $stateParams.genre });
      } else {
        $scope.songs = Songs.query();
      }
    };
    // Find existing Song
    $scope.findOne = function () {
      $scope.song = Songs.get({ songId: $stateParams.songId });
    };
    //	Rating
    $scope.rating = 5;
    $scope.rate = 0;
    $scope.rateFunction = function (rating) {
      $scope.rate = rating;
    };
    // Search
    $scope.onSearch = function (name) {
      $state.go('listSongsByGenre', { genre: name });
    };
  }
]).directive('starRating', function () {
  return {
    restrict: 'A',
    template: '<ul class="rating">' + ' <li ng-repeat="star in stars" ng-class="star" ng-click="toggle($index)">' + '\u2605' + '</li>' + '</ul>',
    scope: {
      ratingValue: '=',
      max: '=',
      onRatingSelected: '&'
    },
    link: function postLink(scope, element, attrs) {
      // Star rating directive logic
      // ...
      var updateStars = function () {
        scope.stars = [];
        for (var i = 0; i < scope.max; i++) {
          scope.stars.push({ filled: i < scope.ratingValue });
        }
      };
      var updateStars = function () {
        scope.stars = [];
        for (var i = 0; i < scope.max; i++) {
          scope.stars.push({ filled: i < scope.ratingValue });
        }
      };
      scope.toggle = function (index) {
        scope.ratingValue = index + 1;
        scope.onRatingSelected({ rating: index + 1 });
      };
      scope.$watch('ratingValue', function (oldVal, newVal) {
        if (newVal) {
          updateStars();
        }
      });
    }
  };
});'use strict';
//Songs service used to communicate Songs REST endpoints
angular.module('songs').factory('Songs', [
  '$resource',
  function ($resource) {
    return $resource('/songs/:songId', { songId: '@_id' }, { update: { method: 'PUT' } });
  }
]);'use strict';
// Config HTTP Error Handling
angular.module('users').config([
  '$httpProvider',
  function ($httpProvider) {
    // Set the httpProvider "not authorized" interceptor
    $httpProvider.interceptors.push([
      '$q',
      '$location',
      'Authentication',
      function ($q, $location, Authentication) {
        return {
          responseError: function (rejection) {
            switch (rejection.status) {
            case 401:
              // Deauthenticate the global user
              Authentication.user = null;
              // Redirect to signin page
              $location.path('signin');
              break;
            case 403:
              // Add unauthorized behaviour 
              break;
            }
            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]);'use strict';
// Setting up route
angular.module('users').config([
  '$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider.state('profile', {
      url: '/settings/profile',
      templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
    }).state('password', {
      url: '/settings/password',
      templateUrl: 'modules/users/views/settings/change-password.client.view.html'
    }).state('accounts', {
      url: '/settings/accounts',
      templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
    }).state('signup', {
      url: '/signup',
      templateUrl: 'modules/users/views/authentication/signup.client.view.html'
    }).state('signin', {
      url: '/signin',
      templateUrl: 'modules/users/views/authentication/signin.client.view.html'
    }).state('forgot', {
      url: '/password/forgot',
      templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
    }).state('reset-invlaid', {
      url: '/password/reset/invalid',
      templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
    }).state('reset-success', {
      url: '/password/reset/success',
      templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
    }).state('reset', {
      url: '/password/reset/:token',
      templateUrl: 'modules/users/views/password/reset-password.client.view.html'
    });
  }
]);'use strict';
angular.module('users').controller('AuthenticationController', [
  '$scope',
  '$http',
  '$location',
  'Authentication',
  function ($scope, $http, $location, Authentication) {
    $scope.authentication = Authentication;
    // If user is signed in then redirect back home
    if ($scope.authentication.user)
      $location.path('/');
    $scope.signup = function () {
      $http.post('/auth/signup', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;
        // And redirect to the index page
        $location.path('/');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
    $scope.signin = function () {
      $http.post('/auth/signin', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;
        // And redirect to the index page
        $location.path('/');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);'use strict';
angular.module('users').controller('PasswordController', [
  '$scope',
  '$stateParams',
  '$http',
  '$location',
  'Authentication',
  function ($scope, $stateParams, $http, $location, Authentication) {
    $scope.authentication = Authentication;
    //If user is signed in then redirect back home
    if ($scope.authentication.user)
      $location.path('/');
    // Submit forgotten password account id
    $scope.askForPasswordReset = function () {
      $scope.success = $scope.error = null;
      $http.post('/auth/forgot', $scope.credentials).success(function (response) {
        // Show user success message and clear form
        $scope.credentials = null;
        $scope.success = response.message;
      }).error(function (response) {
        // Show user error message and clear form
        $scope.credentials = null;
        $scope.error = response.message;
      });
    };
    // Change user password
    $scope.resetUserPassword = function () {
      $scope.success = $scope.error = null;
      $http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.passwordDetails = null;
        // Attach user profile
        Authentication.user = response;
        // And redirect to the index page
        $location.path('/password/reset/success');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);'use strict';
angular.module('users').controller('SettingsController', [
  '$scope',
  '$http',
  '$location',
  'Users',
  'Authentication',
  function ($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;
    // If user is not signed in then redirect back home
    if (!$scope.user)
      $location.path('/');
    // Check if there are additional accounts 
    $scope.hasConnectedAdditionalSocialAccounts = function (provider) {
      for (var i in $scope.user.additionalProvidersData) {
        return true;
      }
      return false;
    };
    // Check if provider is already in use with current user
    $scope.isConnectedSocialAccount = function (provider) {
      return $scope.user.provider === provider || $scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider];
    };
    // Remove a user social account
    $scope.removeUserSocialAccount = function (provider) {
      $scope.success = $scope.error = null;
      $http.delete('/users/accounts', { params: { provider: provider } }).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.user = Authentication.user = response;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
    // Update a user profile
    $scope.updateUserProfile = function (isValid) {
      if (isValid) {
        $scope.success = $scope.error = null;
        var user = new Users($scope.user);
        user.$update(function (response) {
          $scope.success = true;
          Authentication.user = response;
        }, function (response) {
          $scope.error = response.data.message;
        });
      } else {
        $scope.submitted = true;
      }
    };
    // Change user password
    $scope.changeUserPassword = function () {
      $scope.success = $scope.error = null;
      $http.post('/users/password', $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.passwordDetails = null;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);'use strict';
// Authentication service for user variables
angular.module('users').factory('Authentication', [function () {
    var _this = this;
    _this._data = { user: window.user };
    return _this._data;
  }]);'use strict';
// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', [
  '$resource',
  function ($resource) {
    return $resource('users', {}, { update: { method: 'PUT' } });
  }
]);