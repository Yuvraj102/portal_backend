const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "title is required field"],
    maxlength: 200,
  },
  body: {
    type: String,
    required: [true, "body is required field"],
  },
  upVotes: {
    type: [String], //these should actually be [String] ,email of people who voted
    default: [],
  },
  downVotes: {
    type: [String],
    default: [],
  },
  from: {
    type: String,
    required: [true, "from is required field"],
  },
  date: {
    type: String,
    default: new Date().toLocaleDateString(),
  },
});

module.exports = mongoose.model("Questions", questionSchema);
