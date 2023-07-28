const image = document.getElementById("member-image");
const outputImage = document.getElementById("output-image"); // Replace 'yourOutputImageId' with the actual id of the output image
const cropper = new Cropper(image, {
  aspectRatio: 1,
  viewMode: 3,
  crop() {
    const canvas = this.cropper.getCroppedCanvas();
    outputImage.src = canvas.toDataURL("image/png"); // Converts the canvas to an image and put it in the output image
  },
});
function updateLastName() {
  let lName = document.getElementById("lastNameInput").value;
  document.getElementById("lastNameOutput").innerHTML = lName;
}

function updateFirstName() {
  let fName = document.getElementById("firstNameInput").value;
  document.getElementById("firstNameOutput").innerHTML = fName;
}

function updateImage() {
  let croppedImage = cropper.getCroppedCanvas();
  // .toDataURL("image/jpg");

  alert(typeof croppedImage);
}
updateImage();
