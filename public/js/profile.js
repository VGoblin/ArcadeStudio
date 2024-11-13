var wpopup = new popup(".popup-wrapper");
var shareData = null;

$(document).on("click", ".portfolio-item", function () {
  var self = $(this);
  wpopup.setAttribute("iframe", "src", "/"+self.data("username")+"/"+self.data("slug"));
  wpopup.find("iframe").contentWindow.focus();
  wpopup.setAttribute(".btn-launch.for-mobile", "href", "/"+self.data("username")+"/"+self.data("slug"));
  wpopup.setAttribute(".project-detail", "href", self.data("username"));
  wpopup.setText(".project-detail", self.data("title"));
  wpopup.setText(".project-author", self.data("author"));
  wpopup.setText(".project-description", self.data("description"));
  wpopup.show();

  //add link text
  var fullLink = "https://"+getDomain()+"/"+self.data("username")+"/"+self.data("slug")
  $(".social-url-copy-link").text(fullLink);
  $(".social-embed-text-copy").text('<iframe src="'+fullLink+'"></iframe>')

  //CREATING GLOBAL OBJECT WITH DATA FOR SHARING
  shareData = {};
  shareData.slug = "/"+self.data("slug");
  shareData.username = self.data("username");
  shareData.title = self.data("title");
  shareData.thumbnail = self.data("thumbnail");
  shareData.details = self.data("details");

  console.log(self.data("slug"), self.data("username"), self.data("title"), self.data("thumbnail"), self.data("details"))

  //getMailTo
  var subject = "arcade.studio helped create this! " + shareData.title;
  var body = "Be sure to check out all the creativity like this happening in arcade.studio! " + "\n" + fullLink;
  var emailHref = getMailTo(subject, body);
  $(".shareViaEmail").attr("href",emailHref);
});

// Fullscreen Iframe
function openFullscreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.webkitRequestFullscreen) { /* Safari */
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) { /* IE11 */
    element.msRequestFullscreen();
  }
}

function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) { /* Safari */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { /* IE11 */
    document.msExitFullscreen();
  }
}

$(document).on('click', '.btn-launch.for-desktop', function() {
  openFullscreen($('.popup-wrapper .app-popup .popup-body .iframe-wrapper').get(0));
});
$(document).keydown(function(event) {
  key = window.event ? event.keyCode : e.which;
  if(key == 48 || key == 96) {
    let iframeWrapper = $('.popup-wrapper .app-popup .popup-body .iframe-wrapper').get(0);
    if(window.fullScreen || (window.innerWidth == screen.width && window.innerHeight == screen.height)) {
      closeFullscreen(iframeWrapper);
    } else {
      openFullscreen(iframeWrapper);
    }
  }
});

$(document).click(function (e) {
  if ($(e.target).hasClass("popup-wrapper")) {
    wpopup.setAttribute("iframe", "src", null);
    wpopup.hide();
  }
});
$(document).on("click", ".shareOnFacebook", function(){
  shareOnFacebook(shareData.slug, shareData.thumbnail);
})
$(document).on("click", ".shareOnTwitter", function(){
  shareOnTwitter(shareData.slug, shareData.details, shareData.thumbnail);
})
$(document).on("click", ".shareOnReddit", function(){
  shareOnReddit(shareData.slug, shareData.details, shareData.thumbnail);
})
$(document).on("click", ".shareOnLinkedin", function(){
  shareOnLinkedin(shareData.slug, shareData.title, shareData.details, shareData.thumbnail);
})
$(document).on("click", ".shareOnPinterest", function(){
  shareOnPinterest(shareData.slug,shareData.details,shareData.thumbnail);
})
$(".btn-share").click(function(e){
  e.preventDefault();
  if($(".app-popup-share").hasClass("opened")){
    closeShare();
  }else{
    openShare();
  }
})
$(".social-close-btn-text").click(function(e){
  closeShare();
})
function openShare(){
  // $(".app-popup").fadeOut();
  $(".app-popup-share").fadeIn();
  $(".app-popup-share").addClass("opened");
}
function closeShare(){
  $(".app-popup-share").fadeOut();
  // $(".app-popup").fadeIn();
  $(".app-popup-share").removeClass("opened");
}
$(".social-url-copy-link").click(function(){
  copyToClipboard($(".social-url-copy-link").text());
})
$(".social-embed-text-copy").click(function(){
  copyToClipboard($(".social-embed-text-copy").text());
})
function copyToClipboard(text){
  navigator.clipboard.writeText(text).then(function() {
    hideClose()
  }, function(err) {
    console.error('Async: Could not copy text: ', err);
  });
}
function returnBackClose(){
  $(".social-copied-btn-text").fadeOut();
  $(".social-close-btn-text").fadeIn();
}
function hideClose(){
  $(".social-copied-btn-text").fadeIn();
  $(".social-close-btn-text").fadeOut();
  window.setTimeout(returnBackClose, 1000);
}
