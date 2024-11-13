$(".forgot-password").click(function () {
  var email = $(".login-form input[name=email]").val();
  var csrf_token = $('meta[name="csrf-token"]').attr("content");
  if (email) {
    $.ajax({
      url: '/forgot',
      type: 'post',
      data: {
        email: email,
        _csrf: csrf_token
      },
      success: function (res) {
        alert(res.msg);
      }
    })
  } else {
    alert('please input email address.');
  }
});

function showTab(element) {
  var id = element.data("target")
  if (id) {
    $(".tab-item:not(.portal-item)").removeClass("active")
    $(".tab-content").removeClass("open")
    element.addClass("active")
    $("#" + id).addClass("open")
  }
}

$(".tab-item").click(function () {
  showTab($(this))
  $(document).trigger("top-menu-change")
})

function onSubmit(token) {
  console.log(token, "token")
  document.getElementById("signup-form").submit();
}