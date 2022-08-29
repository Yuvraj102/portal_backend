const AppError = require("./../utils/appError");
const {
  googleLoginUrl,
  getAccessTokenFromCode,
  getUserInfoFromToken,
} = require("./../utils/googleConfig");
const dbManager = require("./databaseManager");
var jwt = require("jsonwebtoken");
const secretKey = "kasdh2324ldsj";
const userModel = require("./../models/userModel");
const { promisify } = require("util");
const notesModel = require("../models/notesModel");
//
const developmentRedirectUrl = "http://localhost:3000";
const productionRedirectUrl = "https://stdportal.netlify.app";
let redirectUrl = productionRedirectUrl;
if (process.env.DEVELOPMENT_MODE) {
  redirectUrl = developmentRedirectUrl;
}
module.exports.getGoogleLink = (req, res, next) => {
  res.status(200).json({
    status: "success",
    login_url: googleLoginUrl,
  });
};

module.exports.googleRedirect = async (req, res, next) => {
  const code = req.query.code;
  if (!code) return next(new AppError("Code paramQ missing", 400));
  getAccessTokenFromCode(code)
    .then((access_token) => {
      getUserInfoFromToken(access_token)
        .then((gooleUserData) => {
          // save to db

          let dataToSave = {
            email: gooleUserData.email,
            profilePhotoUrl: gooleUserData.picture,
            username: gooleUserData.name,
          };
          dbManager
            .registerUser(dataToSave)
            .then((doc) => {
              // return token
              const token = jwt.sign({ id: doc._id }, secretKey, {
                expiresIn: "90d",
              });
              // redirect to our react app
              // res.header('Authorization',token)
              // res.header('status','success')

              //
              // https://stdportal.netlify.app/signin
              res.redirect(`${redirectUrl}?status=success&token=${token}`);
              // uncomment below code for alternate solution
              // res.status(201).json({
              //   status: "success",
              //   token,
              // });
            })
            .catch((err) => {
              return next(new AppError(`Err saving db: ${err.message}`, 500));
            });
        })
        .catch((err) => {
          return next(
            new AppError(
              `Issues getting userInfo from acTkn:${err.message}`,
              500
            )
          );
        });
    })
    .catch((err) => {
      return next(new AppError(`Issues getting acTkn:${err.message}`, 500));
    });
};

module.exports.protect = async (req, res, next) => {
  // check if user is logged in
  // if yes than attach it to request

  // if token is invalid or expired we will set status to fail
  // and on client side redirect user to google login link

  let token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.json({
      status: "fail tkn",
      message: "no token",
    });
  }
  promisify(jwt.verify)(token, secretKey)
    .then(async (decoded) => {
      //  find user add to request and call next()
      const loggedUser = await userModel.findOne({ _id: decoded.id });

      if (!loggedUser) {
        return res.json({
          status: "fail tkn",
          message: "no user found",
        });
      }
      req.loggedUser = loggedUser;
      next();
    })
    .catch((err) => {
      return res.json({
        status: "fail tkn",
        message: `expired or invalid token : ${err.message}`,
      });
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
module.exports.updateUser = async (req, res, next) => {
  // user is logged in here
  // bio, college ,designation are allowed update fields

  const filteredBody = filterObj(
    req.body,
    "bio",
    "college",
    "designation",
    "department"
  );
  if (!filteredBody) {
    return next(
      new AppError(
        "can only update bio,collegeName and designation property",
        400
      )
    );
  }
  try {
    const updatedUser = await userModel.findByIdAndUpdate(
      req.loggedUser._id,
      filteredBody,
      { runValidators: true, new: true }
    );
    let userToSend = updatedUser;
    delete userToSend._id;
    res.json({
      status: "success",
      userToSend,
    });
  } catch (err) {
    return next(new AppError(`err updating: ${err.message}`, 500));
  }
};
// get all teachers that matches the query
module.exports.getTeachers = async (req, res, next) => {
  try {
    const name = req.query?.name;
    let teachers;
    if (!name) {
      // get all teachers
      teachers = await dbManager.getTeachersWithName(true);
    } else {
      teachers = await dbManager.getTeachersWithName(false, name);
    }

    res.json({
      status: "success",
      teachers,
    });
  } catch (err) {
    return next(
      new AppError(`err getting teacher from db ${err.message}`, 500)
    );
  }
};
//
module.exports.getTeacherWithEmail = async (req, res, next) => {
  try {
    const email = req.query?.email;
    let teacher;
    if (!email) {
      // get all teachers
      return next(
        new AppError(
          `err getting teacher email needed in query${err.message}`,
          500
        )
      );
    } else {
      teacher = await dbManager.getTeacherWithEmail(email);
    }

    res.json({
      status: "success",
      teacher: teacher,
    });
  } catch (err) {
    return next(
      new AppError(`err getting teacher from db ${err.message}`, 500)
    );
  }
};
// get me that user info from token
module.exports.getMeInfo = async (req, res, next) => {
  try {
    const user = await dbManager.getMongoUserFromToken(req.loggedUser._id);
    res.json({
      status: "success",
      user,
    });
  } catch (err) {
    return next(
      new AppError(`err getting user from token: ${err.message}`, 500)
    );
  }
};

module.exports.getNotesFromEmail = async (req, res, next) => {
  try {
    const email = req.query?.email;
    if (!email) {
      return next(
        new AppError(
          `email is neccessary for getting notes data: ${err.message}`,
          500
        )
      );
    }
    const notes = await dbManager.getNotesForUser(email);
    res.json({
      status: "success",
      notes,
    });
  } catch (err) {
    return next(
      new AppError(`err getting user from token: ${err.message}`, 500)
    );
  }
};
// delete notes
module.exports.deleteNotesWithId = async (req, res, next) => {
  try {
    const id = req.query?.id;
    if (!id) {
      return next(
        new AppError(
          `id is neccessary for deleting notes data: ${err.message}`,
          500
        )
      );
    }
    const note = await notesModel.findOne({ _id: id });
    if (!note) {
      return next(
        new AppError(`note not found with that id: ${err.message}`, 500)
      );
    }
    if (!(req.loggedUser.email === note.postedBy)) {
      return next(
        new AppError(
          `only owner can delete its particular note: ${err.message}`,
          500
        )
      );
    }
    await dbManager.deleteNotesWithId(id, note);
    res.json({
      status: "success",
    });
  } catch (err) {
    return next(new AppError(`err deleting note: ${err.message}`, 500));
  }
};
