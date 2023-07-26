var cropper;
var $image = $("#image-preview");

function openModal(imageSrc) {
  const modalImage = document.getElementById("modalImage");
  modalImage.src = imageSrc;

  // Initialize cropper
  cropper = new Cropper(modalImage);

  $(".bd-example-modal-lg").modal("show"); // Show the modal using Bootstrap jQuery

  // Listen for the popstate event
  window.addEventListener("popstate", closeModalOnBack);

  // Update the browser history with a new state
  history.pushState(null, null, "#modal");
}

function closeModalOnBack() {
  const modal = $(".bd-example-modal-lg");
  if (modal.hasClass("show")) {
    modal.modal("hide"); // Hide the modal using Bootstrap jQuery
  }
}

// Detect when the modal is closed using Bootstrap events
$(".bd-example-modal-lg").on("hidden.bs.modal", function () {
  window.removeEventListener("popstate", closeModalOnBack); // Remove the popstate event listener
  history.back(); // Go back to the previous URL
});

$("#upload-photo").change(function (e) {
  var files = e.target.files;

  var done = function (url) {
    $image.attr("src", url);
    $image.show();
    openModal(url);
  };

  if (files && files.length > 0) {
    reader = new FileReader();
    reader.onload = function (e) {
      done(reader.result);
    };
    reader.readAsDataURL(files[0]);
  }
});
