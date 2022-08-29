const express = require("express");
const router = express.Router();
const {
  create,
  updatePost,
  upDownVotePost,
  getAllQuestions,
  getQuestionsForUser,
  deletePost,
  uploadFile,
} = require("./../controllers/questionController");
const { protect } = require("./../controllers/userController");

router.get("/getAllQuestions", protect, getAllQuestions);
// this will return {status:'success',savedPost}
router.post("/create", protect, create);
// this will return {status:'success',updatedPost}
router.patch("/updatePost", protect, updatePost);
// this will return {status:'success',updatedPost}
router.patch("/votePost", protect, upDownVotePost);
// get questions posted by particular user
router.get("/getQuestionsForUser/:email", protect, getQuestionsForUser);
// upload notes file pdf
router.post("/uploadFile", protect, uploadFile);

// delete a post wiht id
router.delete("/deletePost/:postID", protect, deletePost);
module.exports = router;
