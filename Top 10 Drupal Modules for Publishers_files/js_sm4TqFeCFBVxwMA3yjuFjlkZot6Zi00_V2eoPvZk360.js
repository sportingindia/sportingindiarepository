/*!
 * jQuery Video Background plugin
 * https://github.com/georgepaterson/jquery-videobackground
 *
 * Copyright 2012, George Paterson
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 */
(function ($, document, window) {
	/*
	 * Resize function.
	 * Triggered if the boolean setting 'resize' is true.
	 * It will resize the video background based on a resize event initiated on the browser window.
	 *
	 */
	"use strict";
	function resize(that) {
		var documentHeight = $(document).height(),
			windowHeight = $(window).height();
		if (that.settings.resizeTo === 'window') {
			$(that).css('height', windowHeight);
		} else {
			if (windowHeight >= documentHeight) {
				$(that).css('height', windowHeight);
			} else {
				$(that).css('height', documentHeight);
			}
		}
	}
	/*
	 * Preload function.
	 * Allows for HTML and JavaScript designated in settings to be used while the video is preloading.
	 *
	 */
	function preload(that) {
		$(that.controlbox).append(that.settings.preloadHtml);
		if (that.settings.preloadCallback) {
			(that.settings.preloadCallback).call(that);
		}
	}
	/*
	 * Play function.
	 * Can either be called through the default control interface or directly through the public method.
	 * Will set the video to play or pause depending on existing state.
	 * Requires the video to be loaded.	
	 *
	 */
	function play(that) {
		var video = that.find('video').get(0),
			controller;
		if (that.settings.controlPosition) {
			controller = $(that.settings.controlPosition).find('.ui-video-background-play a');
		} else {
			controller = that.find('.ui-video-background-play a');
		}
		if (video.paused) {
			video.play();
			controller.toggleClass('ui-icon-pause ui-icon-play').text(that.settings.controlText[1]);
		} else {
			if (video.ended) {
				video.play();
				controller.toggleClass('ui-icon-pause ui-icon-play').text(that.settings.controlText[1]);
			} else {
				video.pause();
				controller.toggleClass('ui-icon-pause ui-icon-play').text(that.settings.controlText[0]);
			}
		}
	}
	/*
	 * Mute function.
	 * Can either be called through the default control interface or directly through the public method.
	 * Will set the video to mute or unmute depending on existing state.
	 * Requires the video to be loaded.
	 *
	 */
	function mute(that) {
		var video = that.find('video').get(0),
			controller;
		if (that.settings.controlPosition) {
			controller = $(that.settings.controlPosition).find('.ui-video-background-mute a');
		} else {
			controller = that.find('.ui-video-background-mute a');
		}
		if (video.volume === 0) {
			video.volume = 1;
			controller.toggleClass('ui-icon-volume-on ui-icon-volume-off').text(that.settings.controlText[2]);
		} else {
			video.volume = 0;
			controller.toggleClass('ui-icon-volume-on ui-icon-volume-off').text(that.settings.controlText[3]);
		}
	}
	/*
	 * Loaded events function.
	 * When the video is loaded we have some default HTML and JavaScript to trigger.	
	 *
	 */
	function loadedEvents(that) {
		/*
		 * Trigger the resize method based if the browser is resized.
		 *
		 */
		if (that.settings.resize) {
			$(window).on('resize', function () {
				resize(that);
			});
		}
		/*
		 * Default play/pause control	
		 *
		 */
		that.controls.find('.ui-video-background-play a').on('click', function (event) {
			event.preventDefault();
			play(that);
		});
		/*
		 * Default mute/unmute control	
		 *
		 */
		that.controls.find('.ui-video-background-mute a').on('click', function (event) {
			event.preventDefault();
			mute(that);
		});
		/*
		 * Firefox doesn't currently use the loop attribute.
		 * Loop bound to the video ended event.
		 *
		 */
		if (that.settings.loop) {
			that.find('video').on('ended', function () {
				$(this).get(0).play();
				$(this).toggleClass('paused').text(that.settings.controlText[1]);
			});
		}
	}
	/*
	 * Loaded function.
	 * Allows for HTML and JavaScript designated in settings to be used when the video is loaded.
	 *
	 */
	function loaded(that) {
		$(that.controlbox).html(that.controls);
		loadedEvents(that);
		if (that.settings.loadedCallback) {
			(that.settings.loadedCallback).call(that);
		}
	}
	/*
	 * Public methods accessible through a string declaration equal to the method name.
	 *
	 */
	var methods = {
		/*
		 * Default initiating public method.
		 * It will created the video background, default video controls and initiate associated events. 
		 *
		 */
		init: function (options) {
			return this.each(function () {
				var that = $(this),
					compiledSource = '',
					attributes = '',
					data = that.data('video-options'),
					image,
					isArray;
				if (document.createElement('video').canPlayType) {
					that.settings = $.extend(true, {}, $.fn.videobackground.defaults, data, options);
					if (!that.settings.initialised) {
						that.settings.initialised = true;
						/*
						 * If the resize option is set.
						 * Set the height of the container to be the height of the document
						 * The video can expand in to the space using min-height: 100%;
						 *
						 */
						if (that.settings.resize) {
							resize(that);
						}
						/*
						 * Compile the different HTML5 video attributes.	
						 *
						 */
						$.each(that.settings.videoSource, function () {
							isArray = Object.prototype.toString.call(this) === '[object Array]';
							if (isArray && this[1] !== undefined) {
								compiledSource = compiledSource + '<source src="' + this[0] + '" type="' + this[1] + '">';
							} else {
								if (isArray) {
									compiledSource = compiledSource + '<source src="' + this[0] + '">';
								} else {
									compiledSource = compiledSource + '<source src="' + this + '">';
								}
							}
						});
						attributes = attributes + 'preload="' + that.settings.preload + '"';
						if (that.settings.poster) {
							attributes = attributes + ' poster="' + that.settings.poster + '"';
						}
						if (that.settings.autoplay) {
							attributes = attributes + ' autoplay="autoplay"';
						}
						if (that.settings.loop) {
							attributes = attributes + ' loop="loop"';
						}
						$(that).html('<video ' + attributes + '>' + compiledSource + '</video>');
						/*
						 * Append the control box either to the supplied that or the video background that.	
						 *
						 */
						that.controlbox = $('<div class="ui-video-background ui-widget ui-widget-content ui-corner-all"></div>');
						if (that.settings.controlPosition) {
							$(that.settings.controlPosition).append(that.controlbox);
						} else {
							$(that).append(that.controlbox);
						}
						/*
						 *	HTML string for the video controls.
						 *
						 */
						that.controls = $('<ul class="ui-video-background-controls"><li class="ui-video-background-play">'
							+ '<a class="ui-icon ui-icon-pause" href="#">' + that.settings.controlText[1] + '</a>'
							+ '</li><li class="ui-video-background-mute">'
							+ '<a class="ui-icon ui-icon-volume-on" href="#">' + that.settings.controlText[2] + '</a>'
							+ '</li></ul>');
						/*
						 * Test for HTML or JavaScript function that should be triggered while the video is attempting to load.
						 * The canplaythrough event signals when when the video can play through to the end without disruption.
						 * We use this to determine when the video is ready to play.
						 * When this happens preloaded HTML and JavaSCript should be replaced with loaded HTML and JavaSCript.
						 *
						 */
						if (that.settings.preloadHtml || that.settings.preloadCallback) {
							preload(that);
							that.find('video').on('canplaythrough', function () {
								/*
								 * Chrome doesn't currently using the autoplay attribute.
								 * Autoplay initiated through JavaScript.
								 *
								 */
								if (that.settings.autoplay) {
									that.find('video').get(0).play();
								}
								loaded(that);
							});
						} else {
							that.find('video').on('canplaythrough', function () {
								/*
								 * Chrome doesn't currently using the autoplay attribute.
								 * Autoplay initiated through JavaScript.
								 *
								 */
								if (that.settings.autoplay) {
									that.find('video').get(0).play();
								}
								loaded(that);
							});
						}
						that.data('video-options', that.settings);
					}
				} else {
					that.settings = $.extend(true, {}, $.fn.videobackground.defaults, data, options);
					if (!that.settings.initialised) {
						that.settings.initialised = true;
						if (that.settings.poster) {
							image = $('<img class="ui-video-background-poster" src="' + that.settings.poster + '">');
							that.append(image);
						}
						that.data('video-options', that.settings);
					}
				}
			});
		},
		/*
		 * Play public method.
		 * When attached to a video background it will trigger the associated video to play or pause.
		 * The event it triggeres is dependant on the existing state of the video.
		 * This method can be triggered from an event on a external that.
		 * If the that has a unique controlPosition this will have to be declared.
		 * Requires the video to be loaded first.
		 *
		 */
		play: function (options) {
			return this.each(function () {
				var that = $(this),
					data = that.data('video-options');
				that.settings = $.extend(true, {}, data, options);
				if (that.settings.initialised) {
					play(that);
					that.data('video-options', that.settings);
				}
			});
		},
		/*
		 * Mute public method.
		 * When attached to a video background it will trigger the associated video to mute or unmute.
		 * The event it triggeres is dependant on the existing state of the video.
		 * This method can be triggered from an event on a external that.
		 * If the that has a unique controlPosition this will have to be declared.
		 * Requires the video to be loaded first.
		 *
		 */
		mute: function (options) {
			return this.each(function () {
				var that = $(this),
					data = that.data('video-options');
				that.settings = $.extend(true, {}, data, options);
				if (that.settings.initialised) {
					mute(that);
					that.data('video-options', that.settings);
				}
			});
		},
		/*
		 * Resize public method.
		 * When invoked will resize the video background to the height of the document or window.
		 * The video background height affects the height of the document.
		 * Affecting the video background's ability to negatively resize.  
		 *
		 */
		resize: function (options) {
			return this.each(function () {
				var that = $(this),
					data = that.data('video-options');
				that.settings = $.extend(true, {}, data, options);
				if (that.settings.initialised) {
					resize(that);
					that.data('video-options', that.settings);
				}
			});
		},
		/*
		 * Destroy public method.
		 * Will unbind event listeners and remove HTML created by the plugin.
		 * If the that has a unique controlPosition this will have to be declared.
		 *
		 */
		destroy: function (options) {
			return this.each(function () {
				var that = $(this),
					data = that.data('video-options');
				that.settings = $.extend(true, {}, data, options);
				if (that.settings.initialised) {
					that.settings.initialised = false;
					if (document.createElement('video').canPlayType) {
						that.find('video').off('ended');
						if (that.settings.controlPosition) {
							$(that.settings.controlPosition).find('.ui-video-background-mute a').off('click');
							$(that.settings.controlPosition).find('.ui-video-background-play a').off('click');
						} else {
							that.find('.ui-video-background-mute a').off('click');
							that.find('.ui-video-background-play a').off('click');
						}
						$(window).off('resize');
						that.find('video').off('canplaythrough');
						if (that.settings.controlPosition) {
							$(that.settings.controlPosition).find('.ui-video-background').remove();
						} else {
							that.find('.ui-video-background').remove();
						}
						$('video', that).remove();
					} else {
						if (that.settings.poster) {
							that.find('.ui-video-background-poster').remove();
						}
					}
					that.removeData('video-options');
				}
			});
		}
	};
	/*
	 * The video background namespace.
	 * The gate way for the plugin.	
	 *
	 */
	$.fn.videobackground = function (method) {
		/*
		 * Allow for method calling.
		 * If not a method initialise the plugin.
		 *
		 */
		if (!this.length) {
			return this;
		}
	    if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
	    }
		if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
	    }
		$.error('Method ' +  method + ' does not exist on jQuery.videobackground');
	};
	/*
	 * Default options, can be extend by options passed to the function.
	 *
	 */
	$.fn.videobackground.defaults = {
		videoSource: [],
		poster: null,
		autoplay: true,
		preload: 'none',
		loop: false,
		controlPosition: null,
		controlText: ['Play', 'Pause', 'Mute', 'Unmute'],
		resize: true,
		preloadHtml: '',
		preloadCallback: null,
		loadedCallback: null,
		resizeTo: 'document'
	};
}(jQuery, document, window));;
/* jSticky Plugin
 * =============
 * Author: Andrew Henderson (@AndrewHenderson)
 * Date: 9/7/2012
 * Update: 02/14/2013
 * Website: http://github.com/andrewhenderson/jsticky/
 * Description: A jQuery plugin that keeps select DOM
 * element(s) in view while scrolling the page.
 */

;(function($) {

  $.fn.sticky = function(options) {

    var defaults = {
        topSpacing: 0, // No spacing by default
        zIndex: '', // No default z-index
        stopper: '.sticky-stopper' // Default stopper class, also accepts number value
      },
      settings = $.extend({}, defaults, options); // Accepts custom stopper id or class

    // Checks if custom z-index was defined
    function checkIndex() {

      if (typeof settings.zIndex == 'number') {
        return true;
      } else {
        return false;
      }
    }
    var hasIndex = checkIndex(); // True or false

    // Checks if a stopper exists in the DOM or number defined
    function checkStopper() {

      if ( 0 < $(settings.stopper).length || typeof settings.stopper === 'number' ) {
        return true;
      } else {
        return false;
      }
    }
    var hasStopper = checkStopper(); // True or false

    return this.each(function() {

      var $this          = $(this),
          thisHeight     = $this.outerHeight(),
          thisWidth      = $this.outerWidth(),
          topSpacing     = settings.topSpacing,
          zIndex         = settings.zIndex,
          pushPoint      = $this.offset().top - topSpacing, // Point at which the sticky element starts pushing
          placeholder    = $('<div></div>').width(thisWidth).height(thisHeight).addClass('sticky-placeholder'), // Cache a clone sticky element
          stopper        = settings.stopper,
          $window        = $(window);

      function stickyScroll() {

        var windowTop  = $window.scrollTop(); // Check window's scroll position
        
        if ( hasStopper && typeof stopper === 'string' ) {
          var stopperTop = $(stopper).offset().top,
              stopPoint  = (stopperTop - thisHeight) - topSpacing;
        } else if (hasStopper && typeof stopper === 'number') {
          var stopPoint = stopper;
        }

        if (pushPoint < windowTop) {
          // Create a placeholder for sticky element to occupy vertical real estate
          $this.after(placeholder).css({
            position: 'fixed',
            top: topSpacing
          });
          
          if (hasIndex) {
            $this.css({ zIndex: zIndex });
          }

          if (hasStopper) {
            if (stopPoint < windowTop) {
              var diff = (stopPoint - windowTop) + topSpacing;
              $this.css({ top: diff });
            }
          }
        } else {
          $this.css({
            position: 'static',
            top: null,
            left: null
          });

          placeholder.remove();
        }
      };

      $window.bind("scroll", stickyScroll);
    });
  };
})(jQuery);;
(function ($) {
  Drupal.behaviors.mc_sticky_sidebar = {

    attach: function (context, settings) {
      if (!$('.side-rail .fixed').length) {
        return;
      }
      var stickyTarget = $('.side-rail .fixed');
      var topOffset = 90;
      var bottomOffset = 1100;
      var defaultTop = stickyTarget.css('top').replace('px', '');
      var stickyTop = stickyTarget.offset().top;

      function adjustSidebar() {
        var windowTop = $(window).scrollTop();
        var maxFixedScrollPos = ($(document).height() - bottomOffset - topOffset);
        if (windowTop < maxFixedScrollPos) {
          if (stickyTop - 15 - topOffset < windowTop) {
            stickyTarget.attr('style', 'top:' + (windowTop - stickyTop - defaultTop + 130 + topOffset) + 'px');
          }
          else {
            stickyTarget.attr('style', 'top:' + defaultTop + 'px');
          }
        }
      }

      adjustSidebar();

      $(window).resize(function () {
        adjustSidebar();
      })
      .scroll(function () {
        adjustSidebar();
      });
    }
  };
})(jQuery);
;
/*global jQuery */
/*!
* FitText.js 1.1
*
* Copyright 2011, Dave Rupert http://daverupert.com
* Released under the WTFPL license
* http://sam.zoy.org/wtfpl/
*
* Date: Thu May 05 14:23:00 2011 -0600
*/


(function( $ ){

  $.fn.fitText = function( kompressor, options ) {

    // Setup options
    var compressor = kompressor || 1,
        settings = $.extend({
          'minFontSize' : Number.NEGATIVE_INFINITY,
          'maxFontSize' : Number.POSITIVE_INFINITY
        }, options);

    return this.each(function(){

      // Store the object
      var $this = $(this);

      // Resizer() resizes items based on the object width divided by the compressor * 10
      var resizer = function () {
        $this.css('font-size', Math.max(Math.min($this.width() / (compressor*10), parseFloat(settings.maxFontSize)), parseFloat(settings.minFontSize)));
      };

      // Call once to set.
      resizer();

      // Call on resize. Opera debounces their resize by default.
      $(window).on('resize.fittext orientationchange.fittext', resizer);

    });

  };

})( jQuery );
;
(function ($) {
  $(document).ready(function() {
    $("h1").fitText(1.1, { minFontSize: '44px', maxFontSize: '65px' });
    $(".pane-title h2").fitText(1.1, { minFontSize: '42px', maxFontSize: '54px' });
    $(".node-type-portfolio-work h1 ").fitText(1.1, { minFontSize: '22px', maxFontSize: '40px' });

  });
})(jQuery);
;
(function ($) {
  Drupal.behaviors.mc_bg_video = {
    attach: function (context, settings) {
      if ($(document).width() < 800) {
        return;
      }
      var vidTarget = $('#hero');
      $(vidTarget, context).once('mc_bg_video_content', function () {
        $(vidTarget).videobackground({
          videoSource: [
            ['https://d1l4od7sxc8nwf.cloudfront.net/sites/all/themes/mc_omega/video/mc-1.webm', 'video/webm'],
            ['https://d1l4od7sxc8nwf.cloudfront.net/sites/all/themes/mc_omega/video/mc-1.mp4', 'video/mp4'],
            ['https://d1l4od7sxc8nwf.cloudfront.net/sites/all/themes/mc_omega/video/mc-1.ogv', 'video/ogg']
          ],
          controlPosition: '#ignore',
          loop: true,
          loadedCallback: function() {
            $(this).videobackground('mute');
          }
        });
      });
    }
  };
})(jQuery);
;
(function ($) {
  Drupal.behaviors.mc_we_get_results = {
    attach: function (context, settings) {
      $('.view-id-mc_homepage_featured_services .views-row-1').wrap(
        '<a href="/services/design-theming" />');
      $('.view-id-mc_homepage_featured_services .views-row-2').wrap(
        '<a href="/services/development" />');
      $('.view-id-mc_homepage_featured_services .views-row-3').wrap(
        '<a href="/services/digital-strategy" />');
    }
  };
})(jQuery);
;
(function ($) {
  Drupal.behaviors.mc_broken_images = {
    
    attach: function () {
      $("img").error(function(){
        $(this).hide();
      });
    } 
  };
})(jQuery);
;
/*!
 * jQuery Placeholder Enhanced 1.6.5
 * Copyright (c) 2013 Denis Ciccale (@tdecs)
 * Released under MIT license
 * https://raw.github.com/dciccale/placeholder-enhanced/master/LICENSE.txt
 */
(function ($, doc) {

  // my name
  var PLUGIN_NAME = 'placeholderEnhanced';

  // if browser supports placeholder attribute,
  // use native events to show/hide placeholder
  var HAS_NATIVE_SUPPORT = 'placeholder' in doc.createElement('input') && 'placeholder' in doc.createElement('textarea');

  // events namespaces
  var EVENT = {
    FOCUS: 'focus.placeholder',
    BLUR: 'blur.placeholder'
  };

  /*
   * define defaults here as some options are needed before initialization
   * it also merges with an options object when you call the plugin
   */
  var DEFAULTS = {
    cssClass: 'placeholder',
    /*
     * normalize behaviour & style across browsers
     * (remove placeholder on focus, show on blur)
     * if false, each browser wil handle behaviour & style natively
     * i.e. in case of Chrome placeholder is still visible on focus
     */
    normalize: true
  };

  // save original jQuery .val() function
  var $val = $.fn.val;

  /*
   * handle the use of jQuery .val(), if placeholder is not supported
   * the .val() function returns the placeholder value, wrap the val
   * function to fix this, also useful when using .serialize() or any other
   * jQuery method that uses .val()
   */

  // new .val() function for unsupported browsers
  if (!HAS_NATIVE_SUPPORT) {
    $.fn.val = function () {
      var el = this[0];

      if (!el) {
        return;
      }

      // handle .val()
      if (!arguments.length && ($.nodeName(el, 'input') || $.nodeName(el, 'textarea'))) {
        return el.value === this.attr('placeholder') ? '' : el.value;

      // handle .val(''), .val(null), .val(undefined)
      } else if (!arguments[0] && this.attr('placeholder')) {
        el.value = this.addClass(DEFAULTS.cssClass).attr('placeholder');
        return this;

      // handle .val('value')
      } else {
        this.removeClass(DEFAULTS.cssClass);
        return $val.apply(this, arguments);
      }
    };

  // new .val() function for modern browsers when normalize mode is on
  } else if (HAS_NATIVE_SUPPORT && DEFAULTS.normalize) {
    $.fn.val = function () {
      var el = this[0];

      if (!el) {
        return;
      }

      // handle .val()
      if (!arguments.length) {
        return el.value;

      // handle .val(''), .val(null), .val(undefined)
      } else if (!arguments[0] && this.attr('placeholder')) {
        this.attr('placeholder', el._placeholder);
      }

      this.toggleClass(DEFAULTS.cssClass, !arguments[0]);

      // handle .val('value')
      return $val.apply(this, arguments);
    };
  }

  // Placeholder Enhanced plugin
  $.fn[PLUGIN_NAME] = function (options) {

    // merged options
    var settings = $.extend(DEFAULTS, options);

    /*
     * don't do anything if:
     * empty set
     * placeholder supported but don't want to normalize modern browsers
     */
    if (!this.length || (HAS_NATIVE_SUPPORT && !settings.normalize)) {
      return;
    }

    // check if options param is destroy method
    if (options === 'destroy') {
      // completely destroy the plugin and return
      return this
        // stay with elements that has the plugin
        .filter(function () { return $.data(this, PLUGIN_NAME); })
        // remove class
        .removeClass(settings.cssClass)
        // clean other stuff
        .each(function () {
          var el = this;
          var $el = $(el).unbind('.placeholder');
          var isPassword = (el.type === 'password');
          var placeholderTxt = $el.attr('placeholder');
          // do all this only for unsupported browsers
          if (!HAS_NATIVE_SUPPORT) {
            el.value = el.value === placeholderTxt ? '' : el.value;
            // remove fake password input
            if (isPassword) {
              showInput($el);
              $el.prev().unbind('.placeholder').remove();
            }

          // delete backup prop
          } else {
            delete el._placeholder;
          }
          // restore original jQuery .val()
          $.fn.val = $val;
          // plugin off
          $.removeData(el, PLUGIN_NAME);
        });
    }

    // copy attributes from a DOM node to a plain object to use later
    function copyAttrs(element) {
      var attrs = {};
      var exclude = ['placeholder', 'name', 'id'];
      $.each(element.attributes, function (i, attr) {
        if (attr.specified && $.inArray(attr.name, exclude) < 0) {
          attrs[attr.name] = attr.value;
        }
      });
      return attrs;
    }

    // shows specified input
    function showInput($input) {
      $input.css({position: '', left: ''});
    }

    // hides specified input
    function hideInput($input) {
      $input.css({position: 'absolute', left: '-9999em'});
    }

    return this.each(function () {

      // check if plugin already initialized
      if ($.data(this, PLUGIN_NAME)) {
        return;
      }

      // actual dom
      var el = this;
      // jQuery object
      var $el = $(el);
      // current placeholder text
      var placeholderTxt = $el.attr('placeholder');
      // passwords have different treatment
      var isPassword = (el.type === 'password');
      var setPlaceholder;
      var removePlaceholder;
      var fakePassw;

      // normalize behaviour in modern browsers
      if (HAS_NATIVE_SUPPORT && settings.normalize) {
        setPlaceholder = function () {
          if (!el.value) {
            $el.addClass(settings.cssClass).attr('placeholder', placeholderTxt);
          }
        };

        removePlaceholder = function () {
          el._placeholder = placeholderTxt;
          $el.removeAttr('placeholder').removeClass(settings.cssClass);
        };

      // placeholder support for unsupported browsers
      } else if (!HAS_NATIVE_SUPPORT) {
        setPlaceholder = function () {
          // if there is no initial value
          // or initial value is equal to placeholder (done in the $.fn.val wrapper)
          // show the placeholder
          if (!$el.val()) {
            if (isPassword) {
              showInput(fakePassw);
              hideInput($el);
            } else {
              $el.val(placeholderTxt).addClass(settings.cssClass);
            }
          } else if ($el.val() && isPassword) {
              // if there is a value already, we want to remove the fake placeholder
              // otherwise, we'll have both the fake placeholder and the actual input visible
              removePlaceholder();
          }
        };

        // remove function for inputs and textareas
        if (!isPassword) {
          removePlaceholder = function () {
            if ($el.hasClass(settings.cssClass)) {
              el.value = '';
              $el.removeClass(settings.cssClass);
            }
          };

        // and for password inputs
        } else {
          removePlaceholder = function () {
            showInput($el);
            hideInput(fakePassw);
          };

          // create a fake password input
          fakePassw = $('<input>', $.extend(copyAttrs(el), {
            'type': 'text',
            value: placeholderTxt,
            tabindex: -1 // skip tabbing
          }))
            .addClass(settings.cssClass)
            // when focus, trigger real input focus
            .bind(EVENT.FOCUS, function () {
              $el.trigger(EVENT.FOCUS);
            })
            // insert fake input
            .insertBefore($el);
        }
      }

      // bind events and trigger blur the first time
      $el
        .bind(EVENT.BLUR, setPlaceholder)
        .bind(EVENT.FOCUS, removePlaceholder)
        .trigger(EVENT.BLUR);

      // mark plugin as initialized for the current element
      $.data(el, PLUGIN_NAME, true);
    });
  };

  // auto-initialize the plugin
  $(function () {
    $('input[placeholder], textarea[placeholder]')[PLUGIN_NAME]();
  });
}(jQuery, document));;
(function ($) {
    Drupal.behaviors.mc_equal_grid_heights = {
    attach: function (context, settings) {

      var equalheight = function(container) {
        var currentTallest = 0,
            currentRowStart = 0,
            rowDivs = [],
            $el,
            topPosition = 0;

        $(container).each(function() {

          $el = $(this);
          $el.height('auto')
          topPostion = $el.position().top;

          if (currentRowStart != topPostion) {
            for (currentDiv = 0 ; currentDiv < rowDivs.length ; currentDiv++) {
              rowDivs[currentDiv].height(currentTallest);
            }
            rowDivs.length = 0; // empty the array
            currentRowStart = topPostion;
            currentTallest = $el.height();
            rowDivs.push($el);
          } else {
            rowDivs.push($el);
            currentTallest = (currentTallest < $el.height()) ? ($el.height()) : (currentTallest);
          }
          for (currentDiv = 0; currentDiv < rowDivs.length; currentDiv++) {
            rowDivs[currentDiv].height(currentTallest);
          }
        });
      }

      $(window)
      .load(function() {
        equalheight('.js-equalheights');
      })
      .resize(function(){
        equalheight('.js-equalheights');
      });

    }
  }
})(jQuery);;
(function ($) {
  Drupal.behaviors.mc_active_menu_class = {
    attach: function (context, settings) {
      var mcPath = window.location.pathname
      $('.main-menu a').each(function () {
        var mcMenuPath  = $(this).attr('href');

        if (mcPath.indexOf('event/') >= 0) {
          mcPath = '/events';
        }
        else if (mcMenuPath === '/resources/blog') {
          mcMenuPath = '/blog';
        }

        if ($('body').hasClass('node-type-portfolio-work')) {
          mcPath = '/work';
        }

        if (mcPath.indexOf(mcMenuPath) >= 0 || mcPath.indexOf(mcMenuPath + '/') >= 0) {
          $(this).parent().addClass('active-trail');
        }
      });
    }
  };
})(jQuery);
;
/*
  Formalize - version 1.2

  Note: This file depends on the jQuery library.
*/

// Module pattern:
// http://yuiblog.com/blog/2007/06/12/module-pattern
var FORMALIZE = (function($, window, document, undefined) {
  // Internet Explorer detection.
  function IE(version) {
    var b = document.createElement('b');
    b.innerHTML = '<!--[if IE ' + version + ']><br><![endif]-->';
    return !!b.getElementsByTagName('br').length;
  }

  // Private constants.
  var PLACEHOLDER_SUPPORTED = 'placeholder' in document.createElement('input');
  var AUTOFOCUS_SUPPORTED = 'autofocus' in document.createElement('input');
  var IE6 = IE(6);
  var IE7 = IE(7);

  // Expose innards of FORMALIZE.
  return {
    // FORMALIZE.go
    go: function() {
      var i, j = this.init;

      for (i in j) {
        j.hasOwnProperty(i) && j[i]();
      }
    },
    // FORMALIZE.init
    init: {
      // FORMALIZE.init.disable_link_button
      disable_link_button: function() {
        $(document.documentElement).on('click', 'a.button_disabled', function() {
          return false;
        });
      },
      // FORMALIZE.init.full_input_size
      full_input_size: function() {
        if (!IE7 || !$('textarea, input.input_full').length) {
          return;
        }

        // This fixes width: 100% on <textarea> and class="input_full".
        // It ensures that form elements don't go wider than container.
        $('textarea, input.input_full').wrap('<span class="input_full_wrap"></span>');
      },
      // FORMALIZE.init.ie6_skin_inputs
      ie6_skin_inputs: function() {
        // Test for Internet Explorer 6.
        if (!IE6 || !$('input, select, textarea').length) {
          // Exit if the browser is not IE6,
          // or if no form elements exist.
          return;
        }

        // For <input type="submit" />, etc.
        var button_regex = /button|submit|reset/;

        // For <input type="text" />, etc.
        var type_regex = /date|datetime|datetime-local|email|month|number|password|range|search|tel|text|time|url|week/;

        $('input').each(function() {
          var el = $(this);

          // Is it a button?
          if (this.getAttribute('type').match(button_regex)) {
            el.addClass('ie6_button');

            /* Is it disabled? */
            if (this.disabled) {
              el.addClass('ie6_button_disabled');
            }
          }
          // Or is it a textual input?
          else if (this.getAttribute('type').match(type_regex)) {
            el.addClass('ie6_input');

            /* Is it disabled? */
            if (this.disabled) {
              el.addClass('ie6_input_disabled');
            }
          }
        });

        $('textarea, select').each(function() {
          /* Is it disabled? */
          if (this.disabled) {
            $(this).addClass('ie6_input_disabled');
          }
        });
      },
      // FORMALIZE.init.autofocus
      autofocus: function() {
        if (AUTOFOCUS_SUPPORTED || !$(':input[autofocus]').length) {
          return;
        }

        var el = $('[autofocus]')[0];

        if (!el.disabled) {
          el.focus();
        }
      },
      // FORMALIZE.init.placeholder
      placeholder: function() {
        if (PLACEHOLDER_SUPPORTED || !$(':input[placeholder]').length) {
          // Exit if placeholder is supported natively,
          // or if page does not have any placeholder.
          return;
        }

        FORMALIZE.misc.add_placeholder();

        $(':input[placeholder]').each(function() {
          // Placeholder obscured in older browsers,
          // so there's no point adding to password.
          if (this.type === 'password') {
            return;
          }

          var el = $(this);
          var text = el.attr('placeholder');

          el.focus(function() {
            if (el.val() === text) {
              el.val('').removeClass('placeholder_text');
            }
          }).blur(function() {
            FORMALIZE.misc.add_placeholder();
          });

          // Prevent <form> from accidentally
          // submitting the placeholder text.
          el.closest('form').submit(function() {
            if (el.val() === text) {
              el.val('').removeClass('placeholder_text');
            }
          }).on('reset', function() {
            setTimeout(FORMALIZE.misc.add_placeholder, 50);
          });
        });
      }
    },
    // FORMALIZE.misc
    misc: {
      // FORMALIZE.misc.add_placeholder
      add_placeholder: function() {
        if (PLACEHOLDER_SUPPORTED || !$(':input[placeholder]').length) {
          // Exit if placeholder is supported natively,
          // or if page does not have any placeholder.
          return;
        }

        $(':input[placeholder]').each(function() {
          // Placeholder obscured in older browsers,
          // so there's no point adding to password.
          if (this.type === 'password') {
            return;
          }

          var el = $(this);
          var text = el.attr('placeholder');

          if (!el.val() || el.val() === text) {
            el.val(text).addClass('placeholder_text');
          }
        });
      }
    }
  };
// Alias jQuery, window, document.
})(jQuery, this, this.document);

// Automatically calls all functions in FORMALIZE.init
jQuery(document).ready(function() {
  FORMALIZE.go();
});;
/* http://prismjs.com/download.html?themes=prism&languages=markup+css+css-extras+clike+javascript+php+scss&plugins=line-numbers */
var self=typeof window!="undefined"?window:{},Prism=function(){var e=/\blang(?:uage)?-(?!\*)(\w+)\b/i,t=self.Prism={util:{encode:function(e){return e instanceof n?new n(e.type,t.util.encode(e.content)):t.util.type(e)==="Array"?e.map(t.util.encode):e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\u00a0/g," ")},type:function(e){return Object.prototype.toString.call(e).match(/\[object (\w+)\]/)[1]},clone:function(e){var n=t.util.type(e);switch(n){case"Object":var r={};for(var i in e)e.hasOwnProperty(i)&&(r[i]=t.util.clone(e[i]));return r;case"Array":return e.slice()}return e}},languages:{extend:function(e,n){var r=t.util.clone(t.languages[e]);for(var i in n)r[i]=n[i];return r},insertBefore:function(e,n,r,i){i=i||t.languages;var s=i[e],o={};for(var u in s)if(s.hasOwnProperty(u)){if(u==n)for(var a in r)r.hasOwnProperty(a)&&(o[a]=r[a]);o[u]=s[u]}return i[e]=o},DFS:function(e,n){for(var r in e){n.call(e,r,e[r]);t.util.type(e)==="Object"&&t.languages.DFS(e[r],n)}}},highlightAll:function(e,n){var r=document.querySelectorAll('code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code');for(var i=0,s;s=r[i++];)t.highlightElement(s,e===!0,n)},highlightElement:function(r,i,s){var o,u,a=r;while(a&&!e.test(a.className))a=a.parentNode;if(a){o=(a.className.match(e)||[,""])[1];u=t.languages[o]}if(!u)return;r.className=r.className.replace(e,"").replace(/\s+/g," ")+" language-"+o;a=r.parentNode;/pre/i.test(a.nodeName)&&(a.className=a.className.replace(e,"").replace(/\s+/g," ")+" language-"+o);var f=r.textContent;if(!f)return;var l={element:r,language:o,grammar:u,code:f};t.hooks.run("before-highlight",l);if(i&&self.Worker){var c=new Worker(t.filename);c.onmessage=function(e){l.highlightedCode=n.stringify(JSON.parse(e.data),o);t.hooks.run("before-insert",l);l.element.innerHTML=l.highlightedCode;s&&s.call(l.element);t.hooks.run("after-highlight",l)};c.postMessage(JSON.stringify({language:l.language,code:l.code}))}else{l.highlightedCode=t.highlight(l.code,l.grammar,l.language);t.hooks.run("before-insert",l);l.element.innerHTML=l.highlightedCode;s&&s.call(r);t.hooks.run("after-highlight",l)}},highlight:function(e,r,i){var s=t.tokenize(e,r);return n.stringify(t.util.encode(s),i)},tokenize:function(e,n,r){var i=t.Token,s=[e],o=n.rest;if(o){for(var u in o)n[u]=o[u];delete n.rest}e:for(var u in n){if(!n.hasOwnProperty(u)||!n[u])continue;var a=n[u],f=a.inside,l=!!a.lookbehind,c=0;a=a.pattern||a;for(var h=0;h<s.length;h++){var p=s[h];if(s.length>e.length)break e;if(p instanceof i)continue;a.lastIndex=0;var d=a.exec(p);if(d){l&&(c=d[1].length);var v=d.index-1+c,d=d[0].slice(c),m=d.length,g=v+m,y=p.slice(0,v+1),b=p.slice(g+1),w=[h,1];y&&w.push(y);var E=new i(u,f?t.tokenize(d,f):d);w.push(E);b&&w.push(b);Array.prototype.splice.apply(s,w)}}}return s},hooks:{all:{},add:function(e,n){var r=t.hooks.all;r[e]=r[e]||[];r[e].push(n)},run:function(e,n){var r=t.hooks.all[e];if(!r||!r.length)return;for(var i=0,s;s=r[i++];)s(n)}}},n=t.Token=function(e,t){this.type=e;this.content=t};n.stringify=function(e,r,i){if(typeof e=="string")return e;if(Object.prototype.toString.call(e)=="[object Array]")return e.map(function(t){return n.stringify(t,r,e)}).join("");var s={type:e.type,content:n.stringify(e.content,r,i),tag:"span",classes:["token",e.type],attributes:{},language:r,parent:i};s.type=="comment"&&(s.attributes.spellcheck="true");t.hooks.run("wrap",s);var o="";for(var u in s.attributes)o+=u+'="'+(s.attributes[u]||"")+'"';return"<"+s.tag+' class="'+s.classes.join(" ")+'" '+o+">"+s.content+"</"+s.tag+">"};if(!self.document){if(!self.addEventListener)return self.Prism;self.addEventListener("message",function(e){var n=JSON.parse(e.data),r=n.language,i=n.code;self.postMessage(JSON.stringify(t.tokenize(i,t.languages[r])));self.close()},!1);return self.Prism}var r=document.getElementsByTagName("script");r=r[r.length-1];if(r){t.filename=r.src;document.addEventListener&&!r.hasAttribute("data-manual")&&document.addEventListener("DOMContentLoaded",t.highlightAll)}return self.Prism}();typeof module!="undefined"&&module.exports&&(module.exports=Prism);;
Prism.languages.markup={comment:/<!--[\w\W]*?-->/g,prolog:/<\?.+?\?>/,doctype:/<!DOCTYPE.+?>/,cdata:/<!\[CDATA\[[\w\W]*?]]>/i,tag:{pattern:/<\/?[\w:-]+\s*(?:\s+[\w:-]+(?:=(?:("|')(\\?[\w\W])*?\1|[^\s'">=]+))?\s*)*\/?>/gi,inside:{tag:{pattern:/^<\/?[\w:-]+/i,inside:{punctuation:/^<\/?/,namespace:/^[\w-]+?:/}},"attr-value":{pattern:/=(?:('|")[\w\W]*?(\1)|[^\s>]+)/gi,inside:{punctuation:/=|>|"/g}},punctuation:/\/?>/g,"attr-name":{pattern:/[\w:-]+/g,inside:{namespace:/^[\w-]+?:/}}}},entity:/\&#?[\da-z]{1,8};/gi};Prism.hooks.add("wrap",function(e){e.type==="entity"&&(e.attributes.title=e.content.replace(/&amp;/,"&"))});;
Prism.languages.css={comment:/\/\*[\w\W]*?\*\//g,atrule:{pattern:/@[\w-]+?.*?(;|(?=\s*{))/gi,inside:{punctuation:/[;:]/g}},url:/url\((["']?).*?\1\)/gi,selector:/[^\{\}\s][^\{\};]*(?=\s*\{)/g,property:/(\b|\B)[\w-]+(?=\s*:)/ig,string:/("|')(\\?.)*?\1/g,important:/\B!important\b/gi,punctuation:/[\{\};:]/g,"function":/[-a-z0-9]+(?=\()/ig};Prism.languages.markup&&Prism.languages.insertBefore("markup","tag",{style:{pattern:/<style[\w\W]*?>[\w\W]*?<\/style>/ig,inside:{tag:{pattern:/<style[\w\W]*?>|<\/style>/ig,inside:Prism.languages.markup.tag.inside},rest:Prism.languages.css}}});;
Prism.languages.css.selector={pattern:/[^\{\}\s][^\{\}]*(?=\s*\{)/g,inside:{"pseudo-element":/:(?:after|before|first-letter|first-line|selection)|::[-\w]+/g,"pseudo-class":/:[-\w]+(?:\(.*\))?/g,"class":/\.[-:\.\w]+/g,id:/#[-:\.\w]+/g}};Prism.languages.insertBefore("css","ignore",{hexcode:/#[\da-f]{3,6}/gi,entity:/\\[\da-f]{1,8}/gi,number:/[\d%\.]+/g});;
Prism.languages.clike={comment:{pattern:/(^|[^\\])(\/\*[\w\W]*?\*\/|(^|[^:])\/\/.*?(\r?\n|$))/g,lookbehind:!0},string:/("|')(\\?.)*?\1/g,"class-name":{pattern:/((?:(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[a-z0-9_\.\\]+/ig,lookbehind:!0,inside:{punctuation:/(\.|\\)/}},keyword:/\b(if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/g,"boolean":/\b(true|false)\b/g,"function":{pattern:/[a-z0-9_]+\(/ig,inside:{punctuation:/\(/}},number:/\b-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee]-?\d+)?)\b/g,operator:/[-+]{1,2}|!|<=?|>=?|={1,3}|&{1,2}|\|?\||\?|\*|\/|\~|\^|\%/g,ignore:/&(lt|gt|amp);/gi,punctuation:/[{}[\];(),.:]/g};;
Prism.languages.javascript=Prism.languages.extend("clike",{keyword:/\b(break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|false|finally|for|function|get|if|implements|import|in|instanceof|interface|let|new|null|package|private|protected|public|return|set|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)\b/g,number:/\b-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee]-?\d+)?|NaN|-?Infinity)\b/g});Prism.languages.insertBefore("javascript","keyword",{regex:{pattern:/(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\r\n])+\/[gim]{0,3}(?=\s*($|[\r\n,.;})]))/g,lookbehind:!0}});Prism.languages.markup&&Prism.languages.insertBefore("markup","tag",{script:{pattern:/<script[\w\W]*?>[\w\W]*?<\/script>/ig,inside:{tag:{pattern:/<script[\w\W]*?>|<\/script>/ig,inside:Prism.languages.markup.tag.inside},rest:Prism.languages.javascript}}});
;
/**
 * Original by Aaron Harun: http://aahacreative.com/2012/07/31/php-syntax-highlighting-prism/
 * Modified by Miles Johnson: http://milesj.me
 *
 * Supports the following:
 * 		- Extends clike syntax
 * 		- Support for PHP 5.3+ (namespaces, traits, generators, etc)
 * 		- Smarter constant and function matching
 *
 * Adds the following new token classes:
 * 		constant, delimiter, variable, function, package
 */Prism.languages.php=Prism.languages.extend("clike",{keyword:/\b(and|or|xor|array|as|break|case|cfunction|class|const|continue|declare|default|die|do|else|elseif|enddeclare|endfor|endforeach|endif|endswitch|endwhile|extends|for|foreach|function|include|include_once|global|if|new|return|static|switch|use|require|require_once|var|while|abstract|interface|public|implements|private|protected|parent|throw|null|echo|print|trait|namespace|final|yield|goto|instanceof|finally|try|catch)\b/ig,constant:/\b[A-Z0-9_]{2,}\b/g,comment:{pattern:/(^|[^\\])(\/\*[\w\W]*?\*\/|(^|[^:])(\/\/|#).*?(\r?\n|$))/g,lookbehind:!0}});Prism.languages.insertBefore("php","keyword",{delimiter:/(\?>|<\?php|<\?)/ig,variable:/(\$\w+)\b/ig,"package":{pattern:/(\\|namespace\s+|use\s+)[\w\\]+/g,lookbehind:!0,inside:{punctuation:/\\/}}});Prism.languages.insertBefore("php","operator",{property:{pattern:/(->)[\w]+/g,lookbehind:!0}});if(Prism.languages.markup){Prism.hooks.add("before-highlight",function(e){if(e.language!=="php")return;e.tokenStack=[];e.code=e.code.replace(/(?:<\?php|<\?)[\w\W]*?(?:\?>)/ig,function(t){e.tokenStack.push(t);return"{{{PHP"+e.tokenStack.length+"}}}"})});Prism.hooks.add("after-highlight",function(e){if(e.language!=="php")return;for(var t=0,n;n=e.tokenStack[t];t++)e.highlightedCode=e.highlightedCode.replace("{{{PHP"+(t+1)+"}}}",Prism.highlight(n,e.grammar,"php"));e.element.innerHTML=e.highlightedCode});Prism.hooks.add("wrap",function(e){e.language==="php"&&e.type==="markup"&&(e.content=e.content.replace(/(\{\{\{PHP[0-9]+\}\}\})/g,'<span class="token php">$1</span>'))});Prism.languages.insertBefore("php","comment",{markup:{pattern:/<[^?]\/?(.*?)>/g,inside:Prism.languages.markup},php:/\{\{\{PHP[0-9]+\}\}\}/g})};;
Prism.languages.scss=Prism.languages.extend("css",{comment:{pattern:/(^|[^\\])(\/\*[\w\W]*?\*\/|\/\/.*?(\r?\n|$))/g,lookbehind:!0},atrule:/@[\w-]+(?=\s+(\(|\{|;))/gi,url:/([-a-z]+-)*url(?=\()/gi,selector:/([^@;\{\}\(\)]?([^@;\{\}\(\)]|&|\#\{\$[-_\w]+\})+)(?=\s*\{(\}|\s|[^\}]+(:|\{)[^\}]+))/gm});Prism.languages.insertBefore("scss","atrule",{keyword:/@(if|else if|else|for|each|while|import|extend|debug|warn|mixin|include|function|return|content)|(?=@for\s+\$[-_\w]+\s)+from/i});Prism.languages.insertBefore("scss","property",{variable:/((\$[-_\w]+)|(#\{\$[-_\w]+\}))/i});Prism.languages.insertBefore("scss","ignore",{placeholder:/%[-_\w]+/i,statement:/\B!(default|optional)\b/gi,"boolean":/\b(true|false)\b/g,"null":/\b(null)\b/g,operator:/\s+([-+]{1,2}|={1,2}|!=|\|?\||\?|\*|\/|\%)\s+/g});;
Prism.hooks.add("after-highlight",function(e){var t=e.element.parentNode;if(!t||!/pre/i.test(t.nodeName)||t.className.indexOf("line-numbers")===-1){return}var n=1+e.code.split("\n").length;var r;lines=new Array(n);lines=lines.join("<span></span>");r=document.createElement("span");r.className="line-numbers-rows";r.innerHTML=lines;if(t.hasAttribute("data-start")){t.style.counterReset="linenumber "+(parseInt(t.getAttribute("data-start"),10)-1)}e.element.appendChild(r)})
;
;
