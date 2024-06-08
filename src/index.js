require('dotenv').config();
const app=require("./app.js");
const connectDB=require('./db/index.js');


connectDB()
.then(()=>{
      app.listen(process.env.PORT || 8000,()=>{console.log("server is runnion on ",process.env.PORT)});
})
.catch((err)=>{console.log("MongoDB connection failed ",err)});