// cropper.js
const image = document.getElementById("member-image");
const outputImage = document.getElementById("output-image"); // Replace 'yourOutputImageId' with the actual id of the output image
let cropper = null; // Define the cropper variable outside the event listener


function updateLastName() {
  let lName = document.getElementById("lastNameInput").value;
  document.getElementById("lastNameOutput").innerHTML = lName;
}

function updateFirstName() {
  let fName = document.getElementById("firstNameInput").value;
  document.getElementById("firstNameOutput").innerHTML = fName;
}

function initializeCropper() {
  cropper = new Cropper(image, {
    aspectRatio: 1,
    viewMode: 3,
  });

  crop();

}




document.getElementById("imageFile").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    // Destroy the existing cropper if it exists
    if (cropper) {
      cropper.destroy();
    }
  
    try {
      const compressedResult = await compressImage(file); // Wait for the compression to finish
      const compressedBlob = new Blob([compressedResult], { type: 'image/jpeg' }); // Assuming the compressed result is in JPEG format
      const compressedFile = new File([compressedBlob], 'compressed-image.jpg', { type: 'image/jpeg' }); // Creating a new File object with the compressed data
      const reader = new FileReader();
      reader.onload = (event) => {
        // Create a new image element with the compressed image file
        const newImage = new Image();
        newImage.src = event.target.result;
  
        newImage.onload = () => {
          // Replace the old image element with the new one
          image.src = newImage.src;
  
          // Initialize the Cropper with the updated image
          initializeCropper();
        };
      };
  
      reader.readAsDataURL(compressedFile); // Read the compressed image as Data URL
    } catch (error) {
      console.error(error);
    }
  });

function compressImage(file) {
return new Promise((resolve, reject) => {
    const compressor = new Compressor(file, {
    quality: 1,
    success(result) {
        resolve(result);
    },
    error(err) {
        reject(err);
    },
    });
});
}

function crop(){
  const canvas = cropper.getCroppedCanvas();
  const croppedImageUrl = canvas.toDataURL("image/png"); // Converts the canvas to an image
  
  outputImage.src = croppedImageUrl; // Put it in the output image
  document.getElementById('srcInput').value = croppedImageUrl; // Set the hidden input's value to the cropped image's URL
  document.getElementById('errorMessage').innerText = '';

}


// Initialize Cropper when the page loads
initializeCropper();
