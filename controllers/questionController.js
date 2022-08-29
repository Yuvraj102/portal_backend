const AppError = require("./../utils/appError");
const dbManager = require("./databaseManager");
const { uploadFileCloudinary } = require("./cloudinary");
const Notes = require("./../models/notesModel");

module.exports.create = async (req, res, next) => {
  const title = req.body.title.substring(0, 201),
    body = req.body.body;
  if (!title || !body) {
    return next(new AppError("no title or post body present", 400));
  }
  try {
    const savedPost = await dbManager.createPost({
      title,
      body,
      email: req.loggedUser.email,
    });
    return res.status(201).json({
      status: "success",
      savedPost,
    });
  } catch (err) {
    return next(
      new AppError(`err in creating and saving new post :${err.message}`, 500)
    );
  }
};
// uploadNotes
module.exports.uploadFile = async (req, res, next) => {
  if (req.loggedUser.designation !== "teacher") {
    return next(new Error("only teachers can upload notes"));
  }
  if (!req.files || !req.body) {
    return next(new AppError("body or file not present"));
  }

  const result = await uploadFileCloudinary(req.files.file);
  if (result instanceof Error) {
    return next(new AppError("Error uploading notes"));
  }
  const newNote = await Notes.create({
    title: req.body.title,
    postedBy: req.loggedUser.email,
    postedById: req.loggedUser._id,
    publicId: result.public_id,
    downloadUrl: result.secure_url,
  });

  // cloudinary upload
  res.status(201).json({
    status: "success",
  });
};

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};
module.exports.updatePost = async (req, res, next) => {
  // we only update 2 things title and body
  const filteredObj = filterObj(req.body, "title", "body", "id");
  if (!filteredObj) {
    return next(new AppError("need title,body or id for post updating", 400));
  }
  //   authorize if particular post belongs to particular user
  // get post with id
  try {
    const post = await dbManager.getPostById(filteredObj.id);
    if (!post) {
      return next(new AppError("there was no post found", 404));
    }
    // console.log("Update post>>", post);
    if (!(req.loggedUser.email === post.from)) {
      // post is not from user
      return next(
        new AppError("user can only update post that belongs to them", 400)
      );
    }
    let updatedPost = await dbManager.updatePostInDb(post, filteredObj);
    return res.status(201).json({
      status: "success",
      updatedPost,
    });
  } catch (err) {
    return next(new AppError(`err getting and updating post:${err}`, 500));
  }
};

module.exports.upDownVotePost = async (req, res, next) => {
  const filteredObj = filterObj(req.body, "upvote", "downvote", "id");
  if (!filteredObj) {
    return next(
      new AppError("need upvote,dowvote or id for post updating", 400)
    );
  }
  try {
    const post = await dbManager.getPostById(filteredObj.id);
    if (!post) {
      return next(new AppError("there was no post found", 404));
    }
    if (!filteredObj.upvote && !filteredObj.downvote) {
      return next(new AppError("need upvote,dowvote property", 400));
    }
    if (filteredObj.upvote) {
      // upvote it
      console.log("upvoted:", filteredObj.upvote);
      const updatedPost = await dbManager.upvote(post, req.loggedUser.email);
      return res.status(201).json({
        status: "success",
        updatedPost,
      });
    } else if (filteredObj.downvote) {
      // downvote it
      console.log("downvoted:", filteredObj.downvote);
      const updatedPost = await dbManager.downvote(post, req.loggedUser.email);
      return res.status(201).json({
        status: "success",
        updatedPost,
      });
    }
  } catch (err) {
    return next(new AppError(`err upvoting downvoting post:${err}`, 500));
  }
};

module.exports.getAllQuestions = async (req, res, next) => {
  try {
    let questions = await dbManager.getAllQuestions();
    return res.status(200).json({
      status: "success",
      questions,
    });
  } catch {
    return next(new AppError(`err fetching questions:${err.message}`, 500));
  }
};

module.exports.getQuestionsForUser = async (req, res, next) => {
  let email = req.params.email;
  if (email) {
    try {
      let questions = await dbManager.getAllQuestionsForUser(email);
      return res.status(200).json({
        status: "success",
        questions,
      });
    } catch {
      return next(
        new AppError(`err fetching questions for a pt user:${err.message}`, 500)
      );
    }
  } else {
    return next(
      new AppError(
        `err fetching questions for a pt user email param not found:${err.message}`,
        403
      )
    );
  }
};

module.exports.deletePost = async (req, res, next) => {
  const postID = req.params.postID;
  // check if post belongs to particular user

  const post = await dbManager.getPostById(postID);

  if (!post) {
    return next(new AppError(`no post with id found `, 403));
  }
  if (!(req.loggedUser.email === post.from)) {
    return next(new AppError(`one can only delete post that they own `, 403));
  }
  if (postID) {
    try {
      await dbManager.deletePostWithId(postID);
      //  also delete comment related to that post
      await dbManager.deletCommentsWithPostId(postID);
      return res.status(200).json({
        status: "success",
      });
    } catch (err) {
      return next(
        new AppError(`err fetching questions for a pt user:${err.message}`, 500)
      );
    }
  } else {
    return next(new AppError(`post id not found while making req`, 403));
  }
};
