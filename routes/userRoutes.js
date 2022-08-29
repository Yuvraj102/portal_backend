const express = require("express");
const router = express.Router();
const {
  getGoogleLink,
  googleRedirect,
  protect,
  updateUser,
  getMeInfo,
} = require("./../controllers/userController");
const {
  getTeachers,
  getNotesFromEmail,
  getTeacherWithEmail,
  deleteNotesWithId,
} = require("./../controllers/userController");

// this will return a link
router.get("/getGoogleLink", getGoogleLink);
// google auth redirect, called by google only, this will return {status:'success',token}, if fail than {status:'fail',message}
router.get("/redirect/google", googleRedirect);
// update logged in user
// this will return {status:'success',updatedUser} on fail {status:'fail',message}
router.patch("/updateUser", protect, updateUser);
// get user info based of token
router.get("/getMe", protect, getMeInfo);
router.get("/getTeachers", getTeachers);
router.get("/getTeacherWithEmail", getTeacherWithEmail);

router.get("/getNotes", getNotesFromEmail);
router.get("/deleteNote", protect, deleteNotesWithId);
module.exports = router;
