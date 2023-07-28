document.getElementById("imageFile").addEventListener("change", (e) => {
const file  = e.target.files[0];
if(!file) return
new Compressor(file, {
    quality: 0.9,
    success(result) {  
        console.log(result);
    }
});

});