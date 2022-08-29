const express = require("express");
const router = express.Router();
const { protect } = require("./../controllers/userController");
const {
  createComment,
  getComments,
} = require("./../controllers/commentController");

// this will return {status:'success',createdPost}
router.post("/createComment", protect, createComment);
router.get("/getCommentsForPost/:postId", protect, getComments);
module.exports = router;
