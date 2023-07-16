function openModal(imageSrc) {
    const modalImage = document.getElementById('modalImage');
    modalImage.src = imageSrc;
    $('.bd-example-modal-lg').modal('show'); // Show the modal using Bootstrap jQuery

    // Listen for the popstate event
    window.addEventListener('popstate', closeModalOnBack);
    
    // Update the browser history with a new state
    history.pushState(null, null, '#modal');
  }

function closeModalOnBack() {
const modal = $('.bd-example-modal-lg');
if (modal.hasClass('show')) {
    modal.modal('hide'); // Hide the modal using Bootstrap jQuery
}
}

// Detect when the modal is closed using Bootstrap events
$('.bd-example-modal-lg').on('hidden.bs.modal', function () {
window.removeEventListener('popstate', closeModalOnBack); // Remove the popstate event listener
history.back(); // Go back to the previous URL
});

