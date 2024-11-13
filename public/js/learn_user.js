var player = null;

$(document).on("click", ".learn-item-chapter", function () {
  var learnPopup = null;
  try
  {
    $('.popupterms-wrapper').css('display', 'none');
    learnPopup = new popup(".popuplearn-wrapper")
    learnPopup.onButton(function () {
    })
    learnPopup.show()
    setTimeout(() => {
      var id = $(this).data("video-id");
      $(".js-player").attr("data-plyr-embed-id", id);
      if (player) {
        setTimeout(() => {
          $(".js-player").attr("data-plyr-embed-id", id);
          setUpPlyr();
          setLearnContainerHeight();
        }, 300);
        player.destroy();
      }
      setUpPlyr();
    }, 100)
  }
  catch (e) {
    console.log(e);
  } 
});

$(document).on("click", "#privacy-terms", function () {
  var privacyPopup = null;
  try
  {
    if ($('.popupterms-wrapper').css('display') != 'none')
      return;
    else
    {
      $('.popuplearn-wrapper').css('display', 'none');
      if (player)
        player.stop();
    }

    privacyPopup = new popup(".popupterms-wrapper")
    privacyPopup.onButton(function () {
    })
    privacyPopup.show()
  }
  catch (e) {
    console.log(e);
  } 
});


function setUpPlyr() {
  let elm = Plyr.setup(".js-player", {
    fullscreen: { fallback: true, iosNative: true },
  });
  if (elm) {
    player = elm[0];
    player.on("ready", setLearnContainerHeight);
  }
}

function setLearnContainerHeight() {
  const isLandscape = window.innerHeight < window.innerWidth;
  const landscapeStyle = `
    .player-wrapper {
      position: fixed;
      left: 0 !important;
      right: 0;
      top: 0;
      bottom: 0;
      width: 100%;
      z-index: 10;
    }
  `;
  $("style.player-wrapper-style").text(`
    @media (max-width: 960px) {
      .learn-list {
        padding-top: ${$(".player-wrapper").outerHeight()}px !important;
      }  
      ${isLandscape && landscapeStyle}
    }
  `);
  if (player)
    player.play();
}

window.addEventListener("resize", setLearnContainerHeight, true);
window.addEventListener(
  "orientationchange",
  () => setTimeout(setLearnContainerHeight, 300),
  true
);