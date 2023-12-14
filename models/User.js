const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // ID will generate once created
  firstName: {
    type: String,
    required: [true, "firstName name is required"],
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    validate: {
      validator: function(value) {
        // Use a regular expression to check if the email contains "@" symbol
        return /\@/.test(value);
      },
      message: 'Email must contain the "@" symbol'
    }
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  isAdmin: {
    type: Boolean,
    default: true,
  },
  mobileNo: {
    type: String,
    required: [true, "Mobile number is required"],
    validate: {
      validator: function(value) {
        // Use a regular expression to check if the mobileNo is exactly 11 characters long
        return /^\d{11}$/.test(value);
      },
      message: 'Mobile Number must be exactly 11 digits long'
    }
  },
});

module.exports = mongoose.model("User", userSchema);
