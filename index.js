require("dotenv").config({ path: "./config.env" });
const express = require("express");
const app = express();
const globalErrHandler = require("./controllers/globalErrHandler");
const mongoose = require("mongoose");
const userRouter = require("./routes/userRoutes");
const questionRouter = require("./routes/questionRoutes");
const commentRouter = require("./routes/commentRoutes");
const cors = require("cors");
const socketIo = require("socket.io");
const http = require("http");
const process = require("process");
const os = require("os");
const cluster = require("cluster");
const fileupload = require("express-fileupload");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  fileupload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

var corsOptions = {
  origin: "https://stdportal.netlify.app",
  // origin: "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
const productionDBUrl = process.env.Production_Database_Url;
const developmentDBUrl = "mongodb://localhost:27017/portal";
// set prod or dev mode
let url = productionDBUrl;
if (process.env.DEVELOPMENT_MODE) {
  url = developmentDBUrl;
  // corsOptions.origin = corsOptions.origin + " " + "http://localhost:3000";
  corsOptions.origin = "http://localhost:3000";
}
mongoose
  .connect(url)
  .then(() => {
    console.log("DB connected successfully");
  })
  .catch((err) => {
    console.log("err connecting db: ", err);
  });
// console.log(corsOptions);
app.use(cors(corsOptions));
app.use("/api/v1/user", userRouter);
app.use("/api/v1/question", questionRouter);
app.use("/api/v1/comment", commentRouter);

app.use(globalErrHandler);

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = socketIo(server);

io.on("connection", (socket) => {
  console.log("new client connected", socket.handshake.query.username);
  io.emit("new_conn", { name: socket.handshake.query.username });
  socket.on("message", (data) => {
    io.emit("message", data);
  });
  socket.on("disconnect", () => {
    console.log("client Disconnected");
  });
});
const numCpus = os.cpus().length;
process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Rejection at:", promise, " err:", reason);
});
if (cluster.isMaster) {
  // Fork the workers

  for (let i = 0; i < numCpus; i++) {
    cluster.fork();
  }
} else {
  server.listen(PORT, () => {
    console.log(`server started on port ${PORT}`);
    console.log(`worker ${process.pid} started`);
  });
}
