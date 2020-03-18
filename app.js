const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const expressValidator = require("express-validator");
const cors = require("cors");
const _ = require("lodash");
//App
const app = express();

const server = require("http").createServer(app);

const io = require("socket.io").listen(server);

require("./socket/private")(io);
require("./socket/streams")(io);

require("dotenv").config();

app.use(cors());

//***********import routes***********//
const authRoutes = require("./routes/auth");

//DB
mongoose.connect(
  process.env.DATABASE,
  {
    useNewUrlParser: true,
    useCreateIndex: true
  },
  err => {
    if (!err) {
      console.log("MongoDB Connection Succeeded.");
    } else {
      console.log("Error in DB connection: " + err);
    }
  }
);

//middlewares
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(expressValidator());

//************Routes middlewares************//
app.use("/api", authRoutes);

const port = process.env.PORT || 8000;

server.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
