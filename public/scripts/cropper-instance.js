const image = document.getElementById("member-image");

const cropper = new Cropper(image, {
  aspectRatio: 1,
  viewMode: 3,
});

var observer = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutationRecord) {
    console.log("style changed!");
  });
});
const cropperCropBox = document.getElementsByClassName("cropper-crop-box")[0];
observer.observe(image, { attributes: true, attributeFilter: ["style"] });

function updateLastName() {
  let lName = document.getElementById("lastNameInput").value;
  document.getElementById("lastNameOutput").innerHTML = lName;
}

function updateFirstName() {
  let fName = document.getElementById("firstNameInput").value;
  document.getElementById("firstNameOutput").innerHTML = fName;
}
