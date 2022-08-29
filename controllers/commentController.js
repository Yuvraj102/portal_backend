const AppError = require("./../utils/appError");
const dbManager = require("./databaseManager");

module.exports.createComment = async (req, res, next) => {
  // check if all required fields are present
  let body = req.body.body,
    postId = req.body.postId,
    from = req.loggedUser.email;
  if (!body || !postId || !from) {
    next(new AppError("missing parameters need body,from,postId", 400));
  }
  try {
    let comment = await dbManager.addComment(body, postId, from);
    res.status(201).json({
      status: "success",
      comment,
    });
  } catch (err) {
    next(new AppError(`err creating comment:${err.message}`, 500));
  }
};

module.exports.getComments = async (req, res, next) => {
  let postId = req.params.postId;
  if (!postId) {
    next(new AppError(`post ID not found:${err.message}`, 400));
  }
  try {
    let comments = await dbManager.getCommentsForPost(postId);
    res.status(200).json({
      status: "success",
      comments,
    });
  } catch (err) {
    next(new AppError(`err fetching comments:${err.message}`, 400));
  }
};
