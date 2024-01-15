const bcrypt = require("bcrypt");
const auth = require("../auth");
const User = require("../models/User");

const maskedPassword = (password) => {
  return "*".repeat(5)
}

module.exports.registerUser = (req, res) => {
  return User.findOne({email: req.body.email})
  .then((result) => {
    if (result){
      return res.status(403).send({message: 'User already exists'})
    } else {
      if (req.body.password.length < 8) {
        return res.status(400).send({message: 'Password must be at least 8 characters long'})
      } else {
        let newUser = new User({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password, 10),
          isAdmin: req.body.isAdmin,
          mobileNo: req.body.mobileNo,
        });
        return newUser.save()
        .then((savedUser, err) => {
          if(err){
            return res.status(400).send({message: "Error saving user"})
          } else {
            return res.status(201).send({message: "Registered Succesfully", savedUser: {
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              email: req.body.email,
              password: maskedPassword(req.body.password),
              isAdmin: req.body.isAdmin,
              mobileNo: req.body.mobileNo,
            }})
          }
        })
        .catch((message)=>{
          return res.status(500).send({message})
        });
      }
    }
  })
  .catch((message)=>{
    return res.status(500).send({message})
  });
};

const passwordAttempts = {}

module.exports.loginUser = (req, res) => {
  return User.findOne({ email: req.body.email }).then((result) => {
    if (!passwordAttempts[req.body.email]){
      passwordAttempts[req.body.email] = 0;
    }
    if (req.body.email.length === 0){
      return res.status(404).send({message: 'Please enter an email.'})
    }
    if (!result) {
      return res.status(404).send({message: 'No registered email found.'})
    } else {
      const cooldownTime = 5000; // 5000 milliseconds (5 seconds)
      
      if (passwordAttempts[result.email] >= 3) {
        const currentTime = new Date().getTime();
        
        if (currentTime - passwordAttempts.lastAttemptTime < cooldownTime) {
          return res.status(403).send({ message: 'Please wait for 5 seconds before trying again' });
        }
        
        setTimeout(() => {
          passwordAttempts[result.email] = 0;
          console.log('Password timer reset successfully');
        }, cooldownTime);
        
        passwordAttempts.lastAttemptTime = currentTime;
        
        return res.status(403).send({ message: 'Please try again in 5 seconds' });
      }
      const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);
      if (isPasswordCorrect) {
        passwordAttempts[result.email] = 0;
        console.log(passwordAttempts[result.email])
        return res.status(200).send({ message: 'Successfully logged in', access_token: auth.createAccessToken(result) });
      } else {
        passwordAttempts[result.email]++;
        console.log(passwordAttempts[result.email])
        return res.status(403).send({ message: "Password does not match" });
      }
    }
  })
  .catch((message)=>{
    console.log(passwordAttempts[req.body.email])
    return res.status(500).send({message: "error"})
  });
};

module.exports.userDetails = (req, res) => {
  return User.findById(req.user.id)
  .then((result) => {
    if (!result){
      return res.status(404).send({message: 'No user found'});
    } else {
      return res.status(200).send({result: 
        {
          id: req.user.id,
          firstName: result.firstName,
          lastName: result.lastName,
          email: result.email,
          password: maskedPassword(result.password),
          isAdmin: result.isAdmin,
          mobileNo: result.mobileNo,
        }
      })
    }
  })
  .catch((err)=>{
    return res.status(500).send({internal_error: err})
  });
};

module.exports.getAllUsers = (req, res) => {
  return User.find({})
  .then((result)=>{
    if(!result){
      return res.status(404).send({message: 'No users in the database', result});
    } else {
      return res.status(200).send({result: result})
    }
  })
  .catch((err)=>{
    return res.status(500).send({internal_error: err})
  });
}

module.exports.updateAdmin = (req, res) => {
  User.findById(req.user.id)
  .then((result)=>{
    console.log(result)
    if (!result || !result.isAdmin){
      res.status(401).send({ message: 'Unauthorized. Only admin users can update other users to admin.' });
    } else {
      User.findByIdAndUpdate(req.params.userId, {isAdmin: true, new: true})
      .then((user)=>{
        if(user.isAdmin == true){
          res.status(409).send({message: `User ${user.firstName} is already an admin.`})
        }
        if(!user){
          res.status(404).send({message: 'User not found'})
        } else {
          res.status(200).send({message: `User ${user.firstName} has been updated as an admin successfully`})
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
  User.findById(req.user.id)
  .then((result)=>{
    if(!result){
      return res.status(404).send({message: 'No user found'});
    } else {
      if (req.body.password.length < 8) {
        return res.status(400).send({message: 'Password must be at least 8 characters long'})
      }
      
      User.findByIdAndUpdate(req.user.id, {password: bcrypt.hashSync(req.body.password, 10), new: true})
      .then((updated)=>{
        if(updated.password === req.body.password){
          return res.status(403).send({message: 'User password did not updated because it is still the same.'})
        }
        
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