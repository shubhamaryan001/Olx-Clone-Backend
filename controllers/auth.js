const User = require("../models/user");
const { errorHandler } = require("../helpers/dbErrorHandler");
const _ = require("lodash");
const jwt = require("jsonwebtoken"); // to generate signed token
const expressJwt = require("express-jwt"); // for authorization check
var check = require("check-types");

exports.signup = (req, res) => {
  const newuser = new User(req.body);

  newuser.save((err, user) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err)
      });
    }
    user.salt = undefined;
    user.hashed_password = undefined;
    res.json({ user });
  });
};

exports.signin = (req, res) => {
  // find the user based on email
  const { mobile, password } = req.body;

  User.findOne({ mobile: mobile }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User with that email does not exist. Please signup"
      });
    }
    // if user is found make sure the email and password match
    // create authenticate method in user model
    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: "Email and password dont match"
      });
    }

    // generate a signed token with user id and secret
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    // persist the token as 't' in cookie with expiry date
    res.cookie("t", token, { expire: new Date() + 9999 });
    // return response with user and token to frontend client
    const { _id, name, username, email, mobile, role } = user;
    return res.json({
      token,
      user: { _id, email, username, name, role, mobile }
    });
  });
};
