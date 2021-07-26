const crypto = require("crypto");
const mongoose = require("mongoose");
const slugify = require("slugify");
const dotenv = require("dotenv");
const validator = require("validator");
const bcrypt = require("bcryptjs");

//creating schema for users
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "name is required"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: true,
    validate: [validator.isEmail, "kindly enter a valid email"],
  },
  passwordChangedAt: Date,
  photo: String,
  password: {
    type: String,
    required: [true, "password is required"],
    minlength: [8, "password must be at least 8 charachters"],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "kindly confirm your password"],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: "passwords mismatch",
    },
  },
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
});

//passwords encription
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  //deleting confirmPassword field
  this.confirmPassword = undefined;
  next();
});

//compare passwords (instuntinous meathod)
userSchema.methods.correctPassword = async function (password, userPassword) {
  return await bcrypt.compare(password, userPassword);
};

//compare jwt issuance time with last time of password change
userSchema.methods.changedPasswordAfter = function (jwtTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return changedTimeStamp > jwtTimeStamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  //create new random token
  const resetToken = crypto.randomBytes(32).toString("hex");
  //save hashed token to DB
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  //reset token expires in 10 mins
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

// update passwordChangedAt proberty after password reset
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) {
    return next();
  }
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//don't show deleted users
userSchema.pre(/^find/,function(next){
  this.find({active:{$ne:false}});
  next();
})

//creating User model based on userSchema
const User = mongoose.model("User", userSchema);

module.exports = User;
