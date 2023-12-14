// To access and load environment variables from .env file into process.env
require('dotenv').config();
// Passport helps manage user authentication using different methods like email/password or OAuth;
const passport = require("passport");
// Strategy designed for passport, allowing you to authenticate users using their google accounts
const GoogleStrategy = require('passport-google-oauth20').Strategy

// Set up Google OAuth 2.0 authentication strategy with the use of 'passport'
passport.use(new GoogleStrategy({
	clientID: process.env.clientID,
	clientSecret: process.env.clientSecret,
	// The callbackURL is where users are redirected after trying to sign in
	callbackURL: "http://localhost:4000/users/google/callback",
	// This allows access to request-related information passed as argument during authenication
	passReqToCallBack:true
	},
	// This callback function returns the "profile" of the email used in the Google login containing the user information (e.g email, firstname, lastname)
	function(request, accessToken, refreshToken, profile, done){
		return done(null, profile);
	}
));

// 'SAVE' the user's information into a secret box (session)
passport.serializeUser(function(user, done){
	done(null, user);
})

// 'RETRIEVE' the user's information from the secret box (session)
passport.deserializeUser(function(user, done){
	done(null, user);
})