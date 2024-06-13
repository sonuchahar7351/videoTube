const registerUser = require('../controllers/user.controller.js');
//const asyncHandler=require('../utils/asyncHandler.js')
const upload = require('../middlewares/multer.middleware.js')
const express=require('express');
const router=express.Router();

router.route("/register").post(upload.fields([
      {
            name:"avatar",
            maxCount:1
      },
      {
            name:"coverimage",
            maxCount:1
      }
]),

registerUser)

module.exports=router;



