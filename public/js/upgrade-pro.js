var upgradePopup = null;

$("#upgrade-pro").click(function (event) {
  try
  {
    if ($('.popupupgrade-wrapper').css('display') != 'none')
      return;
    upgradePopup = new popup(".popupupgrade-wrapper");
    upgradePopup.onButton(function () {
    })
    upgradePopup.show();
    event.preventDefault();
    event.stopPropagation();

    if ($(".account-content-membership #stripe-card").length > 0)
      window.card.unmount(".account-content-membership #stripe-card");
    window.card.mount(".upgrade-popup #stripe-card");
  }
  catch (e) {
    console.log(e);
  } 
});

$(".main").on('click', function (event) {
  if ($('.popupupgrade-wrapper').css("display") == "none")
    return;
  if (!event.clientX)
    return;
  if ($(".popupupgrade-wrapper .upgrade-popup").length == 0)
    return;
  var rect = $(".popupupgrade-wrapper .upgrade-popup")[0].getBoundingClientRect();
  var isInDialog=(rect.top <= event.clientY && event.clientY <= rect.top + rect.height
    && rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
  if (!isInDialog) {
    $('.upgrade-popup .div-upgrade-btn').show();
    $('.popupupgrade-wrapper').css("display", "none");
    $(".upgrade-popup .div-upgrade-btn-options").hide();
    $(".upgrade-popup .pro-upgrade-now-form").hide();
    $(".upgrade-popup .finalise-pro-purchase").hide();
    if ($(".account-content-membership #stripe-card").length > 0)
    {
      $(".upgrade-popup .pro-plan-title").show()
      $(".upgrade-popup .pro-prices-line").show()
      $(".upgrade-popup .finalise-pro-purchase").hide()
      $(".upgrade-popup .pro-upgrade-now-form").hide()
      window.card.unmount(".upgrade-popup #stripe-card")
      window.card.mount(".account-content-membership #stripe-card")
    }
  }
});

window.addEventListener("resize", setLearnContainerHeight, true);