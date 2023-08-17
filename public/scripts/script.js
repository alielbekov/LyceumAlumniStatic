
function openModal(imageSrc) {
  const modalImage = document.getElementById("modalImage");
  modalImage.src = imageSrc;

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

function deleteCommunityImage(link, year) {
  var password = prompt("Please enter the password to delete this image:");
  if (password !== null) {
      fetch("/delete-community-photo", {
          method: 'DELETE',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ link: link, year: year, password: password })
      })
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              // Remove the image from the DOM
              document.querySelector(`[src='${link}']`).parentElement.remove();
              
              // Display a success message
              alert("Image deleted successfully!");
          } else {
              // Display an error message
              alert("Failed to delete the image: " + (data.message || 'Incorrect password'));
          }
      })
      .catch(error => {
          // Handle any errors with the request itself
          alert("An error occurred while deleting the image. Please try again.");
      });
  }
}

function deleteMember(link, year) {
  var password = prompt("Please enter the password to delete this member:");
  if (password !== null) {
      fetch("/delete-member", {
          method: 'DELETE',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ link: link, year: year, password: password })
      })
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              // Remove the image from the DOM
              document.querySelector(`[src='${link}']`).parentElement.remove();
              
              // Display a success message
              alert("Member deleted successfully!");
          } else {
              // Display an error message
              alert("Failed to delete the member: " + (data.message || 'Incorrect password'));
          }
      })
      .catch(error => {
          // Handle any errors with the request itself
          alert("An error occurred while deleting the member. Please try again.");
      });
  }
}
