const cloudinary = require("cloudinary").v2;
// const {v4: uuid} = require("uuid")

cloudinary.config({
  cloud_name: "dfiepbmnh",
  api_key: process.env.Cloudinary_Api_Key,
  api_secret: process.env.Cloudinary_Api_Secret,
  //secure: true
});

module.exports.uploadFileCloudinary = async (file, fileData) => {
  const result = await cloudinary.uploader.upload(
    file.tempFilePath,

    {
      folder: "notes",
    }
  );

  if (!result) {
    return new AppError(`err uploading file to cloud:${err}`, 500);
  } else {
    return result;
  }
};

module.exports.destroyCloudinary = async (public_id) => {
  const result = await cloudinary.uploader.destroy(public_id);
  if (!result) {
    return new Error("err deleting");
  } else {
    return result;
  }
};
