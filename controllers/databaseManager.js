const mongoose = require("mongoose");
const userModel = require("./../models/userModel");
const questionModel = require("./../models/questionModel");
const commentModel = require("./../models/commentModel");
const notesModel = require("./../models/notesModel");
const { destroyCloudinary } = require("./cloudinary");

module.exports.registerUser = async (user) => {
  //   check if the user already exits if so no need to save again
  let presentUser = await userModel.findOne({ email: user.email });
  if (presentUser) {
    return presentUser;
  }
  let savedUser = await userModel.create(user);
  return savedUser;
};
// create post
module.exports.createPost = async (postData) => {
  const savedPost = await questionModel.create({
    title: postData.title,
    body: postData.body,
    from: postData.email,
  });
  return savedPost;
};
// updatePost
module.exports.updatePostInDb = async (postQuery, updateObj) => {
  delete updateObj.id;
  Object.keys(updateObj).forEach((el) => {
    postQuery[el] = updateObj[el];
  });
  postQuery.save();
  return postQuery;
};
// get post by id
module.exports.getPostById = async (id) => {
  const post = await questionModel.findById(id);
  return post;
};

// Comments
// create comment
module.exports.addComment = async (body, postId, from) => {
  return await commentModel.create({ body, postID: postId, from });
};

module.exports.upvote = async (postQuery, email) => {
  let upvoteArr = postQuery.upVotes;
  if (upvoteArr.includes(email)) {
    // user alredy liked
    return postQuery;
  }
  postQuery.upVotes.push(email);
  const updatedPost = await postQuery.save();
  return updatedPost;
};
module.exports.downvote = async (postQuery, email) => {
  let downVoteArr = postQuery.downVotes;
  if (downVoteArr.includes(email)) {
    // user alredy downvoted

    return postQuery;
  }
  postQuery.downVotes.push(email);
  const updatedPost = await postQuery.save();
  return updatedPost;
};

module.exports.getCommentsForPost = async (postID) => {
  // console.log(postID);
  let comments = await commentModel.find({ postID });
  return comments;
};
module.exports.getAllQuestions = async () => {
  let questions = await questionModel.find();
  return questions;
};

module.exports.getMongoUserFromToken = async (id) => {
  let user = await userModel.find({ _id: id });
  return user;
};
module.exports.getAllQuestionsForUser = async (email) => {
  let questions = await questionModel.find({ from: email });
  return questions;
};

module.exports.deletePostWithId = async (postId) => {
  await questionModel.deleteOne({ _id: postId });
  return null;
};
module.exports.deletCommentsWithPostId = async (postId) => {
  await commentModel.deleteMany({ postID: postId });
  return null;
};

module.exports.getTeachersWithName = async (getAll, name) => {
  if (getAll) {
    return await userModel.find({ designation: "teacher" });
  } else {
    return await userModel.find({
      designation: "teacher",
      username: new RegExp(`^${name}`, "i"),
      // username: /^name/i,
    });
  }
};

module.exports.getTeacherWithEmail = async (email) => {
  return await userModel.findOne({ designation: "teacher", email });
};

// get notes

module.exports.getNotesForUser = async (email) => {
  return await notesModel.find({ postedBy: email });
};

module.exports.deleteNotesWithId = async (id, note) => {
  const result = await destroyCloudinary(note.publicId);
  if (typeof result === "Error") {
    console.log("err deleting notes in cloudinary", result);
    return result;
  }
  return await notesModel.deleteOne({ _id: id });
};
