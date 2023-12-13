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
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  isAdmin: {
    type: Boolean,
    default: true,
  },
  mobileNo: {
    type: String,
    required: [true, "Mobile number is required"],
  },
});

module.exports = mongoose.model("User", userSchema);
