const mongoose = require("mongoose");

const notesSchema = new mongoose.Schema({
  title: {
    type: "String",
    required: [true, "title is needed"],
  },
  postedBy: {
    type: "String",
    required: [true, "postedBy email is needed"],
  },
  postedById: {
    type: mongoose.Types.ObjectId,
    required: [true, "postedById is needed"],
  },
  publicId: {
    type: "String",
    required: [true, "publicId  is needed"],
  },
  downloadUrl: {
    type: "String",
    required: [true, "downloadUrl  is needed"],
  },
});

module.exports = mongoose.model("Note", notesSchema);
