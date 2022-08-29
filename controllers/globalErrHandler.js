const globalErrHandler = (err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    status: "fail",
    message: err.message,
  });
};

module.exports = globalErrHandler;
