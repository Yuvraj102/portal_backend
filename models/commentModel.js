const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  body: {
    type: String,
    required: [true, "body is required field"],
  },
  postID: {
    type: String,
    required: [true, "postID is required field"],
  },
  from: {
    type: String,
    required: [true, "comment from is required field"],
  },
  acceptanceStatus: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Comments", commentSchema);
