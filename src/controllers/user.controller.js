
// const asyncHandler=require('../utils/asyncHandler.js');

const asyncHandler = require("../utils/asyncHandler.js");
const ApiError=require('../utils/ApiError.js');
const User =require('../models/user.model.js');
const uploadCloudinary=require('../utils/cloudinary.js');
const ApiResponse=require('../utils/ApiResponse.js');
const jwt=require('jsonwebtoken');
const upload = require("../middlewares/multer.middleware.js");

const generateAccessAndRefreshTokens=async(userId)=>{
   try {
      const user = await User.findById(userId);
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();
    
     user.refreshToken=refreshToken;
     await user.save({validateBeforSave:false}) ;

     return {accessToken,refreshToken};
    
   } catch (error) {
    throw new ApiError(500,"sommething went wrong while generating refresh and access token")
   }
}

const registerUser= asyncHandler(async(req,res,next)=>{
     // get user details from frontend
     // validation - not empty 
     // check if user already exists : username, email 
     // check for images, check for  avatar 
     // upload them to cloudinary , avatar 
     // create user object - create entry in db 
     // remove password and refresh token from response 
     // check for user creation 
     // return res 


     const {fullName,email,username,password}=req.body
    //  console.log("email",email);

     if(
       [fullName,email,username,password].some((field)=>field?.trim()==="")
     ){
      return next(new ApiError(500, "all fields are required"));
     }
     
    const existedUser=await User.findOne({
      $or:[{username},{email}]
    })
   
    if(existedUser){
      return next(new ApiError(500, "user already exists"));
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
      next(new ApiError(500, 'avatar is required'));
    }

    const avatar = await uploadCloudinary(avatarLocalPath)
    const coverImage = await uploadCloudinary(coverImageLocalPath)

    if (!avatar) {
      return next(new ApiError(500, "Something went wrong while registering the user"));
    }

 const user=await User.create({
      fullName,
      avatar:avatar.url,
      coverImage:coverImage?.url || "",
      email,
      password,
      username:username.toLowerCase()
})
 const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
 )
 if(!createdUser){
  return next(new ApiError(500, "Something went wrong while registering the user"));
 }

return res.status(201).json(
      new ApiResponse(201,createdUser,"user registered succesfully")
)

});

const loginUser=asyncHandler(async (req,res)=>{

    // req body -> data 
    // username or email 
    // find the user 
    // password check 
    // access and refresh token 
    // send cookie 
    const {email,username,password}=req.body;
     if(!(username || email)){
      throw new ApiError(400,"username or email is required");
     }

    const user = await User.findOne({$or:[{username},{email}]});
    if(!user){
      throw new ApiError(400,"user does not exists")
    }

   const isPasswordValid=await user.isPasswordCorrect(password);
   if(!isPasswordValid){
     throw new ApiError(400,"password incorrect");
   }
  
 const {accessToken,refreshToken}= await generateAccessAndRefreshTokens(user._id);

    const loginedUser=await User.findById(user._id).select("-password -refreshToken");

    const options={
      httpOnly:true,
      secure:true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshtoken",refreshToken,options)
    .json(
      new ApiResponse(
        200,{
          user:loginedUser,accessToken,refreshToken
        },
        "User logged in Successfully"
      )
    )

})


const logoutUser=asyncHandler(async (req,res)=>{
  console.log(req.user._id);
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set:{
          refreshToken:undefined
        }
      },
      {
        new:true
      }
    )
    const options = {
      httpOnly:true,
      secure:true
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"user logged out"))
})

const refreshAccessToken=asyncHandler(async (req,res)=>{
    const incomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken){
      throw new ApiError(400,"unauthorized request")
    }

try {
  const decodedToken=jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  )
   const user=await User.findById(decodedToken?._id);
   if(!user){
    throw new ApiError(401,"invalid refresh token")
   }
  
   if(incomingRefreshToken !== user?.refreshToken){
    throw new ApiError(400,"refresh token is expired or used")
   }
  
   const options = {
    httpOnly:true,
    secure:true
   }
   const {accessToken, newrefreshToken}= await generateAccessAndRefreshTokens(user._id)
    
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newrefreshToken,options)
    .json(
      new ApiResponse(
        200,
        {accessToken,refreshToken:newrefreshToken},
        "Accees token refreshed"
      )
    )
  
  
} catch (error) {
    throw new ApiError(401,error?.message || "invalid refresh token");
  
}
})


const changeCurrentPassword=asyncHandler(async (req,res)=>{
  
    const {oldPassword,newPassword}=req.body;

    const user=await User.findById(req.user?._id)
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
      throw new ApiError(400,"invalid old password")
    }

    user.password=newPassword
    await user.save({validateBeforSave:false})

    return res.status(200).json(new ApiResponse(200,{},"password changed succesfully"))

})


const getCurrentUser = asyncHandler(async (req,res)=>{
  return res.status(200).json(200,req.user,"current user fetched successfully");
})


const updateAccountDetails=asyncHandler(async (req,res)=>{
  const {fullName,email}=req.body;

  if(!(fullName || email)){
    throw new ApiError(400,"All field are required")
  }
  const user = await User.findByIdAndUpdate(req.user?._id,{
     $set:{
       fullName:fullName,
       email:email
     }
  },{new:true})

   .select("-password")
   return res.status(200)
   .json(new ApiResponse(200,user,"Account detail updated successfully"));

})

const avatarUpdate=asyncHandler(async(req,res)=>{
     const avatarLocalPath=req.file?.path
     if(!avatarLocalPath){throw new ApiError(400,"avatar file is missing")}

       const avatar = await uploadCloudinary(avatarLocalPath)
       if(!avatar){throw new ApiError(400,"error while uploading on server")}
       const user=await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            avatar:avatar.url
        }
       },{new:true}).select("-password")

       return res.json(new ApiResponse(200,user,"cover image is updated successfully")) 
})

const coverImageUpdate=asyncHandler(async(req,res)=>{
  const coverImageLocalPath=req.file?.path
  if(!coverImageLocalPath){throw new ApiError(400,"cover image  file is missing")}

    const coverImage = await uploadCloudinary(coverImageLocalPath)
    if(!coverImage){throw new ApiError(400,"error while uploading on server")}
    const user=await User.findByIdAndUpdate(req.user?._id,{
     $set:{
         coverImage:coverImage.url
     }
    },{new:true}).select("-password")

    return  res.json(new ApiResponse(200,user,"cover image is updated successfully")) 
})



module.exports={registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateAccountDetails,avatarUpdate,coverImageUpdate};