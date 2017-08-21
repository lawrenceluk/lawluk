(function ($, sr, undefined) {
	"use strict";

	/* Smooth State Setup --- */
	var $body = $('html, body'),
	$main = $('#main'),
	content = $main.smoothState({
		prefetch: false,
		pageCacheSize: 3,
		blacklist : ".no-ss, .no-smoothstate, [target]",
		onStart: {
			duration:800,
			render: function (url, $container) {
				$body.animate({
					scrollTop: 0
				}, 600, function(){
					content.toggleAnimationClass('exiting');
				});

				$('.container').addClass('out');
				$('.post-nav').addClass('out');

			}
		},
		onProgress: {
			duration:0,
			render: function (url, $container) {
				content.toggleAnimationClass('exiting');
			}
		},
		callback: function() {
			initEverything();
		}
	}).data('smoothState');

	/* Make image full width if size is larger than screen --- */
	function updateImageWidth() {
		var $this = $(this),
				$postContent = $(".post-content"),
				contentWidth = $postContent.outerWidth(), // Width of the content
				imageWidth = this.naturalWidth; // Original image resolution
		if (imageWidth >= contentWidth)
			$this.addClass('full-img');
		else
			$this.removeClass('full-img');
	}

	function updateAllImages() {
		var $img = $("img").on('load', updateImageWidth);
		$img.each(updateImageWidth);
	}
	$(document).ready(function() {
		$(window).resize(updateAllImages);
	});

	/* Init Everything Together (to use with smoothstate callbacks) */
	function initEverything() {
		updateAllImages();

		$('.post-content').fitVids();

		// Custom Post Nav
		if ( $('.wrapper').hasClass('post-template') )
			NextPrevLinksModule.init();

		// Animated Scroll
		$('a[href*=\\#]:not([href=\\#])').click(function() {
			if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') || location.hostname == this.hostname) {
				var target = $(this.hash);
				target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
				
				if (target.length) {
					$('html,body').animate({
						scrollTop: target.offset().top
					}, 800);
					return false;
				}
			}
		});
	}
	initEverything();

})(jQuery, 'smartresize');
