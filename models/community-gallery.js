const mongoose = require('mongoose');

const communityGallerySchema = new mongoose.Schema({
  imagesLinks: {
    type: [String],
    required: true
  },
  year: {
    type: Number,
    required: true
  }
});

const CommunityGallery = mongoose.model('community-gallery', communityGallerySchema);

module.exports = CommunityGallery;
