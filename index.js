// ---------------- DEPENDENCIES -----------------
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require('./routes/user')
const productRoutes = require('./routes/productRoute');
const cartRoutes = require('./routes/cartRoute');

const port = process.env.PORT || 4000;

//----------------- MIDDLEWARES ------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())

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
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
