const express = require("express");
const router = express.Router();
const auth = require('../auth');
const { verify, verifyAdmin } = auth;
const passport = require("passport");

const userController = require("../controllers/userController");

router.post("/", userController.registerUser);
router.post("/login", userController.loginUser);
router.get('/details', verify, userController.userDetails);
router.get('/', verify, verifyAdmin, userController.getAllUsers);
router.patch('/update-password', verify, userController.updatePassword)
router.patch('/:userId/set-as-admin', verify, verifyAdmin, userController. updateAdmin)


// GOOGLE

router.get('/google', 
	passport.authenticate('google', {
	scope: ['email', 'profile'],
	prompt: "select_account"
	}
));

// Route for DECISION MAKING if success or fail
router.get('/google/callback', 
	passport.authenticate('google', {
	failureRedirect: '/users/failed'
	}),
	function(req,res){
		res.redirect('/users/success')
	}
)

router.get("/failed", (req, res) => {
	console.log('User is not authenticated');
	res.send("Failed");
});

router.get("/success", auth.isLoggedIn, (req, res) => {
	console.log('You are logged in');
	console.log(req.user);
	res.send(`Welcome ${req.user.displayName}`)
});

router.get("/logout", (req, res) => {
	req.session.destroy((err) => {
		if(err){
			console.log('Error while destroying session', err);
		}else{
			req.logout(()=>{
				console.log('You are logged out');
				res.redirect('/products');
			})
		}
	})
})

module.exports = router;