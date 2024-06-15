const { registerUser, loginUser, logoutUser, refreshAccessToken } = require('../controllers/user.controller.js');
const verifyJwt = require('../middlewares/auth.middleware.js');
//const asyncHandler=require('../utils/asyncHandler.js')
const upload = require('../middlewares/multer.middleware.js')
const express=require('express');
const router=express.Router();

router.route("/register").post(
      upload.fields([
          {
              name: "avatar",
              maxCount: 1
          }, 
          {
              name: "coverImage",
              maxCount: 1
          }
      ]),
      registerUser
      )

router.route("/login").post(loginUser)

// secured routes 

router.route("/logout").post(verifyJwt, logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

module.exports=router;



