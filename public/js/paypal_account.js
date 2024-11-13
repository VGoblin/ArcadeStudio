(function () {
  $(function () {
    var csrf_token = $('meta[name="csrf-token"]').attr("content");
    paypal
      .Buttons({
        createSubscription: async function (data, actions) {
          return fetch("/payment/paypal-plan", {
            method: "post",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              _csrf: csrf_token,
              coupon: $(".coupon-code").val(),
            }),
          })
            .then(function (response) {
              return response.json();
            })
            .then(function (msg) {
              return actions.subscription.create({
                plan_id: msg.planId,
              });
            });
        },
        onApprove: function (data, actions) {
          $.ajax({
            method: "POST",
            url: "/payment/paypal-subscribe",
            dataType: "json",
            data: {
              subscriptionId: data.subscriptionID
            },
            success: function (status) {
              window.location.href = "/create/portfolio";
            },
          });
        },
        onError: function (err) {
          console.log(err);
        },
      })
      .render("#paypal-button");
  });
})();
