var popup = function (selector) {
  var elem = $(selector);
  var buttonCallback = null;

  elem.on("click", ".popup-close", function () {
    elem.css("display", "none");
    if (player) {
      player.stop();
    }
  });

  elem.on("click", ".popup-button", function () {
    elem.css("display", "none");
    if (buttonCallback) {
      buttonCallback();
    }
  });

  if (elem.attr("class") == "popupterms-wrapper")
  {
    elem.on('click', function (event) {
      if (!event.clientX)
        return;
      var rect = $(".terms-popup")[0].getBoundingClientRect();
      var isInDialog=(rect.top <= event.clientY && event.clientY <= rect.top + rect.height
        && rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
      if (!isInDialog) {
        elem.css("display", "none");
      }
    })
  }

  if (elem.attr("class") == "popuplearn-wrapper")
  {
    elem.on('click', function (event) {
      if (!event.clientX)
        return;
      var rect = $(".learn-popup .popup-body")[0].getBoundingClientRect();
      var isInDialog=(rect.top <= event.clientY && event.clientY <= rect.top + rect.height
        && rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
      if (!isInDialog) {
        elem.css("display", "none");
        if (player) {
          player.stop();
        }
      }
    })
  }
  
  return {
    find: function (selector) {
      return elem.find(selector)[0];
    },
    setAttribute: function (selector, attr, val) {
      elem.find(selector).attr(attr, val);
    },
    setText: function (selector, text) {
      elem.find(selector).text(text);
    },
    show: function () {
      elem.css("display", "flex").hide().fadeIn();
    },
    hide: function () {
      elem.css("display", "none");
    },
    onButton: function (callback) {
      buttonCallback = callback;
    },
  };
};
