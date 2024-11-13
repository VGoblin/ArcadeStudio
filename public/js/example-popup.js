var uploadThumbnailInput = null;
var uploadedThumbail = null;
const randomId = "a-ver-random-id-for-this-image-1234";
$(document).ready(function() {
  uploadThumbnailInput = $("#upload-example-thumbnail")[0];
  
  uploadThumbnailInput.addEventListener('input', (e) => {
		if (uploadThumbnailInput.files) {
			const [file] = uploadThumbnailInput.files;
			if (file) {
				uploadThumbnailInput.value = '';
				uploadedThumbail = file;
				
        const imageURL = URL.createObjectURL(uploadedThumbail) 
        
        let existingPreview = document.getElementById(randomId);
      
        if (existingPreview){
          existingPreview.src = imageURL
        }else{
          const preview = new Image()
          preview.id=randomId;
          preview.src = imageURL;
          preview.style.height="30px";
          preview.style.width = "30px";
          $(".upload-thumbnail-btn-container").append(preview);
        }
			}
		}
	});
})

$(".example-modal .submit-btn").click(function (event) {
  let project = $(".example-modal").data("example-project");
  let title = $(".example-modal .title-input").val();
  let description = $(".example-modal .description-input").val();
  let vimeoId = $(".example-modal .vimeo-input").val();
  project.title = title;
  project.description = description;
  project.vimeoId = vimeoId;
  try
  {
    $.ajax({
      type: "PUT",
      url: `/asset/example-project/${project.id}`,
      dataType: "JSON",
      data: project,
      success: function (result) {
        $(`[data-project-id="${project.id}"]`).attr("data-example-project", JSON.stringify(result));
      },
    })

    if (uploadedThumbail) {
      var formData = new FormData();
      formData.append("thumbnail", uploadedThumbail);
      formData.append("id", project.id + '');
      $.ajax({
        url: "/asset/example-project/thumbnail",
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        beforeSend: function(xhr) {
          xhr.setRequestHeader('X-CSRF-TOKEN', ''); // Set empty CSRF token to ignore it
        },
        success: function (res) {
          
        },
      });
    }
    uploadedThumbail = null;
    $(`#${randomId}`).remove();
    $('.example-modal').css("display", "none");
  }
  catch (e) {
    console.log(e);
  } 
});

$("#upload-thumbnail-btn").click(function (event) {
  try
  {
    $(uploadThumbnailInput).click();
    event.preventDefault();
    event.stopPropagation();
  }
  catch (e) {
    console.log(e);
  } 
});

$(".main").on('click', function (event) {
  if ($('.example-modal').css("display") == "none" && $('.example-launch-modal').css("display") == "none")
    return;
  if (!event.clientX)
    return;
  var rect = $(".example-modal .main-container")[0].getBoundingClientRect();
  var isInDialog=(rect.top <= event.clientY && event.clientY <= rect.top + rect.height
    && rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
  if (!isInDialog) {
    $('.example-modal').css("display", "none");
    $(`#${randomId}`).remove();
  }

  rect = $(".example-launch-modal .content")[0].getBoundingClientRect();
  isInDialog=(rect.top <= event.clientY && event.clientY <= rect.top + rect.height
    && rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
  if (!isInDialog) {
    $('.example-launch-modal').css("display", "none");
    $(`#${randomId}`).remove();
  }
});

$(document).on("click", ".launch-project-btn", function () {
  var exampleid = $(this).data("project-id")
  $.ajax({
    type: "POST",
    url: `/asset/example-project/create-normal-project/${exampleid}`,
    success: function (result) {
      if (result.status == "success") {
        window.location.href = `/asset/projects/${result.id}`;
      } else if (result.status == "limit") {
      }
    }
  })
})
