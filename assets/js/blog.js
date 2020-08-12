(function ($, sr, undefined) {
"use strict";
  $(window).on('scroll', function (event) {
    $('.blog-post').each(function () {
      if (isVisible($(this)[0])) {
        $(this).addClass('in-view');
      } else {
        $(this).removeClass('in-view');
      }
    });
  });

  $('.blog-post').each(function () {
    if (isVisible($(this)[0])) {
      $(this).addClass('in-view');
    } else {
      $(this).removeClass('in-view');
    }
  });

  function isVisible (elm) {
    var rect = elm.getBoundingClientRect();
    var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
    return !(rect.bottom < 50 || rect.top - viewHeight >= 0);
  }
})(jQuery, 'smartresize');
