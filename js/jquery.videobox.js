/**
 * jQuery VideoBox plugin
 * This jQuery plugin is heavily based on jQuery LightBox by 
 * Leandro Vieira Pinho (leandrovieira.com) which was inspired and based
 * on Lightbox 2 by Lokesh Dhakar (http://www.huddletogether.com/projects/lightbox2/)
 * @name jquery.videobox.js
 * @author Taylor Rose http://trosehfoss.blogspot.com
 * @date April 11, 2008
 * @category jQuery plugin
 * @license CCAttribution-ShareAlike 2.5 Brazil - http://creativecommons.org/licenses/by-sa/2.5/br/deed.en_US
 */

// Offering a Custom Alias suport - More info: http://docs.jquery.com/Plugins/Authoring#Custom_Alias
(function($) {
	/**
	 * $ is an alias to jQuery object
	 *
	 */
	$.fn.videoBox = function(settings) {
		// Settings to configure the jQuery videoBox plugin how you like
		settings = jQuery.extend({
			// Configuration related to overlay
			overlayBgColor: 		'#000',		// (string) Background color to overlay; inform a hexadecimal value like: #RRGGBB. Where RR, GG, and BB are the hexadecimal values for the red, green, and blue values of the color.
			overlayOpacity:			0.8,		// (integer) Opacity value to overlay; inform: 0.X. Where X are number from 0 to 9
			// Configuration related to navigation
			fixedNavigation:		false,		// (boolean) Boolean that informs if the navigation (next and prev button) will be fixed or not in the interface.
			// Configuration related to videos
			imageLoading:			'media/images/videobox-ico-loading.gif',		// (string) Path and the name of the loading icon
			imageBtnPrev:			'media/images/videobox-btn-prev.gif',			// (string) Path and the name of the prev button image
			imageBtnNext:			'media/images/videobox-btn-next.gif',			// (string) Path and the name of the next button image
			imageBtnClose:			'media/images/videobox-btn-close.gif',		// (string) Path and the name of the close btn
			imageBlank:				'media/images/videobox-blank.gif',			// (string) Path and the name of a blank image (one pixel)
			// Configuration related to container video box
			containerBorderSize:	10,			// (integer) If you adjust the padding in the CSS for the container, #videobox-container-video-box, you will need to update this value
			containerResizeSpeed:	1,		// (integer) Specify the resize duration of container video. These number are miliseconds. 400 is default.
			// Configuration related to keyboard navigation
			keyToClose:				'c',		// (string) (c = close) Letter to close the jQuery videoBox interface. Beyond this letter, the letter X and the SCAPE key is used to.
			keyToPrev:				'p',		// (string) (p = previous) Letter to show the previous video
			keyToNext:				'n',		// (string) (n = next) Letter to show the next video.
			// Don´t alter these variables in any way
			videoArray:				[],
			activeVideo:			0,
			// Toggle Navigation
			navigation: false
		},settings);
		// Caching the jQuery object with all elements matched
		var jQueryMatchedObj = this; // This, in this context, refer to jQuery object
		/**
		 * Initializing the plugin calling the start function
		 *
		 * @return boolean false
		 */
		function _initialize() {
			_start(this,jQueryMatchedObj); // This, in this context, refer to object (link) which the user have clicked
			return false; // Avoid the browser following the link
		}
		/**
		 * Start the jQuery videoBox plugin
		 *
		 * @param object objClicked The object (link) whick the user have clicked
		 * @param object jQueryMatchedObj The jQuery object with all elements matched
		 */
		function _start(objClicked,jQueryMatchedObj) {
			// Hide some elements to avoid conflict with overlay in IE. These elements appear above the overlay.
			$('embed, object, select').css({ 'visibility' : 'hidden' });
			// Call the function to create the markup structure; style some elements; assign events in some elements.
			_set_interface();
			// Unset total videos in videoArray
			settings.videoArray.length = 0;
			// Unset video active information
			settings.activevideo = 0;
			// We have an video set? Or just an video? Let´s see it.
			if ( jQueryMatchedObj.length == 1 ) {
				settings.videoArray.push(new Array(objClicked.getAttribute('href'),objClicked.getAttribute('caption')));
			} else {
				// Add an Array (as many as we have), with href and title atributes, inside the Array that storage the videos references		
				for ( var i = 0; i < jQueryMatchedObj.length; i++ ) {
					settings.videoArray.push(new Array(jQueryMatchedObj[i].getAttribute('href'),jQueryMatchedObj[i].getAttribute('caption')));
				}
			}
			while ( settings.videoArray[settings.activeVideo][0] != objClicked.getAttribute('href') ) {
				settings.activeVideo++;
			}
			// Call the function that prepares video exibition
			_set_video_to_view();
		}
		/**
		 * Create the jQuery videoBox plugin interface
		 *
		 * The HTML markup will be like that:
			<div id="jquery-overlay"></div>
			<div id="jquery-videobox">
				<div id="videobox-container-video-box">
					<div id="videobox-container-video">
						<img src="../fotos/XX.jpg" id="videobox-video">
						<div id="videobox-nav">
							<a href="#" id="videobox-nav-btnPrev"></a>
							<a href="#" id="videobox-nav-btnNext"></a>
						</div>
						<div id="videobox-loading">
							<a href="#" id="videobox-loading-link">
								<img src="../videos/videobox-ico-loading.gif">
							</a>
						</div>
					</div>
				</div>
				<div id="videobox-container-video-data-box">
					<div id="videobox-container-video-data">
						<div id="videobox-video-details">
							<span id="videobox-video-details-caption"></span>
							<span id="videobox-video-details-currentNumber"></span>
						</div>
						<div id="videobox-secNav">
							<a href="#" id="videobox-secNav-btnClose">
								<img src="../videos/videobox-btn-close.gif">
							</a>
						</div>
					</div>
				</div>
			</div>
		 *
		 */
		function _set_interface() {
			// Apply the HTML markup into body tag
			$('body').append('<div id="jquery-overlay"></div><div id="jquery-videobox"><div id="videobox-container-video-box"><div id="videobox-container-video"><video autoplay="" controls=""id="videobox-video"><source id="source1" type=\'video/mp4; codecs="avc1.42E01E, mp4a.40.2"\' /><source id="source2" type=\'video/webm; codecs="vp8, vorbis"\' /><source id="source3" type=\'video/ogg; codecs="theora, vorbis"\' /></video><div style="" id="videobox-nav"><a href="#" id="videobox-nav-btnPrev"></a><a href="#" id="videobox-nav-btnNext"></a></div><div id="videobox-loading"><a href="#" id="videobox-loading-link"><img src="' + settings.imageLoading + '"></a></div></div></div><div id="videobox-container-video-data-box"><div id="videobox-container-video-data"><div id="videobox-video-details"><span id="videobox-video-details-caption"></span><span id="videobox-video-details-currentNumber"></span></div><div id="videobox-secNav"><a href="#" id="videobox-secNav-btnClose"><img src="' + settings.imageBtnClose + '"></a></div></div></div></div>');	
			// Get page sizes
			var arrPageSizes = ___getPageSize();
			// Style overlay and show it
			$('#jquery-overlay').css({
				backgroundColor:	settings.overlayBgColor,
				opacity:			settings.overlayOpacity,
				width:				arrPageSizes[0],
				height:				arrPageSizes[1]
			}).fadeIn();
			// Get page scroll
			var arrPageScroll = ___getPageScroll();
			// Calculate top and left offset for the jquery-videobox div object and show it
			$('#jquery-videobox').css({
				top:	arrPageScroll[1] + (arrPageSizes[3] / 10),
				left:	arrPageScroll[0]
			}).show();
			// Assigning click events in elements to close overlay
			$('#jquery-overlay,#jquery-videobox').click(function() {
				_finish();									
			});
			// Assign the _finish function to videobox-loading-link and videobox-secNav-btnClose objects
			$('#videobox-loading-link,#videobox-secNav-btnClose').click(function() {
				_finish();
				return false;
			});
			// If window was resized, calculate the new overlay dimensions
			$(window).resize(function() {
				// Get page sizes
				var arrPageSizes = ___getPageSize();
				// Style overlay and show it
				$('#jquery-overlay').css({
					width:		arrPageSizes[0],
					height:		arrPageSizes[1]
				});
				// Get page scroll
				var arrPageScroll = ___getPageScroll();
				// Calculate top and left offset for the jquery-videobox div object and show it
				$('#jquery-videobox').css({
					top:	arrPageScroll[1] + (arrPageSizes[3] / 10),
					left:	arrPageScroll[0]
				});
			});
		}
		/**
		 * Prepares video exibition; doing a video´s preloader to calculate it´s size
		 *
		 */
		function _set_video_to_view() { // show the loading
			// Show the loading
			$('#videobox-loading').show();
			if ( settings.fixedNavigation ) {
				$('#videobox-video,#videobox-container-video-data-box,#videobox-video-details-currentNumber').hide();
			} else {
				// Hide some elements
				$('#videobox-video,#videobox-nav,#videobox-nav-btnPrev,#videobox-nav-btnNext,#videobox-container-video-data-box,#videobox-video-details-currentNumber').hide();
			}
			$('#source1').attr('src',settings.videoArray[settings.activeVideo][0] + ".mp4");
			$('#source2').attr('src',settings.videoArray[settings.activeVideo][0] + ".webm");
			$('#source2').attr('src',settings.videoArray[settings.activeVideo][0] + ".ogv");
			$('#videobox-video').show();
			_resize_container_video_box(640, 400);
		};
		/**
		 * Perfomance an effect in the video container resizing it
		 *
		 * @param integer intVideoWidth The video´s width that will be showed
		 * @param integer intVideoHeight The video´s height that will be showed
		 */
		function _resize_container_video_box(intVideoWidth,intVideoHeight) {
			// Get current width and height
			var intCurrentWidth = $('#videobox-container-video-box').width();
			var intCurrentHeight = $('#videobox-container-video-box').height();
			// Get the width and height of the selected video plus the padding
			var intWidth = (intVideoWidth + (settings.containerBorderSize * 2)); // Plus the video´s width and the left and right padding value
			var intHeight = (intVideoHeight + (settings.containerBorderSize * 2)); // Plus the video´s height and the left and right padding value
			// Diferences
			var intDiffW = intCurrentWidth - intWidth;
			var intDiffH = intCurrentHeight - intHeight;
			// Perfomance the effect
			$('#videobox-container-video-box').animate({ width: intWidth, height: intHeight },settings.containerResizeSpeed,function() { _show_video(); });
			if ( ( intDiffW == 0 ) && ( intDiffH == 0 ) ) {
				if ( $.browser.msie ) {
					___pause(250);
				} else {
					___pause(100);	
				}
			} 
			$('#videobox-container-video-data-box').css({ width: intVideoWidth });
			$('#videobox-nav-btnPrev,#videobox-nav-btnNext').css({ height: intVideoHeight + (settings.containerBorderSize * 2) });
		};
		/**
		 * Show the prepared video
		 *
		 */
		function _show_video() {
			$('#videobox-loading').hide();
			$('#videobox-video').fadeIn(function() {
				_show_video_data();
				_set_navigation();
			});
			_preload_neighbor_videos();
		};
		/**
		 * Show the video information
		 *
		 */
		function _show_video_data() {
			$('#videobox-container-video-data-box').slideDown('fast');
			$('#videobox-video-details-caption').hide();
			console.log(settings.videoArray[settings.activeVideo][1]);
			if ( settings.videoArray[settings.activeVideo][1] ) {
				$('#videobox-video-details-caption').html(settings.videoArray[settings.activeVideo][1]).show();
			}	
		}
		/**
		 * Display the button navigations
		 *
		 */
		function _set_navigation() {
			$('#videobox-nav').show();

			// Instead to define this configuration in CSS file, we define here. And it´s need to IE. Just.
			$('#videobox-nav-btnPrev,#videobox-nav-btnNext').css({ 'background' : 'transparent url(' + settings.imageBlank + ') no-repeat' });
			
			// Show the prev button, if not the first video in set
			if ( settings.activeVideo != 0 && settings.navigation ) {
				if ( settings.fixedNavigation ) {
					$('#videobox-nav-btnPrev').css({ 'background' : 'url(' + settings.imageBtnPrev + ') left 15% no-repeat' })
						.unbind()
						.bind('click',function() {
							settings.activeVideo = settings.activeVideo - 1;
							_set_video_to_view();
							return false;
						});
				} else {
					// Show the videos button for Next buttons
					$('#videobox-nav-btnPrev').unbind().hover(function() {
						$(this).css({ 'background' : 'url(' + settings.imageBtnPrev + ') left 15% no-repeat' });
					},function() {
						$(this).css({ 'background' : 'transparent url(' + settings.imageBlank + ') no-repeat' });
					}).show().bind('click',function() {
						settings.activeVideo = settings.activeVideo - 1;
						_set_video_to_view();
						return false;
					});
				}
			}
			
			// Show the next button, if not the last video in set
			if ( settings.activeVideo != ( settings.videoArray.length -1 ) && settings.navigation ) {
				if ( settings.fixedNavigation ) {
					$('#videobox-nav-btnNext').css({ 'background' : 'url(' + settings.imageBtnNext + ') right 15% no-repeat' })
						.unbind()
						.bind('click',function() {
							settings.activeVideo = settings.activeVideo + 1;
							_set_video_to_view();
							return false;
						});
				} else {
					// Show the videos button for Next buttons
					$('#videobox-nav-btnNext').unbind().hover(function() {
						$(this).css({ 'background' : 'url(' + settings.imageBtnNext + ') right 15% no-repeat' });
					},function() {
						$(this).css({ 'background' : 'transparent url(' + settings.imageBlank + ') no-repeat' });
					}).show().bind('click',function() {
						settings.activeVideo = settings.activeVideo + 1;
						_set_video_to_view();
						return false;
					});
				}
			}
			// Enable keyboard navigation
			if ( settings.navigation ) {
				_enable_keyboard_navigation();
			}
		}
		/**
		 * Enable a support to keyboard navigation
		 *
		 */
		function _enable_keyboard_navigation() {
			$(document).keydown(function(objEvent) {
				_keyboard_action(objEvent);
			});
		}
		/**
		 * Disable the support to keyboard navigation
		 *
		 */
		function _disable_keyboard_navigation() {
			$(document).unbind();
		}
		/**
		 * Perform the keyboard actions
		 *
		 */
		function _keyboard_action(objEvent) {
			// To ie
			if ( objEvent == null ) {
				keycode = event.keyCode;
				escapeKey = 27;
			// To Mozilla
			} else {
				keycode = objEvent.keyCode;
				escapeKey = objEvent.DOM_VK_ESCAPE;
			}
			// Get the key in lower case form
			key = String.fromCharCode(keycode).toLowerCase();
			// Verify the keys to close the ligthBox
			if ( ( key == settings.keyToClose ) || ( key == 'x' ) || ( keycode == escapeKey ) ) {
				_finish();
			}
			// Verify the key to show the previous video
			if ( ( key == settings.keyToPrev ) || ( keycode == 37 ) ) {
				// If we´re not showing the first video, call the previous
				if ( settings.activeVideo != 0 ) {
					settings.activeVideo = settings.activeVideo - 1;
					_set_video_to_view();
					_disable_keyboard_navigation();
				}
			}
			// Verify the key to show the next video
			if ( ( key == settings.keyToNext ) || ( keycode == 39 ) ) {
				// If we´re not showing the last video, call the next
				if ( settings.activeVideo != ( settings.videoArray.length - 1 ) ) {
					settings.activeVideo = settings.activeVideo + 1;
					_set_video_to_view();
					_disable_keyboard_navigation();
				}
			}
		}
		/**
		 * Preload prev and next videos being showed
		 *
		 */
		function _preload_neighbor_videos() {
			if ( (settings.videoArray.length -1) > settings.activeVideo ) {
				objNext = new Image();
				objNext.src = settings.videoArray[settings.activeVideo + 1][0];
			}
			if ( settings.activeVideo > 0 ) {
				objPrev = new Image();
				objPrev.src = settings.videoArray[settings.activeVideo -1][0];
			}
		}
		/**
		 * Remove jQuery videoBox plugin HTML markup
		 *
		 */
		function _finish() {
			$('#jquery-videobox').remove();
			$('#jquery-overlay').fadeOut(function() { $('#jquery-overlay').remove(); });
			// Show some elements to avoid conflict with overlay in IE. These elements appear above the overlay.
			$('embed, object, select').css({ 'visibility' : 'visible' });
		}
		/**
		 / THIRD FUNCTION
		 * getPageSize() by quirksmode.com
		 *
		 * @return Array Return an array with page width, height and window width, height
		 */
		function ___getPageSize() {
			var xScroll, yScroll;
			if (window.innerHeight && window.scrollMaxY) {	
				xScroll = window.innerWidth + window.scrollMaxX;
				yScroll = window.innerHeight + window.scrollMaxY;
			} else if (document.body.scrollHeight > document.body.offsetHeight){ // all but Explorer Mac
				xScroll = document.body.scrollWidth;
				yScroll = document.body.scrollHeight;
			} else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
				xScroll = document.body.offsetWidth;
				yScroll = document.body.offsetHeight;
			}
			var windowWidth, windowHeight;
			if (self.innerHeight) {	// all except Explorer
				if(document.documentElement.clientWidth){
					windowWidth = document.documentElement.clientWidth; 
				} else {
					windowWidth = self.innerWidth;
				}
				windowHeight = self.innerHeight;
			} else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
				windowWidth = document.documentElement.clientWidth;
				windowHeight = document.documentElement.clientHeight;
			} else if (document.body) { // other Explorers
				windowWidth = document.body.clientWidth;
				windowHeight = document.body.clientHeight;
			}	
			// for small pages with total height less then height of the viewport
			if(yScroll < windowHeight){
				pageHeight = windowHeight;
			} else { 
				pageHeight = yScroll;
			}
			// for small pages with total width less then width of the viewport
			if(xScroll < windowWidth){	
				pageWidth = xScroll;		
			} else {
				pageWidth = windowWidth;
			}
			arrayPageSize = new Array(pageWidth,pageHeight,windowWidth,windowHeight);
			return arrayPageSize;
		};
		/**
		 / THIRD FUNCTION
		 * getPageScroll() by quirksmode.com
		 *
		 * @return Array Return an array with x,y page scroll values.
		 */
		function ___getPageScroll() {
			var xScroll, yScroll;
			if (self.pageYOffset) {
				yScroll = self.pageYOffset;
				xScroll = self.pageXOffset;
			} else if (document.documentElement && document.documentElement.scrollTop) {	 // Explorer 6 Strict
				yScroll = document.documentElement.scrollTop;
				xScroll = document.documentElement.scrollLeft;
			} else if (document.body) {// all other Explorers
				yScroll = document.body.scrollTop;
				xScroll = document.body.scrollLeft;	
			}
			arrayPageScroll = new Array(xScroll,yScroll);
			return arrayPageScroll;
		};
		 /**
		  * Stop the code execution from a escified time in milisecond
		  *
		  */
		 function ___pause(ms) {
			var date = new Date(); 
			curDate = null;
			do { var curDate = new Date(); }
			while ( curDate - date < ms);
		 };
		// Return the jQuery object for chaining. The unbind method is used to avoid click conflict when the plugin is called more than once
		return this.unbind('click').click(_initialize);
	};
})(jQuery); // Call and execute the function immediately passing the jQuery object
