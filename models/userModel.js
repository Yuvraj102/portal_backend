const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "email is required field"],
    unique: true,
  },
  username: {
    type: String,
    required: [true, "username is required field"],
  },
  profilePhotoUrl: {
    type: String,
    required: [true, "profile photo url is required field"],
  },
  department: {
    type: String,
    default: "all",
    maxlength: 30,
  },
  questions: {
    type: Number,
    default: 0,
  },
  bio: {
    type: String,
    default: "no bio at the moment..",
    maxlength: 200,
  },
  college: {
    type: String,
    default: "not available at the time",
    maxlength: 50,
  },
  designation: {
    type: String,
    default: "student",
    enum: ["student", "teacher"],
  },
});

module.exports = mongoose.model("Users", userSchema);
