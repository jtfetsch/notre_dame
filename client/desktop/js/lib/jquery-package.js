define([
    'jquery',
    'jquery.transit',
    'jquery.mobile.events'
], function ($) {

	$.fn.requestFullScreen = function (cb) {
		if(this.length === 1) {
			var el = this[0];
			if(el.requestFullscreen) {
				el.requestFullscreen();
			} else if(el.mozRequestFullScreen) {
				el.mozRequestFullScreen();
			} else if(el.webkitRequestFullscreen) {
				el.webkitRequestFullscreen();
			} else if(el.msRequestFullscreen) {
				el.msRequestFullscreen();
			}
		}

		if(cb) cb.call(this);
		return this;
	};

	$.fn.exitFullScreen = function (cb) {
		if(document.exitFullscreen) {
			document.exitFullscreen();
		} else if(document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if(document.webkitExitFullscreen) {
			document.webkitExitFullscreen();
		}

		if(cb) cb.call(this);
		return this;
	};

	$.documentIsFullScreen = function () {
		return !!(document.fullScreenElement || document.mozFullScreenElement || document.webkitFullscreenElement);
	};

	$.fn.isFullScreen = function () {
		if(this.length !== 1) return false;
		var fullScreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
		return $.documentIsFullScreen() && this[0] === fullScreenElement;
	};

    return $;
});
