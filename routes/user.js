const express = require("express");
const router = express.Router();
const auth = require('../auth');
const { verify, verifyAdmin } = auth;

const userController = require("../controllers/userController");

router.post("/", userController.registerUser);
router.post("/login", userController.loginUser);
router.get('/details', verify, userController.userDetails);
router.patch('/update-password', verify, userController.updatePassword)
router.patch('/:userId/set-as-admin', verify, verifyAdmin, userController. updateAdmin)
module.exports = router;
