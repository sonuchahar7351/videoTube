const express = require('express');
const cors=require('cors');
const cookieparser=require('cookie-parser');

const app=express();
app.use(cors({
      origin:process.env.CORS_ORIGIN,
      credentials:true
}));

app.use(express.json({limit:"10kb"}));
app.use(express.urlencoded({extended:true,limit:"10kb"}));
app.use(express.static("public"));
app.use(cookieparser())

// routes  
const userRouter=require('./routes/user.routes.js')


// routes declaration 
 app.use("/api/v1/users",userRouter);
 

module.exports=app;