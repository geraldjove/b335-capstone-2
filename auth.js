const jwt = require("jsonwebtoken");
// const secret = "Capstone2API";
require('dotenv').config();

module.exports.createAccessToken = (user) => {
  const data = {
    id: user.id,
    email: user.email,
    isAdmin: user.isAdmin,
  };

  return jwt.sign(data, process.env.SECRET || secret, {});
};

module.exports.verify = (req, res, next) => {
  // console.log(req.headers.authorization);

  let token = req.headers.authorization;

  if (typeof token === "undefined") {
    return res.send({ auth: "Failed. No Token" });
  } else {
    // console.log(token);
    // Removes the "Bearer" string
    token = token.slice(7, token.length);
    // console.log(token);

    jwt.verify(token, process.env.SECRET || secret, function (err, decodedToken) {
      if (err) {
        return res.send({
          auth: "Failed",
          message: err.message,
        });
      } else {
        // console.log("result from verify method:");
        // console.log(decodedToken);

        req.user = decodedToken;

        next();
      }
    });
  }
};

module.exports.verifyAdmin = (req, res, next) => {
  if (req.user.isAdmin) {
    next();
  } else {
    return res.status(403).send({
      auth: "Failed",
      message: "Action Forbidden",
    });
  }
};

// Middleware to check if the user is authenticated
module.exports.isLoggedIn = (req, res, next) =>{
  if(req.user){
      next();
  }
  else{
      res.sendStatus(401);
  }
}
