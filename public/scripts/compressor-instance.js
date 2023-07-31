// compressor.js
function compressImage(file) {
    return new Promise((resolve, reject) => {
      const compressor = new Compressor(file, {
        quality: 0.9,
        success(result) {
          resolve(result);
        },
        error(err) {
          reject(err);
        },
      });
    });
  }
  
  export { compressImage };
  