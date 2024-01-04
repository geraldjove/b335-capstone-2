// ---------------- DEPENDENCIES -----------------
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require('./routes/user')
const productRoutes = require('./routes/productRoute');
const cartRoutes = require('./routes/cartRoute');
const orderRoutes = require('./routes/orderRoute');
const passport = require("passport");
const session = require('express-session');
require("./passport");


const port = process.env.PORT || 4004;

//----------------- MIDDLEWARES ------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())

app.get("/b4", (req, res) => {
	res.send("Hello world")
})

app.use(session({
	secret: process.env.clientSecret,
	resave: false,
	saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());


//----------------- DATABASE ---------------------
mongoose.connect(
  "mongodb+srv://admin:admin@capstone2.jqucj09.mongodb.net/capstone-2",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

mongoose.connection.once("open", () =>
  console.log("Connected to MongoDB Atlas")
);

//----------------- PORT ------------------------
app.listen(port, () => {
  console.log(`Server is now running at ${port}`);
});

// ---------------- ROUTES ----------------------
app.use("/b4/users", userRoutes);
app.use("/b4/products", productRoutes);
app.use("/b4/cart", cartRoutes);
app.use("/b4/orders", orderRoutes);