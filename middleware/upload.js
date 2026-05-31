const multer = require("multer");

const { CloudinaryStorage } = require("multer-storage-cloudinary");

const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,

  params: {
    folder: "carex-reports",

    resource_type: "auto",

    allowed_formats: ["pdf", "png", "jpg", "jpeg"],
  },
});

const upload = multer({ storage });

module.exports = upload;