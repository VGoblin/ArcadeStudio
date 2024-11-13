// debugger;
var accordion = (function () {
  var $accordion = $(".js-accordion");
  var $accordion_header = $accordion.find(".js-accordion-header");
  var $accordion_item = $(".js-accordion-item");

  // default settings
  var settings = {
    // animation speed
    speed: 400,

    // close all other accordion items if true
    oneOpen: false,
  };

  return {
    // pass configurable object literal
    init: function ($settings) {
      $accordion_header.on("click", function () {
        accordion.toggle($(this));
      });

      $.extend(settings, $settings);

      // ensure only one accordion is active if oneOpen is true
      if (settings.oneOpen && $(".js-accordion-item.active").length > 1) {
        $(".js-accordion-item.active:not(:first)").removeClass("active");
      }

      $(".js-accordion-item:not(.active) > .js-accordion-header .project-buttons").fadeOut(0);
      // reveal the active accordion bodies
      $(".js-accordion-item.active").find("> .js-accordion-body").show();
      $(".js-accordion-item-inner.active").find("> .js-accordion-body").show();
    },
    toggle: function ($this) {
      if (
        settings.oneOpen &&
        $this[0] !=
        $this
          .closest(".js-accordion")
          .find(".js-accordion-item.active > .js-accordion-header")[0]
      ) {
        $this
          .closest(".js-accordion")
          .find(".js-accordion-item")
          .removeClass("active")
          .find(".js-accordion-body")
          .slideUp();
      }

      // show/hide the clicked accordion item
      $this.closest(".js-accordion-item").toggleClass("active");
      $this.next().stop().slideToggle(settings.speed);
      $(".js-accordion-item:not(.active) > .js-accordion-header .project-buttons").fadeOut();
      $(".js-accordion-item.active > .js-accordion-header .project-buttons").fadeIn();
    },
    close: function ($this) {
      $this
        .find(".js-accordion-item")
        .removeClass("active")
        .find(".js-accordion-body")
        .hide();
    },
  };
})();
const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};
$(document).ready(function () {
  accordion.init({
    speed: 300,
    oneOpen: true,
  });
  // $(".arcadestudio-title").on("mouseenter", function () {
  //     if(!$(".title-block").hasClass("opened")){
  //       $(".title-block").addClass("ready");
  //     }
  // });
  $(".menu-hamburger").on("mousedown", function () {
    if (!$(".title-block").hasClass("opened")) {
      openSideMenu();
    } else {
      closeSideMenu();
    }
  }).prop('disabled', $(".title-block").hasClass("opened"));
  

  $(".project-button .create-project").on("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    // $(this).addClass("d-none");
    $(".project-create").toggleClass("d-none");
  });

  $(".project-button .create-folder").on("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    let projectSubfolders = [];
    $(".project-item").map((index, obj) => {
      projectSubfolders.push($(obj).data("id"));
    })
    let newFolderName = "Untitled";
    if (newFolderName) {
      while (projectSubfolders.includes(newFolderName)) {
        newFolderName += " copy"
      }
    }
    const newFolder = $(`<div class="project-item" data-id="${newFolderName}">
          <div class="project-collection" id="${newFolderName}">
            <span data-property="title" class="editable folder-name">${newFolderName}</span>
          </div>
          <div class="project-item-chapters">
          </div>
        </div>
        `);
    var projectList = $(".project-list");
    projectList.append(newFolder);
  });

  $(".title-block").on("mouseleave", function () {
    //  $(".title-block").removeClass("ready")
  });

  // $(".learn-collection").on("mousedown", function() {
  //   $(this).next().toggleClass("opened");
  //   $(this).toggleClass("opened");
  // });

  $(document).on("click", ".project-collection", function (e) {
    if ($(this).find(".editable").length > 0) {
      if ($(this).find(".editable")[0].contentEditable == "true") {
        return;
      }
    }
    $(this).next().toggleClass("opened");
    $(this).toggleClass("opened");
  })

  $(document).on("click", "#js-accordion-assets-context", function () {
    $(".slide-menu").hide();
  })

  if ($('.alert').length != 0) {
    openSideMenu();
  }

  //create project list in sidebar
  let projectSubfolders = ["Recent"/*, "Examples"*/];
  var projectList = $(".project-list");
  // projectList.append($(`<div class="project-item" data-id="Examples">
  //   <div class="project-collection" id="Examples">
  //     <span data-property="title" class="folder-name">Examples</span>
  //   </div>
  //   <div class="project-item-chapters">
  //   </div>
  // </div>
  // `))
  projectList.append($(`<div class="project-item" data-id="recent">
    <div class="project-collection" id="recent">
      <span data-property="title" class="folder-name">recent</span>
    </div>
    <div class="project-item-chapters">
    </div>
  </div>
  `))
  var recentsFolder = projectList.find("[data-id='recent']");
  var examplesFolder = projectList.find("[data-id='Examples']");

  $.ajax({
    url: '/asset/project/list',
    type: 'GET',
    success: function (res) {
      let projects = res;

      projects = Array.from(projects);

      // sort based on last update
      projects.sort((project1, project2) => {

        let project1LatestDate = project1.updatedAt || project1.createdAt;
        let project2LatestDate = project2.updatedAt || project2.createdAt;

        if (!project1LatestDate) return -1;
        if (!project2LatestDate) return 1;

        return new Date(project1LatestDate) - new Date(project2LatestDate)

      })
      // projects.reverse()
      projects.map(project => {
        addProject(project)
      });
    }
  }).catch(err => {
    console.log(err);
  });

  $.ajax({
    url: '/asset/example-project/list',
    type: 'GET',
    success: function (res) {
      let projects = res;
      projects = Array.from(projects);
      projects.sort((a, b) => {
        return a.order - b.order;
      });
      // projects.reverse()
      projects.map(project => {
        if (window.isSuperAdmin) {
          examplesFolder.find(".project-item-chapters").append($(`
          <div class="project-item-chapter" draggable="true" data-project-id="${project.id}" data-example-project='${JSON.stringify(project)}'>
            <span data-property="title" class="editable project-name">${project.name}</span>
            <div class="project-buttons">
              <div class="project-button setting">
                <img src="https://arcadestudio-assets.s3.us-east-2.amazonaws.com/engine-ui/settings.svg">
              </div>
              <div class="project-button example-launch">
                <img src="https://arcadestudio-assets.s3.us-east-2.amazonaws.com/engine-ui/play-icon.svg">
              </div>
              <div class="project-button delete">
                <img src="https://arcadestudio-assets.s3.us-east-2.amazonaws.com/engine-ui/delete-icon.svg">
              </div>
            </div>
          </div>
          `));
        }
        else {
          examplesFolder.find(".project-item-chapters").append($(`
          <div class="project-item-chapter" data-project-id="${project.id}" data-example-project='${JSON.stringify(project)}'>
            <span data-property="title" class="editable project-name">${project.name}</span>
            <div class="project-buttons">
              <div class="project-button example-launch">
                <img src="https://arcadestudio-assets.s3.us-east-2.amazonaws.com/engine-ui/play-icon.svg">
              </div>
            </div>
          </div>
          `));
        }
      });
    }
  }).catch(err => {
    console.log(err);
  });

  function addProject(project) {
    if (!project.category || project.category === "recent") {
      recentsFolder.find(".project-item-chapters").prepend($(`
      <div class="project-item-chapter" draggable="true" data-project-id="${project.id}">
        <span data-property="title" class="editable project-name">${project.name}</span>
        <div class="project-buttons">
          <div class="project-button launch">
            <img src="https://arcadestudio-assets.s3.us-east-2.amazonaws.com/engine-ui/play-icon.svg">
          </div>
          <div class="project-button duplicate">
            <img src="https://arcadestudio-assets.s3.us-east-2.amazonaws.com/engine-ui/copy-icon.svg">
          </div>
          <div class="project-button delete">
            <img src="https://arcadestudio-assets.s3.us-east-2.amazonaws.com/engine-ui/delete-icon.svg">
          </div>
        </div>
      </div>
      `));
    } else {
      if (!projectSubfolders.includes(project.category)) {
        projectSubfolders.push(project.category)
        const newFolder = $(`<div class="project-item" data-id="${project.category}">
          <div class="project-collection" id="${project.category}">
            <span data-property="title" class="editable folder-name">${project.category}</span>
          </div>
          <div class="project-item-chapters">
          </div>
        </div>
        `);

        newFolder.find(".project-item-chapters").prepend($(`
        <div class="project-item-chapter" draggable="true" data-project-id="${project.id}">
          <span data-property="title" class="editable project-name">${project.name}</span>
          <div class="project-buttons">
            <div class="project-button launch">
              <img src="https://arcadestudio-assets.s3.us-east-2.amazonaws.com/engine-ui/play-icon.svg">
            </div>
            <div class="project-button duplicate">
              <img src="https://arcadestudio-assets.s3.us-east-2.amazonaws.com/engine-ui/copy-icon.svg">
            </div>
            <div class="project-button delete">
              <img src="https://arcadestudio-assets.s3.us-east-2.amazonaws.com/engine-ui/delete-icon.svg">
            </div>
          </div>
        </div>
        `));
        projectList.append(newFolder);
      } else {
        const existingFolder = $(`.project-item[data-id='${project.category}']`);
        let body = existingFolder.find(".project-item-chapters");
        const { firstChild } = body;
        let newChild = $(`
        <div class="project-item-chapter" draggable="true" data-project-id="${project.id}">
          <span data-property="title" class="editable project-name">${project.name}</span>
          <div class="project-buttons">
            <div class="project-button launch">
              <img src="https://arcadestudio-assets.s3.us-east-2.amazonaws.com/engine-ui/play-icon.svg">
            </div>
            <div class="project-button duplicate">
              <img src="https://arcadestudio-assets.s3.us-east-2.amazonaws.com/engine-ui/copy-icon.svg">
            </div>
            <div class="project-button delete">
              <img src="https://arcadestudio-assets.s3.us-east-2.amazonaws.com/engine-ui/delete-icon.svg">
            </div>
          </div>
        </div>
        `);
        if (firstChild) {
          body.insertBefore(newChild, firstChild)
        } else {
          body.append(newChild)
        }
      }
    }
  }

});

$(".submit-button").on("click", function (e) {
  e.preventDefault();
  const $formBlock = $(this).closest(".form-block");

  var t = $(document.head).find("meta[name=csrf-token]");
  var csrfToken = ""
  if (t.length == 1) {
    csrfToken = t.attr("content")
  }
  if (!validateEmail($formBlock.find('[name="email"]').val())) {
    $formBlock.find(".w-form-result.email").fadeIn().delay(1000).fadeOut();
  } else {
    $.ajax({
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Csrf-Token', csrfToken);
        xhr.setRequestHeader('X-Csrf-Token', csrfToken);
      },

      url: "/contact",
      type: "POST",
      data: {
        name: $formBlock.find('[name="name"]').val(),
        email: $formBlock.find('[name="email"]').val(),
        message: $formBlock.find('[name="message"]').val(),
        type: $formBlock.find('[name="type"]').val()
      },
      success: function (res) {
        $formBlock.find(".w-form-result.success").fadeIn().delay(1500).fadeOut();
        window.setTimeout(() => {
          $formBlock.find('[name="name"]').val("");
          $formBlock.find('[name="email"]').val("");
          $formBlock.find('[name="message"]').val("");
        }, 1500);
      },
      error: function (err) {
        console.log(err);
        $formBlock.find(".w-form-result.error").fadeIn().delay(1000).fadeOut();
      },
    });
  }
});

$(".side-space").on("mousedown", checkIfNeedToClose)

$(document).on("click", ".create-item#profile", function (e) {
  closeSideMenu();
});

$("#outside-delete-folder-menu .delete-folder").on("click", (e) => {
  let menu = $("#outside-delete-folder-menu");
  let projects = $(`.project-item[data-id='${menu.attr("data-id")}']`).find(".project-item-chapters .project-item-chapter");
  projects.map((index, element) => {
    let recentsFolderBody = document.querySelector(`.project-item[data-id='recent'] .project-item-chapters`);
    let firstChild = recentsFolderBody.firstChild;
    if (firstChild) {
      recentsFolderBody.insertBefore(element, firstChild)
    } else {
      recentsFolderBody.appendChild(element)
    }

    $.post("/asset/project/update", { id: element.dataset['projectId'], data: { category: "recent" } }).then(res => {

    }).catch(err => {
      alert("Something went wrong")
      console.error(err)
    })
  });
  $(`.project-item[data-id='${menu.attr("data-id")}']`).remove();
  menu.hide()
})

$("#outside-delete-folder-menu .delete-folder-and-projects").on("click", (e) => {
  const confirmed = confirm("Are you sure you want to delete the folder and all the projects in it?")
  let menu = $("#outside-delete-folder-menu");
  if (confirmed) {
    let projects = $(`.project-item[data-id='${menu.attr("data-id")}']`).find(".project-item-chapters .project-item-chapter");
    projects.map((index, element) => {
      $.post("/asset/project/delete", { id: element.dataset['projectId'], }).then(res => {

      }).catch(err => {
        alert("Something went wrong")
        console.error(err)
      })
    })
    $(`.project-item[data-id='${menu.attr("data-id")}']`).remove();
  }
  menu.hide()
})

$(document).on("contextmenu", ".project-container .project-list .project-collection", (e) => {
  e.preventDefault();
  e.stopPropagation();
  let menu = $("#outside-delete-folder-menu");
  menu.attr("data-id", e.target.id);
  menu.css("left", (e.clientX) + 'px');
  menu.css("top", (e.clientY) + 'px');
  menu.show();
});


$(document).on("dragover", ".project-container .project-item", (e) => {
  e.currentTarget.style.opacity = "0.7";
  e.preventDefault();
})

$(document).on("dragleave", ".project-container .project-item", (e) => {
  e.currentTarget.style.opacity = "1";
})

$(document).on("dragstart", ".project-container .project-item", (e) => {
  const projectId = $(e.target.closest(".project-item-chapter")).attr("data-project-id");
  e.originalEvent.dataTransfer.setData('projectId', projectId);
})

$(document).on("drop", ".project-container .project-item", (e) => {
  e.currentTarget.style.opacity = "1";
  // const projectId = $(e.target.closest(".project-item-chapter")).attr("data-project-id");
  // if (!projectId) return;
  let projectId = e.originalEvent.dataTransfer.getData('projectId');
  let projectDOM = document.querySelector(`[data-project-id="${projectId}"`)
  if (projectDOM) {
    const { firstChild } = $(e.currentTarget).find(".project-item-chapters")[0];
    if (firstChild) {
      $(e.currentTarget).find(".project-item-chapters")[0].insertBefore(projectDOM, firstChild)
    } else {
      $(e.currentTarget).find(".project-item-chapters")[0].appendChild(projectDOM)
    }

    $.post("/asset/project/update", { id: projectId, data: { category: e.currentTarget.dataset["id"] } }).then(res => {
    }).catch(err => {
      alert("Something went wrong")
      console.error(err)
    })
  }

})

function closeSideMenu() {
  $('.popuplearn-wrapper').css('display', 'none');
  $('.popupterms-wrapper').css('display', 'none');
  accordion.close($(".side-menu"));
  $(".side-menu").removeClass('opened').addClass("closed");
  $(".title-block").removeClass("opened");
}
function openSideMenu() {
  $(".side-menu").removeClass("closed").addClass('opened');
  $(".title-block").addClass("opened");
}
function checkIfNeedToClose(e) {
  if ($(".title-block").hasClass("opened")) {
    if (window.innerWidth - e.pageX > 380) {
      closeSideMenu();
    }
  }
  // if($(".title-block").hasClass("ready")){
  //     if(e.pageX>380){
  //         $(".title-block").removeClass("ready")
  //     }
  // }  
}

window.addEventListener("click", (e) => {
  let menu = $("#outside-delete-folder-menu");
  if (menu[0].contains(e.target) || menu[0] === e.target) {
    return;
  } else {
    menu.hide();
  }
})
