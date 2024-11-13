var admin = function () {
  var rates = [[1,1], [1,2], [2,1], [2,2]];

  var backgroundType = $(".sample-banner").attr("data-type");
  var backgroundUrl = $(".sample-banner").attr("data-url");;
  var backgroundThumbnail = $(".sample-banner").attr("data-thumbnail");;
  var title = "";
  var subTitle = "";

  function showEditButtons()
  {
    $(".btn-admin-save").show();
    $(".btn-admin-cancel").show();
  }

  $(".sample").map((index, item) => {
    let sampleItem = $(item);
    var rate = parseInt(sampleItem.attr("data-rate"));
    sampleItem.css('grid-column', 'span ' + rates[rate - 1][0]);
    sampleItem.css('grid-row', 'span ' + rates[rate - 1][1]);
  })

  function initRenameEvent() {
    $(document).on("dblclick", ".editable-object", function (event) {
      event.preventDefault();
      event.stopPropagation();
      $(this).attr("spellcheck", "false");
      $(this).attr("contenteditable", "true");
      $(this).focus();
      document.execCommand("selectAll", false, null);
    });

    $(document).on("keydown", ".editable-object", function (e) {
      e.stopPropagation();
      if (e.keyCode == 13) {
        e.preventDefault();
        $(this).attr("contenteditable", "false");
      }
    });

    $(document).on("blur", ".editable-object", function (e) {
      var self = $(this);
      var item = self.closest(".sample");
      var id = item.data("id");
      var attribute = self.data("attribute");
      var data = {
        [attribute]: self.text(),
      };

      self.attr("contenteditable", "false");

      // $.ajax({
      //   url: "/admin/sample/" + id,
      //   type: "PUT",
      //   dataType: "JSON",
      //   data,
      //   success: function (res) {},
      // });

      showEditButtons();
    });
  }

  function initSample() {
    $(".menu-coverarea .menu-item").click(function () {
      let coverType = parseInt($(this).attr("data-cover"));
      var gallery = $(".sample-gallery");
      var item = $(`<div class="sample no-border"></div>`);
      item.attr("data-id", -1);
      item.attr("data-slug", "/");
      item.attr("data-rate", coverType);
      item.attr("data-thumbnail", "");
      item.css('grid-column', 'span ' + rates[coverType - 1][0]);
      item.css('grid-row', 'span ' + rates[coverType - 1][1]);
      item.css('min-height', 394 * rates[coverType - 1][1], 'important');

      item.append(
        '<div class="delete-sample"><img src="https://arcadestudio-assets.s3.us-east-2.amazonaws.com/engine-ui/delete-icon.svg" /></div>'
      );
      item.append('<div class="sample-img"></div>');

      var content = $(`<div class="sample-content"></div>`);
      content.append(
        `<div class="sample-title editable-object" data-attribute="title">Your title here</div>`
      );
      content.append(
        `<div class="sample-author editable-object" data-attribute="author">Your name here</div>`
      );
      content.append(
        `<div class="sample-slug"><span class="editable-object" data-attribute="slug">/Your slug here</span></div>`
      );
      item.append(content);

      item.append($(`<div class="sample-description"><img class="sample-info" src="https://arcadestudio-assets.s3.us-east-2.amazonaws.com/website/master/item-side-menu-options/project-details-btn.svg" width="25" height="25" draggable="false"><div class="toggle-rate"><img src="https://arcadestudio-assets.s3.us-east-2.amazonaws.com/website/master/add-btn.svg" width="13" draggable="false"></div></div>`));

      item.append($(`<div class="sample-description-box" style="z-index: unset; display: none;"><textarea class="sample-description-text" disabled="disabled" maxlength="750" spellcheck="true" placeholder="Your description here..." data-undo-text="null"></textarea><div class="sample-description-nonediting"><div class="sample-description-edit">Edit</div><div class="sample-description-exit">Exit</div></div><div class="sample-description-editing" style="display:none"><div class="sample-description-undo">Undo</div><div class="sample-description-save">Save</div></div></div>`));

      gallery.append(item);
      $(".admin-banner-menu").hide();
      $(".banner-options").show();

      showEditButtons();
    });

    $(document).on("click", ".sample-img", function () {
      var self = $(this);
      var id = self.closest(".sample").data("id");
      var fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.addEventListener("change", function () {
        var formData = new FormData();
        formData.append("thumbnail", fileInput.files[0]);
        formData.append("id", id);
        $.ajax({
          url: "/admin/sample/thumbnail",
          type: "POST",
          data: formData,
          processData: false,
          contentType: false,
          success: function (res) {
            self.closest(".sample").data("thumbnail", res.key);
            self.css("background-image", `url(${res.url})`);
            showEditButtons();
          },
        });
      });
      fileInput.click();
    });

    $(document).on("click", ".delete-sample", function () {
      if (confirm("Are you sure to delete this sample?")) {
        var sample = $(this).closest(".sample");
        // var id = sample.data("id");
        sample.attr("data-removed", true);
        sample.css("display", "none");
        showEditButtons();
      }
    });

    $(document).on("click", ".sample-description .sample-info", function () {
      $(this).parent().parent().find('.sample-description-box').css({'display': '', 'z-index': '1'});
    });

    $(document).on("click", ".sample-description-exit", function () {
      $(this).closest('.sample-description-box').css({'display': 'none', 'z-index': 'unset'});
    });

    $(document).on("click", ".sample-description-edit", function () {
      let sampleItem = $(this).closest('.sample-description-box');
      sampleItem.find('.sample-description-editing').show();
      sampleItem.find('.sample-description-nonediting').hide();
      sampleItem.find('.sample-description-text').removeAttr('disabled');
    });

    $(document).on("click", ".sample-description-undo", function () {
      let sampleItem = $(this).closest('.sample-description-box');
      let sampleTextarea = sampleItem.find('.sample-description-text');
      let undoText = sampleTextarea.attr('data-undo-text');
      if (undoText == "null")
        undoText = "";
      sampleTextarea.val(undoText);
    });

    $(document).on("click", ".toggle-rate", function () {
      let sampleItem = $(this).closest('.sample');
      var rate = parseInt(sampleItem.attr("data-rate"));
      rate = rate % 4 + 1;
      sampleItem.attr("data-rate", rate)
      sampleItem.css('grid-column', 'span ' + rates[rate - 1][0]);
      sampleItem.css('grid-row', 'span ' + rates[rate - 1][1]);
      showEditButtons();
    });

    $(document).on("click", ".btn-admin-edit", function () {
      $(".admin-banner-menu").hide();
      $(".banner-options").show();
    });

    $(document).on("click", ".btn-admin-save", function () {
      $(".admin-banner-menu").hide();
      $(".btn-admin-save").hide();
      $(".btn-admin-cancel").hide();

      var list = [];
      $(".sample").each(function (i, elem) {
        let id = $(elem).data("id");
        let rate = $(elem).data("rate");
        let remove = $(elem).data("removed") ? true :  false;
        let thumbnail = $(elem).data("thumbnail");
        let title = $(elem).find(".sample-title").text();
        
        // let thumbnail = $(elem).find(".sample-img").css("background-image").replace('url("', '').replace('")', '')
        let author = $(elem).find(".sample-author").text();
        let slug = $(elem).find(".sample-slug").text();
        let description = $(elem).find(".sample-description-text").text();

        list.push({
          id: id,
          title: title,
          thumbnail: thumbnail,
          author: author,
          slug: slug,
          order: i,
          description: description,
          rate: rate,
          remove: remove
        });
      });
      $.ajax({
        url: "/admin/dashboard/save",
        type: "POST",
        dataType: "JSON",
        data: { 
          banner: {
            backgroundType: backgroundType,
            backgroundUrl: backgroundUrl,
            backgroundThumbnail: backgroundThumbnail
          },
          samples: list
        },
        success: function () {
          // console.log("success");
          window.location.reload();
        },
        error: function(response) {
          // console.log(response);
        }
      });
      
    });

    $(document).on("click", ".btn-admin-cancel", function () {
      $(".admin-banner-menu").hide();
      $(".btn-admin-save").hide();
      $(".btn-admin-cancel").hide();
      window.location.reload();
    });

    $(document).on("click", ".published-project", function () {
      $(".admin-banner-menu").hide();
      $(".published-project-set-url").show();
    });

    $(document).on("click", ".edit-banner", function () {
      $(".admin-banner-menu").hide();
      $(".example-project-type").show();

      $(".btn-admin-save").show();
      $(".btn-admin-cancel").show();
    });

    $(document).on("click", ".add-example-project", function () {
      $(".admin-banner-menu").hide();
      $(".menu-coverarea").show();

      $(".btn-admin-save").show();
      $(".btn-admin-cancel").show();  
    });

    $(document).on("click", ".url-save", function () {
      $(".admin-banner-menu").hide();
      $(".example-project-type").show();
      var username = $(".input-url.username input").val();
      var apptitle = $(".input-url.app-title input").val();

      backgroundType = "app";
      backgroundUrl = "/" + username + "/" + apptitle;
      backgroundThumbnail = backgroundUrl;
      $(".sample-bg").remove()
      $(".sample-banner").css("background", "")
      $(".sample-banner").prepend(`
        <iframe class="sample-bg" src="${backgroundUrl}">
        </iframe>
      `);
    });

    $(document).on("click", ".sample-banner", function (event) {
      var rect = null;
      if ($(".admin-banner-menu")[0].style.display != 'none')
        rect = $(".admin-banner-menu")[0].getBoundingClientRect();
      if ($(".admin-banner-menu")[1].style.display != 'none')
        rect = $(".admin-banner-menu")[1].getBoundingClientRect();
      if ($(".admin-banner-menu")[2].style.display != 'none')
        rect = $(".admin-banner-menu")[2].getBoundingClientRect();
      if ($(".admin-banner-menu")[3].style.display != 'none')
        rect = $(".admin-banner-menu")[3].getBoundingClientRect();
      if (!event.clientX)
        return;
      var isInDialog=(rect.top <= event.clientY && event.clientY <= rect.top + rect.height
        && rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
      if (!isInDialog) {
        $(".admin-banner-menu").hide();
        $(".banner-options").show();
      }
    });

    $(".dashboard-background-option").click(function () {
      var type = $(this).data("type")
      if (type == "image" || type == "video" || type == "animation") {
        var fileInput = document.createElement("input")
        var filter = "image/*"
        if (type == "video") {
          filter = "video/*"
        } else if (type == "animation") {
          filter = "application/JSON"
        }
        fileInput.type = "file"
        fileInput.accept = filter
        fileInput.addEventListener("change", function () {
          var formData = new FormData()
          formData.append("thumbnail", fileInput.files[0])
          formData.append("type", type)
          $.ajax({
            url: "/admin/banner/thumbnail",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (res) {
              $(".sample-bg").remove()
              $(".sample-banner").css("background", "")
              backgroundType = type;
              backgroundUrl = res.url;
              backgroundThumbnail = res.key;
              if (type == "image") {
                $(".sample-banner").css("background", `url(${res.url})`)
              } else if (type == "video") {
                $(".sample-banner").prepend(`
                  <video class="sample-bg" preload="auto" autoplay="true" loop="loop" muted="muted" volume="0">
                    <source src="${res.url}">
                    </source>
                  </video>
                `)
              } else if (type == "animation") {
                $(".sample-banner").prepend(`
                  <lottie-player class="sample-bg" autoplay loop src="${res.url}">
                  </lottie-player>
                `)
              }
            },
          })
        })
        fileInput.click()
      } else {
      }
    })
    
    $(document).on("click", ".sample-description-save", function () {
      let sampleItem = $(this).closest('.sample');
      let id = sampleItem.data("id");
      let sampleDescriptionBox = $(this).closest('.sample-description-box');
      let sampleTextarea = sampleDescriptionBox.find('.sample-description-text');
      let description = sampleTextarea.val().trim();
      let undoText = sampleTextarea.attr('data-undo-text').trim();

      // if(description != undoText) {
        sampleItem.find('.sample-description-editing').hide();
        sampleItem.find('.sample-description-nonediting').show();
        sampleItem.find('.sample-description-text').prop('disabled', true);
      // }

      showEditButtons();
    });

    $(".sample-gallery").sortable({
      draggable: ".sample",
      swapThreshold: 1,
      animation: 150,
      onUpdate: function (e) {
        // console.log(e);
        showEditButtons();
      },
    });
  }

  return {
    init: function () {
      initSample();
      initRenameEvent();
    },
  };
};

$(function () {
  var instance = new admin();
  instance.init();
});
