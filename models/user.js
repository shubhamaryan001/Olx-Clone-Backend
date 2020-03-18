const mongoose = require("mongoose");
const crypto = require("crypto");
const uuidv1 = require("uuid/v1");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
      unique: true
    },
    name: {
      type: String,
      trim: true,
      required: true
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true
    },
    mobile: {
      type: Number,
      trim: true,
      required: true,
      unique: true,
      minlength: 10,
      maxlength: 10,
      default: "9999999999"
    },
    role: {
      type: String,
      default: "Customer",
      enum: ["Customer", "Seller", "Support", "Ad Checker", "Admin"] // enum means string objects
    },
    otpid: { type: String },
    otp: {
      type: Number
    },
    mobileverify: {
      required: false,
      type: Boolean,
      default: false
    },
    otpgentratetime: {
      type: Date
    },
    hashed_password: {
      type: String,
      required: true
    },
    salt: String
  },
  { timestamps: true }
);

// virtual field
userSchema
  .virtual("password")
  .set(function(password) {
    this._password = password;
    this.salt = uuidv1();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

userSchema.methods = {
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },
  encryptPassword: function(password) {
    if (!password) return "";
    try {
      return crypto
        .createHmac("sha1", this.salt)
        .update(password)
        .digest("hex");
    } catch (err) {
      return "";
    }
  }
};

module.exports = mongoose.model("User", userSchema);
