const bcrypt = require("bcrypt");
const auth = require("../auth");

const User = require("../models/User");

module.exports.registerUser = (req, res) => {
  return User.findOne({email: req.body.email})
  .then((result) => {
    if (result){
      res.status(403).send({message: 'User already exists'})
    } else {
      let newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        isAdmin: req.body.isAdmin,
        mobileNo: req.body.mobileNo,
      });
      return newUser.save().then((user) =>
      res.status(201).send({message: "Registered Succesfully",})
      );
    }})
    .catch((err)=>{
      res.status(500).send({internal_error: err})
  });
};

module.exports.loginUser = (req, res) => {
  return User.findOne({ email: req.body.email }).then((result) => {
    if (!result) {
      return res.status(404).send({message: 'No user found.'})
    } else {
      // verify password
      // give jwt / create access token
      const isPasswordCorrect = bcrypt.compareSync(
        req.body.password,
        result.password
        );
        
        if (isPasswordCorrect) {
          return res.status(200).send({ access: auth.createAccessToken(result) });
        } else {
          return res
          .status(403)
          .send({ message: "Password does not match" });
        }
      }
    });
  };

  module.exports.userDetails = (req, res) => {
    // console.log(req.user.id)
    return User.findById(req.user.id)
    .then((result) => {
        if (!result){
            return res.status(404).send({message: 'No user found'});
        } else {
            return res.status(200).send({result: result})
        }
    })
    .catch((err)=>{
        return res.status(500).send({internal_error: err})
    })
}

module.exports.updateAdmin = (req, res) => {
    const requestingAdmin = req.user.id;
    const targetUserId = req.params.userId;
     User.findById(requestingAdmin)
    .then((result)=>{
        console.log(result)
        if (!result || !result.isAdmin){
            res.status(401).send({ message: 'Unauthorized. Only admin users can update other users to admin.' });
        } else {
            User.findByIdAndUpdate(req.params.userId, {isAdmin: true, new: true})
            .then((user)=>{
                if(!user){
                    res.status(404).send({message: 'User not found'})
                } else {
                    res.status(200).send({message: 'User updated as an admin successfully'})
                }
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send({ message: 'Internal server error.' });
              });
        }
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send({ message: 'Internal server error.' });
      });
}

module.exports.updatePassword = (req, res) => {
    console.log(req.user.id);
    User.findById(req.user.id)
    .then((result)=>{
        if(!result){
            return res.status(404).send({message: 'No user found'});
        } else {
            User.findByIdAndUpdate(req.user.id, {password: req.body.password, new: true})
            .then((updated)=>{
                if(!updated){
                    return res.status(500).send({message: 'User password is not updated'});
                } else{
                    return res.status(200).send({message: 'User password is updated'})
                }
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send({ message: 'Internal server error.' });
              });
        }
    })
    .catch((error) => {
		console.error(error);
		res.status(500).send({ message: 'Internal server error.' });
	  });
}